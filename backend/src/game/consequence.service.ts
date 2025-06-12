import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository, In } from 'typeorm';
import { isUUID } from 'class-validator';
import {
  Consequence,
  ConsequenceSeverity,
} from './entities/consequence.entity';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { GeminiAiService } from './gemini-ai.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MemoryService } from '../memory/memory.service';
import { MemoryType } from '../memory/entities/memory-record.entity';

export interface GameContext {
  gameSessionId: string;
  characterId: string;
  currentSituation: string;
  characterDescription: string;
}

export interface ActionConsequence {
  description: string;
  timeToTrigger: 'immediate' | 'short' | 'medium' | 'long';
  severity: ConsequenceSeverity;
  isPermanent: boolean;
  affectedEntities: string[];
  id?: string; // Optional ID property for database references
}

export interface PendingConsequence {
  id: string;
  title: string;
  triggerTime: string;
  severity: ConsequenceSeverity;
  description: string;
}

@Injectable()
export class ConsequenceService {
  constructor(
    @InjectRepository(Consequence)
    private consequenceRepository: Repository<Consequence>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    private geminiAiService: GeminiAiService,
    private memoryService: MemoryService,
  ) {}

  /**
   * Đánh giá và tạo các hậu quả từ hành động của người chơi
   *
   * Phương thức này sử dụng AI để phân tích hành động của người chơi và tạo ra các hậu quả
   * phù hợp với ngữ cảnh game. Các hậu quả được lưu trữ trong cơ sở dữ liệu và được theo dõi
   * trong trạng thái game.
   *
   * @param action Hành động của người chơi
   * @param gameContext Ngữ cảnh game hiện tại
   * @returns Danh sách các hậu quả được tạo ra
   */
  async evaluateActionConsequences(
    action: string,
    gameContext: GameContext,
  ): Promise<ActionConsequence[]> {
    // Xác thực dữ liệu đầu vào
    if (!action || !action.trim()) {
      throw new Error('Action cannot be empty');
    }

    if (!gameContext || !gameContext.gameSessionId) {
      throw new Error('Invalid game context');
    }

    // Lấy phiên game với đầy đủ quan hệ
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameContext.gameSessionId },
      relations: ['character', 'currentStoryNode'],
    });

    if (!gameSession) {
      throw new Error(
        `Game session with ID ${gameContext.gameSessionId} not found`,
      );
    }

    if (!gameSession.isActive) {
      throw new Error('Cannot evaluate consequences for inactive game session');
    }

    // Tạo prompt cho AI
    const prompt = `
      Based on the player's action, generate 1-3 realistic consequences that might occur
      in the game world. These should follow naturally from the action and the current
      situation. Consequences can be immediate or delayed, positive or negative, and
      affect different entities in the game world.
      
      Action: ${action}
      Current situation: ${gameContext.currentSituation}
      Character: ${gameContext.characterDescription}
      
      Return your response in JSON format:
      [
        {
          "description": "Detailed description of the consequence",
          "timeToTrigger": "immediate/short/medium/long",
          "severity": "minor/moderate/major/critical",
          "isPermanent": true/false,
          "affectedEntities": ["entity1", "entity2"]
        }
      ]
    `;

    // Gọi AI để tạo hậu quả
    let consequences: ActionConsequence[] = [];
    try {
      const aiResponse = await this.geminiAiService.generateContent(prompt);

      // Trích xuất JSON từ phản hồi AI
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        consequences = JSON.parse(jsonMatch[0]);

        // Xác thực dữ liệu từ AI
        consequences = consequences.filter((consequence) => {
          return (
            consequence.description &&
            ['immediate', 'short', 'medium', 'long'].includes(
              consequence.timeToTrigger,
            ) &&
            ['minor', 'moderate', 'major', 'critical'].includes(
              consequence.severity,
            ) &&
            typeof consequence.isPermanent === 'boolean'
          );
        });
      } else {
        throw new Error('Could not parse JSON from AI response');
      }
    } catch (error) {
      console.error('Error generating or parsing consequences:', error);
      // Fallback: tạo một hậu quả mặc định nếu AI thất bại
      consequences = [
        {
          description: `The action "${action.substring(0, 30)}..." has some unforeseen consequences.`,
          timeToTrigger: 'medium',
          severity: ConsequenceSeverity.MINOR,
          isPermanent: false,
          affectedEntities: ['character'],
        },
      ];
    }

    // Giới hạn số lượng hậu quả để tránh quá tải
    const MAX_CONSEQUENCES = 3;
    if (consequences.length > MAX_CONSEQUENCES) {
      consequences = consequences.slice(0, MAX_CONSEQUENCES);
    }

    // Sử dụng transaction để đảm bảo tính nhất quán của dữ liệu
    return await this.consequenceRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const savedConsequences: ActionConsequence[] = [];
        const pendingConsequencesToAdd: PendingConsequence[] = [];

        // Xử lý từng hậu quả
        for (const consequence of consequences) {
          // Tính toán thời gian kích hoạt
          const triggerTime = this.calculateTriggerTime(
            consequence.timeToTrigger,
          );

          // Tạo và lưu hậu quả
          const consequenceEntity = transactionalEntityManager.create(
            Consequence,
            {
              gameSessionId: gameContext.gameSessionId,
              characterId: gameContext.characterId,
              description: consequence.description,
              triggerTime,
              severity: consequence.severity as ConsequenceSeverity,
              isPermanent: consequence.isPermanent,
              affectedEntities: consequence.affectedEntities || [],
              isTriggered: consequence.timeToTrigger === 'immediate',
              sourceActionId: 'manual-action', // Sử dụng giá trị mặc định thay vì null
              metadata: {
                originalAction: action,
                originalSituation: gameContext.currentSituation,
                createdAt: new Date().toISOString(),
              },
              createdAt: new Date(),
            },
          );

          const savedConsequence = await transactionalEntityManager.save(
            Consequence,
            consequenceEntity,
          );
          savedConsequences.push({ ...consequence, id: savedConsequence.id });

          // Nếu là hậu quả tức thời, tạo bản ghi trong bộ nhớ
          if (consequence.timeToTrigger === 'immediate') {
            await this.memoryService.createMemory({
              characterId: gameContext.characterId,
              title: `Immediate Consequence: ${this.generateConsequenceTitle(consequence)}`,
              content: consequence.description,
              type: MemoryType.CONSEQUENCE,
              importance: this.calculateMemoryImportance(
                consequence.severity as ConsequenceSeverity,
              ),
            });
          }
          // Nếu KHÔNG phải hậu quả tức thời, thêm vào danh sách chờ xử lý
          else {
            pendingConsequencesToAdd.push({
              id: savedConsequence.id,
              title: this.generateConsequenceTitle(consequence),
              triggerTime: triggerTime.toISOString(),
              severity: consequence.severity,
              description:
                consequence.description.substring(0, 100) +
                (consequence.description.length > 100 ? '...' : ''),
            });
          }
        }

        // Cập nhật gameState với các hậu quả đang chờ xử lý
        if (pendingConsequencesToAdd.length > 0) {
          // Khởi tạo gameState nếu cần
          if (!gameSession.gameState) {
            gameSession.gameState = {} as any;
          }

          // Khởi tạo mảng pendingConsequences nếu cần
          if (!gameSession.gameState.pendingConsequences) {
            gameSession.gameState.pendingConsequences = [];
          }

          // Thêm các hậu quả mới vào danh sách
          gameSession.gameState.pendingConsequences = [
            ...gameSession.gameState.pendingConsequences,
            ...pendingConsequencesToAdd,
          ];

          // Giới hạn số lượng hậu quả đang chờ xử lý để tránh memory leak
          const MAX_PENDING_CONSEQUENCES = 50;
          if (
            gameSession.gameState.pendingConsequences.length >
            MAX_PENDING_CONSEQUENCES
          ) {
            // Sắp xếp theo mức độ nghiêm trọng và thời gian kích hoạt
            gameSession.gameState.pendingConsequences.sort(
              (a: PendingConsequence, b: PendingConsequence) => {
                // Ưu tiên giữ lại các hậu quả nghiêm trọng
                const severityComparison =
                  this.getSeverityWeight(b.severity) -
                  this.getSeverityWeight(a.severity);
                if (severityComparison !== 0) return severityComparison;

                // Nếu cùng mức độ nghiêm trọng, ưu tiên các hậu quả sắp kích hoạt
                return (
                  new Date(a.triggerTime).getTime() -
                  new Date(b.triggerTime).getTime()
                );
              },
            );

            // Giữ lại MAX_PENDING_CONSEQUENCES hậu quả quan trọng nhất
            gameSession.gameState.pendingConsequences =
              gameSession.gameState.pendingConsequences.slice(
                0,
                MAX_PENDING_CONSEQUENCES,
              );
          }

          // Lưu gameSession với danh sách hậu quả đã cập nhật
          await transactionalEntityManager.save(GameSession, gameSession);
        }

        return savedConsequences;
      },
    );
  }

  /**
   * Tính toán trọng số của mức độ nghiêm trọng để sắp xếp
   * @param severity Mức độ nghiêm trọng
   * @returns Trọng số số học
   */
  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case ConsequenceSeverity.CRITICAL:
        return 4;
      case ConsequenceSeverity.MAJOR:
        return 3;
      case ConsequenceSeverity.MODERATE:
        return 2;
      case ConsequenceSeverity.MINOR:
      default:
        return 1;
    }
  }

  /**
   * Kích hoạt các hậu quả đang chờ xử lý đã đến thời gian
   *
   * Phương thức này được chạy định kỳ để kiểm tra và kích hoạt các hậu quả
   * đã đến thời gian. Nó cập nhật trạng thái game, tạo bản ghi trong bộ nhớ
   * và áp dụng các hiệu ứng vĩnh viễn nếu có.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async triggerPendingConsequences() {
    try {
      // Tìm các hậu quả đến thời gian kích hoạt
      const pendingConsequences = await this.consequenceRepository.find({
        where: {
          isTriggered: false,
          triggerTime: LessThan(new Date()),
        },
        relations: ['gameSession', 'character'],
      });

      if (pendingConsequences.length === 0) {
        return; // Không có hậu quả nào cần kích hoạt
      }

      // Nhóm các hậu quả theo gameSessionId để tối ưu hóa cập nhật
      const consequencesByGameSession = pendingConsequences.reduce(
        (acc, consequence) => {
          const gameSessionId = consequence.gameSessionId;
          if (!acc[gameSessionId]) {
            acc[gameSessionId] = [];
          }
          acc[gameSessionId].push(consequence);
          return acc;
        },
        {} as Record<string, Consequence[]>,
      );

      // Xử lý từng nhóm hậu quả theo phiên game
      for (const [gameSessionId, consequences] of Object.entries(
        consequencesByGameSession,
      )) {
        // Lấy phiên game một lần duy nhất cho mỗi nhóm
        const gameSession = consequences[0].gameSession;

        // Bỏ qua nếu phiên game không còn hoạt động
        if (!gameSession?.isActive) {
          // Đánh dấu các hậu quả đã được xử lý để tránh kiểm tra lại
          await this.consequenceRepository.update(
            { id: In(consequences.map((c) => c.id)) },
            { isTriggered: true },
          );
          continue;
        }

        // Sử dụng transaction để đảm bảo tính nhất quán
        await this.consequenceRepository.manager.transaction(
          async (transactionalEntityManager) => {
            // Danh sách ID hậu quả cần xóa khỏi gameState.pendingConsequences
            const consequenceIdsToRemove: string[] = [];

            // Xử lý từng hậu quả
            for (const consequence of consequences) {
              // Đánh dấu là đã kích hoạt
              consequence.isTriggered = true;
              await transactionalEntityManager.save(Consequence, consequence);

              // Thêm vào bộ nhớ nhân vật
              await this.memoryService.createMemory({
                characterId: consequence.characterId,
                title: `Delayed Consequence: ${this.generateConsequenceTitle(consequence)}`,
                content: consequence.description,
                type: MemoryType.CONSEQUENCE,
                importance: this.calculateMemoryImportance(
                  consequence.severity,
                ),
              });

              // Thêm ID vào danh sách cần xóa
              consequenceIdsToRemove.push(consequence.id);

              // Áp dụng hiệu ứng vĩnh viễn nếu có
              if (consequence.isPermanent) {
                await this.applyPermanentConsequence(consequence);
              }
            }

            // Cập nhật gameState.pendingConsequences
            if (gameSession.gameState?.pendingConsequences?.length > 0) {
              // Lọc ra các hậu quả không nằm trong danh sách cần xóa
              gameSession.gameState.pendingConsequences =
                gameSession.gameState.pendingConsequences.filter(
                  (pendingConsequence: PendingConsequence) =>
                    !consequenceIdsToRemove.includes(pendingConsequence.id),
                );

              // Lưu gameSession với danh sách đã cập nhật
              await transactionalEntityManager.save(GameSession, gameSession);
            }
          },
        );
      }
    } catch (error) {
      console.error('Error triggering pending consequences:', error);
      // Không throw lỗi ở đây vì đây là một cronjob, chúng ta không muốn nó crash server
    }
  }

  private calculateTriggerTime(timeFrame: string): Date {
    const now = new Date();

    switch (timeFrame) {
      case 'immediate':
        return now;
      case 'short':
        // 1-3 hours
        return new Date(
          now.getTime() + 1000 * 60 * 60 * (1 + Math.random() * 2),
        );
      case 'medium':
        // 6-24 hours
        return new Date(
          now.getTime() + 1000 * 60 * 60 * (6 + Math.random() * 18),
        );
      case 'long':
        // 2-7 days
        return new Date(
          now.getTime() + 1000 * 60 * 60 * 24 * (2 + Math.random() * 5),
        );
      default:
        return now;
    }
  }

  private generateConsequenceTitle(
    consequence: Consequence | ActionConsequence,
  ): string {
    // Extract first sentence or up to 50 characters
    const description = consequence.description;
    const firstSentence = description.split(/[.!?]/, 1)[0];

    if (firstSentence.length <= 50) {
      return firstSentence;
    }

    return firstSentence.substring(0, 47) + '...';
  }

  private calculateMemoryImportance(severity: ConsequenceSeverity): number {
    switch (severity) {
      case ConsequenceSeverity.MINOR:
        return 0.3;
      case ConsequenceSeverity.MODERATE:
        return 0.5;
      case ConsequenceSeverity.MAJOR:
        return 0.7;
      case ConsequenceSeverity.CRITICAL:
        return 0.9;
      default:
        return 0.5;
    }
  }

  private async applyPermanentConsequence(
    consequence: Consequence,
  ): Promise<void> {
    // Handle permanent consequences based on severity
    const character = consequence.character;

    if (!character) {
      return;
    }

    // Add permanent consequence flag to character
    if (!character.attributes) {
      character.attributes = {} as any;
    }

    switch (consequence.severity) {
      case ConsequenceSeverity.CRITICAL:
        // Critical consequences might permanently reduce a stat
        if (this.isCombatRelated(consequence.description)) {
          character.attributes.strength = Math.max(
            1,
            character.attributes.strength - 2,
          );
        } else if (this.isMagicRelated(consequence.description)) {
          character.attributes.mana = Math.max(
            10,
            character.attributes.mana - 20,
          );
        } else if (this.isHealthRelated(consequence.description)) {
          character.attributes.health = Math.max(
            10,
            character.attributes.health - 20,
          );
        }
        break;

      case ConsequenceSeverity.MAJOR:
        // Major consequences might cause a minor stat reduction
        if (this.isCombatRelated(consequence.description)) {
          character.attributes.strength = Math.max(
            1,
            character.attributes.strength - 1,
          );
        } else if (this.isMagicRelated(consequence.description)) {
          character.attributes.mana = Math.max(
            10,
            character.attributes.mana - 10,
          );
        } else if (this.isHealthRelated(consequence.description)) {
          character.attributes.health = Math.max(
            10,
            character.attributes.health - 10,
          );
        }
        break;
    }

    // Save character changes
    await this.characterRepository.save(character);
  }

  private isCombatRelated(description: string): boolean {
    const combatTerms = [
      'wound',
      'scar',
      'injury',
      'combat',
      'battle',
      'fight',
      'sword',
      'weapon',
    ];
    return combatTerms.some((term) => description.toLowerCase().includes(term));
  }

  private isMagicRelated(description: string): boolean {
    const magicTerms = [
      'spell',
      'magic',
      'curse',
      'arcane',
      'wizard',
      'sorcery',
      'enchantment',
    ];
    return magicTerms.some((term) => description.toLowerCase().includes(term));
  }

  private isHealthRelated(description: string): boolean {
    const healthTerms = [
      'disease',
      'illness',
      'sickness',
      'health',
      'injury',
      'poison',
      'wound',
    ];
    return healthTerms.some((term) => description.toLowerCase().includes(term));
  }

  /**
   * Lấy danh sách các hậu quả đang chờ xử lý cho một phiên game
   *
   * Phương thức này trả về danh sách các hậu quả chưa được kích hoạt
   * cho một phiên game cụ thể, sắp xếp theo thời gian kích hoạt.
   *
   * @param gameSessionId ID của phiên game
   * @returns Danh sách các hậu quả đang chờ xử lý
   */
  async getPendingConsequencesForSession(
    gameSessionId: string,
  ): Promise<Consequence[]> {
    // Xác thực đầu vào
    if (!gameSessionId || !isUUID(gameSessionId)) {
      throw new Error('Invalid game session ID');
    }

    try {
      // Lấy danh sách hậu quả từ cơ sở dữ liệu
      const consequences = await this.consequenceRepository.find({
        where: {
          gameSessionId,
          isTriggered: false,
        },
        order: {
          triggerTime: 'ASC',
        },
      });

      // Lấy phiên game để kiểm tra gameState.pendingConsequences
      const gameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSessionId },
      });

      // Nếu không có phiên game hoặc không có hậu quả, trả về mảng rỗng
      if (!gameSession || consequences.length === 0) {
        return consequences;
      }

      // Đảm bảo gameState.pendingConsequences đồng bộ với cơ sở dữ liệu
      // Đây là bước quan trọng để sửa lỗi không đồng bộ giữa hai nguồn dữ liệu
      if (gameSession.gameState?.pendingConsequences) {
        // Lấy tất cả ID hậu quả từ cơ sở dữ liệu
        const consequenceIds = consequences.map((c) => c.id);

        // Lọc ra các hậu quả trong gameState mà không còn tồn tại trong cơ sở dữ liệu
        const validPendingConsequences =
          gameSession.gameState.pendingConsequences.filter(
            (pc: PendingConsequence) =>
              typeof pc === 'object' && pc.id && consequenceIds.includes(pc.id),
          );

        // Nếu có sự khác biệt, cập nhật gameState
        if (
          validPendingConsequences.length !==
          gameSession.gameState.pendingConsequences.length
        ) {
          gameSession.gameState.pendingConsequences = validPendingConsequences;
          await this.gameSessionRepository.save(gameSession);
        }
      }

      return consequences;
    } catch (error) {
      console.error(
        `Error getting pending consequences for session ${gameSessionId}:`,
        error,
      );
      return []; // Trả về mảng rỗng trong trường hợp lỗi
    }
  }
}
