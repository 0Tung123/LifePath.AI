import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MiniGame, MiniGameType, PuzzleType, ReflexGameType } from './entities/mini-game.entity';
import { StoryNode } from './entities/story-node.entity';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';

@Injectable()
export class MiniGameService {
  constructor(
    @InjectRepository(MiniGame)
    private miniGameRepository: Repository<MiniGame>,
    @InjectRepository(StoryNode)
    private storyNodeRepository: Repository<StoryNode>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  async createMiniGame(createMiniGameDto: {
    name: string;
    description: string;
    type: MiniGameType;
    difficulty: number;
    mandatory: boolean;
    completionNodeId?: string;
    failureNodeId?: string;
    rewards?: {
      experience?: number;
      gold?: number;
      items?: {
        id: string;
        name: string;
        quantity: number;
      }[];
      skills?: {
        id: string;
        experience: number;
      }[];
      traits?: Record<string, number>;
    };
    config: Record<string, any>;
  }): Promise<MiniGame> {
    // Validate completion and failure nodes if provided
    if (createMiniGameDto.completionNodeId) {
      const completionNode = await this.storyNodeRepository.findOne({
        where: { id: createMiniGameDto.completionNodeId },
      });
      if (!completionNode) {
        throw new NotFoundException(
          `Completion node with ID ${createMiniGameDto.completionNodeId} not found`,
        );
      }
    }

    if (createMiniGameDto.failureNodeId) {
      const failureNode = await this.storyNodeRepository.findOne({
        where: { id: createMiniGameDto.failureNodeId },
      });
      if (!failureNode) {
        throw new NotFoundException(
          `Failure node with ID ${createMiniGameDto.failureNodeId} not found`,
        );
      }
    }

    // Create mini-game
    const miniGame = this.miniGameRepository.create(createMiniGameDto);
    return this.miniGameRepository.save(miniGame);
  }

  async getMiniGame(id: string): Promise<MiniGame> {
    const miniGame = await this.miniGameRepository.findOne({
      where: { id },
      relations: ['completionNode', 'failureNode'],
    });
    if (!miniGame) {
      throw new NotFoundException(`Mini-game with ID ${id} not found`);
    }
    return miniGame;
  }

  async deleteMiniGame(id: string): Promise<void> {
    const result = await this.miniGameRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Mini-game with ID ${id} not found`);
    }
  }

  async updateMiniGame(
    id: string,
    updateMiniGameDto: Partial<{
      name: string;
      description: string;
      difficulty: number;
      mandatory: boolean;
      completionNodeId: string;
      failureNodeId: string;
      rewards: {
        experience?: number;
        gold?: number;
        items?: {
          id: string;
          name: string;
          quantity: number;
        }[];
        skills?: {
          id: string;
          experience: number;
        }[];
        traits?: Record<string, number>;
      };
      config: Record<string, any>;
    }>,
  ): Promise<MiniGame> {
    const miniGame = await this.getMiniGame(id);

    // Update completion and failure nodes if provided
    if (updateMiniGameDto.completionNodeId) {
      const completionNode = await this.storyNodeRepository.findOne({
        where: { id: updateMiniGameDto.completionNodeId },
      });
      if (!completionNode) {
        throw new NotFoundException(
          `Completion node with ID ${updateMiniGameDto.completionNodeId} not found`,
        );
      }
      miniGame.completionNodeId = updateMiniGameDto.completionNodeId;
    }

    if (updateMiniGameDto.failureNodeId) {
      const failureNode = await this.storyNodeRepository.findOne({
        where: { id: updateMiniGameDto.failureNodeId },
      });
      if (!failureNode) {
        throw new NotFoundException(
          `Failure node with ID ${updateMiniGameDto.failureNodeId} not found`,
        );
      }
      miniGame.failureNodeId = updateMiniGameDto.failureNodeId;
    }

    // Update other fields
    Object.assign(miniGame, updateMiniGameDto);
    return this.miniGameRepository.save(miniGame);
  }

  // Xử lý kết quả mini-game
  async handleMiniGameResult(
    miniGameId: string,
    gameSessionId: string,
    success: boolean,
    score?: number,
  ): Promise<{
    nextNodeId: string;
    rewards?: any;
  }> {
    const miniGame = await this.getMiniGame(miniGameId);
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['character'],
    });

    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    // Xác định node tiếp theo dựa trên kết quả
    const nextNodeId = success 
      ? miniGame.completionNodeId 
      : miniGame.failureNodeId;

    if (!nextNodeId) {
      throw new NotFoundException('No next node defined for this mini-game result');
    }

    // Nếu thành công, áp dụng phần thưởng
    let rewards: any = null;
    if (success && miniGame.rewards) {
      rewards = miniGame.rewards;
      const character = gameSession.character;

      // Cập nhật kinh nghiệm
      if (miniGame.rewards.experience) {
        character.experience += miniGame.rewards.experience;
        
        // Kiểm tra lên cấp
        if (character.experience >= character.experienceToNextLevel) {
          await this.handleLevelUp(character);
        }
      }

      // Cập nhật tiền tệ
      if (miniGame.rewards.gold) {
        if (!character.inventory.currency) {
          character.inventory.currency = {};
        }
        
        if (character.inventory.currency.gold) {
          character.inventory.currency.gold += miniGame.rewards.gold;
        } else {
          character.inventory.currency.gold = miniGame.rewards.gold;
        }
      }

      // Cập nhật vật phẩm
      if (miniGame.rewards.items && miniGame.rewards.items.length > 0) {
        if (!character.inventory.items) {
          character.inventory.items = [];
        }

        for (const rewardItem of miniGame.rewards.items) {
          const existingItem = character.inventory.items.find(
            (item) => item.id === rewardItem.id || item.name === rewardItem.name,
          );

          if (existingItem) {
            existingItem.quantity += rewardItem.quantity;
          } else {
            character.inventory.items.push({
              id: rewardItem.id,
              name: rewardItem.name,
              description: `Reward from ${miniGame.name}`,
              quantity: rewardItem.quantity,
              type: 'reward',
              value: 0,
            });
          }
        }
      }

      // Cập nhật kỹ năng
      if (miniGame.rewards.skills && miniGame.rewards.skills.length > 0) {
        for (const skillReward of miniGame.rewards.skills) {
          if (character.skills) {
            const skill = character.skills.find((s) => s.id === skillReward.id);
            if (skill) {
              skill.experience += skillReward.experience;
              
              // Kiểm tra lên cấp kỹ năng
              if (skill.experience >= skill.experienceToNextLevel) {
                await this.handleSkillLevelUp(character, skill);
              }
            }
          }
        }
      }

      // Cập nhật tính cách
      if (miniGame.rewards.traits) {
        for (const [traitName, value] of Object.entries(miniGame.rewards.traits)) {
          if (character.traits && traitName in character.traits) {
            const currentValue = character.traits[traitName] || 0;
            character.traits[traitName] = currentValue + value;
            
            // Đảm bảo giá trị nằm trong khoảng 0-100
            character.traits[traitName] = Math.max(0, Math.min(100, character.traits[traitName] || 0));
          }
        }
      }

      // Lưu nhân vật đã cập nhật
      await this.characterRepository.save(character);
    }

    return { nextNodeId, rewards };
  }

  // Xử lý lên cấp nhân vật
  private async handleLevelUp(character: Character): Promise<void> {
    character.level += 1;
    character.experience -= character.experienceToNextLevel;
    character.experienceToNextLevel = Math.floor(character.experienceToNextLevel * 1.5);
    character.skillPoints += 1;
    
    // Tăng các chỉ số cơ bản
    character.attributes.strength += 1;
    character.attributes.intelligence += 1;
    character.attributes.dexterity += 1;
    character.attributes.charisma += 1;
    
    // Tăng máu và mana
    character.attributes.health += 10;
    character.attributes.mana += 5;
  }

  // Xử lý lên cấp kỹ năng
  private async handleSkillLevelUp(character: Character, skill: any): Promise<void> {
    if (skill.level < skill.maxLevel) {
      skill.level += 1;
      skill.experience -= skill.experienceToNextLevel;
      skill.experienceToNextLevel = Math.floor(skill.experienceToNextLevel * 1.3);
      
      // Kiểm tra mở khóa kỹ năng con
      if (skill.childSkillIds && skill.childSkillIds.length > 0) {
        for (const childSkillId of skill.childSkillIds) {
          const childSkill = character.skills.find((s) => s.id === childSkillId);
          if (childSkill && childSkill.requiredLevel && childSkill.requiredLevel <= skill.level) {
            // Mở khóa kỹ năng con
            if (!character.skillIds.includes(childSkillId)) {
              character.skillIds.push(childSkillId);
            }
          }
        }
      }
    }
  }
}