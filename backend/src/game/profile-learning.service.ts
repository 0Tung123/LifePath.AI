import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';

@Injectable()
export class ProfileLearningService {
  private readonly logger = new Logger(ProfileLearningService.name);

  constructor(
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
  ) {}

  // Ghi lại quyết định của người chơi
  async recordPlayerDecision(
    gameSessionId: string,
    decisionData: {
      nodeId: string;
      decisionType: string;
      content: string;
      affectedTraits?: Record<string, number>;
      affectedStats?: Record<string, number>;
      affectedFactions?: Record<string, number>;
      tags?: string[];
    },
  ): Promise<void> {
    try {
      const gameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSessionId },
      });

      if (!gameSession) {
        this.logger.error(`Game session with ID ${gameSessionId} not found`);
        return;
      }

      // Xác định trọng số quyết định
      const weight = this.determineDecisionWeight(decisionData.nodeId, decisionData.decisionType);

      // Tạo đối tượng quyết định
      const decision = {
        id: this.generateUniqueId(),
        timestamp: new Date(),
        nodeId: decisionData.nodeId,
        decisionType: decisionData.decisionType,
        content: decisionData.content,
        weight: weight,
        affectedTraits: decisionData.affectedTraits || {},
        affectedStats: decisionData.affectedStats || {},
        affectedFactions: decisionData.affectedFactions || {},
        tags: decisionData.tags || this.generateTagsFromContent(decisionData.content),
      };

      // Thêm quyết định vào lịch sử
      if (!gameSession.decisionHistory) {
        gameSession.decisionHistory = [];
      }
      
      gameSession.decisionHistory.push(decision);

      // Cập nhật hồ sơ chơi game dựa trên quyết định
      await this.updateGameplayProfile(gameSession, decision);

      // Lưu phiên game
      await this.gameSessionRepository.save(gameSession);
    } catch (error) {
      this.logger.error(`Error recording player decision: ${error.message}`);
    }
  }

  // Xác định trọng số quyết định
  private determineDecisionWeight(nodeId: string, decisionType: string): number {
    // Quyết định thay đổi nhánh chính
    if (decisionType === 'main_branch') {
      return 10;
    }

    // Quyết định ảnh hưởng đến tính cách
    if (decisionType === 'trait_changing') {
      return 7;
    }

    // Quyết định ảnh hưởng đến phe phái
    if (decisionType === 'faction_related') {
      return 6;
    }

    // Quyết định thông thường
    return 2;
  }

  // Phân tích nội dung để tạo tags
  private generateTagsFromContent(content: string): string[] {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();

    // Phân tích về chủ đề chiến đấu
    if (lowerContent.includes('đánh') || 
        lowerContent.includes('tấn công') || 
        lowerContent.includes('chiến đấu') ||
        lowerContent.includes('vũ khí') ||
        lowerContent.includes('giết')) {
      tags.push('combat');
      
      if (lowerContent.includes('tấn công') || lowerContent.includes('giết')) {
        tags.push('aggressive');
      }
    }

    // Phân tích về chủ đề hòa bình
    if (lowerContent.includes('đàm phán') || 
        lowerContent.includes('thương lượng') || 
        lowerContent.includes('hòa giải') ||
        lowerContent.includes('giúp đỡ')) {
      tags.push('peaceful');
    }

    // Phân tích về khám phá
    if (lowerContent.includes('khám phá') || 
        lowerContent.includes('tìm kiếm') || 
        lowerContent.includes('điều tra') ||
        lowerContent.includes('đi đến')) {
      tags.push('exploration');
    }

    // Phân tích về thiện/ác
    if (lowerContent.includes('giúp đỡ') || 
        lowerContent.includes('cứu') || 
        lowerContent.includes('bảo vệ')) {
      tags.push('good');
    } else if (lowerContent.includes('lừa dối') || 
               lowerContent.includes('đánh cắp') || 
               lowerContent.includes('tàn nhẫn')) {
      tags.push('evil');
    }

    // Phân tích về mạo hiểm/thận trọng
    if (lowerContent.includes('mạo hiểm') || 
        lowerContent.includes('liều lĩnh')) {
      tags.push('risky');
    } else if (lowerContent.includes('thận trọng') || 
               lowerContent.includes('cẩn thận') ||
               lowerContent.includes('quan sát')) {
      tags.push('cautious');
    }

    return tags;
  }

  // Cập nhật hồ sơ chơi game dựa trên quyết định
  private async updateGameplayProfile(gameSession: GameSession, decision: any): Promise<void> {
    try {
      if (!gameSession.gameplayProfile) {
        gameSession.gameplayProfile = {
          combatPreference: 50,
          dialogueLength: 50,
          explorationTendency: 50,
          moralAlignment: 0,
          riskTolerance: 50,
          difficultyLevel: 3
        };
      }

      // Cập nhật sở thích chiến đấu
      if (decision.tags.includes('combat')) {
        if (decision.tags.includes('aggressive')) {
          gameSession.gameplayProfile.combatPreference += 2;
        } else if (decision.tags.includes('peaceful')) {
          gameSession.gameplayProfile.combatPreference -= 2;
        }
        gameSession.gameplayProfile.combatPreference = Math.max(0, Math.min(100, gameSession.gameplayProfile.combatPreference));
      }

      // Cập nhật khuynh hướng khám phá
      if (decision.tags.includes('exploration')) {
        gameSession.gameplayProfile.explorationTendency += 2;
        gameSession.gameplayProfile.explorationTendency = Math.max(0, Math.min(100, gameSession.gameplayProfile.explorationTendency));
      }

      // Cập nhật thiên hướng đạo đức
      if (decision.tags.includes('good')) {
        gameSession.gameplayProfile.moralAlignment += 2;
      } else if (decision.tags.includes('evil')) {
        gameSession.gameplayProfile.moralAlignment -= 2;
      }
      gameSession.gameplayProfile.moralAlignment = Math.max(-100, Math.min(100, gameSession.gameplayProfile.moralAlignment));

      // Cập nhật chịu đựng rủi ro
      if (decision.tags.includes('risky')) {
        gameSession.gameplayProfile.riskTolerance += 2;
      } else if (decision.tags.includes('cautious')) {
        gameSession.gameplayProfile.riskTolerance -= 2;
      }
      gameSession.gameplayProfile.riskTolerance = Math.max(0, Math.min(100, gameSession.gameplayProfile.riskTolerance));

      // Phân tích độ dài văn bản
      if (decision.decisionType === 'free_input') {
        const wordCount = decision.content.split(' ').length;
        if (wordCount > 20) {
          gameSession.gameplayProfile.dialogueLength += 1;
        } else if (wordCount < 10) {
          gameSession.gameplayProfile.dialogueLength -= 1;
        }
        gameSession.gameplayProfile.dialogueLength = Math.max(0, Math.min(100, gameSession.gameplayProfile.dialogueLength));
      }
    } catch (error) {
      this.logger.error(`Error updating gameplay profile: ${error.message}`);
    }
  }

  // Phân tích phong cách viết của người chơi
  async analyzeWritingStyle(gameSessionId: string, text: string): Promise<void> {
    try {
      const gameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSessionId },
      });

      if (!gameSession) {
        this.logger.error(`Game session with ID ${gameSessionId} not found`);
        return;
      }

      if (!gameSession.gameplayProfile) {
        gameSession.gameplayProfile = {
          combatPreference: 50,
          dialogueLength: 50,
          explorationTendency: 50,
          moralAlignment: 0,
          riskTolerance: 50,
          difficultyLevel: 3
        };
      }

      // Tính toán độ dài trung bình câu
      const sentenceLength = this.calculateAverageSentenceLength(text);

      // Phân tích mức độ trang trọng
      const formality = this.detectFormality(text);

      // Phát hiện giọng điệu
      const tone = this.detectTone(text);

      // Phát hiện mức độ mô tả
      const descriptiveness = this.detectDescriptiveness(text);

      // Cập nhật phong cách viết
      gameSession.gameplayProfile.writingStyle = {
        sentenceLength: sentenceLength,
        formality: formality,
        tone: tone,
        descriptiveness: descriptiveness
      };

      await this.gameSessionRepository.save(gameSession);
    } catch (error) {
      this.logger.error(`Error analyzing writing style: ${error.message}`);
    }
  }

  // Lấy hồ sơ chơi game hiện tại
  async getGameplayProfile(gameSessionId: string): Promise<any> {
    try {
      const gameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSessionId },
      });

      if (!gameSession) {
        this.logger.error(`Game session with ID ${gameSessionId} not found`);
        return null;
      }

      return gameSession.gameplayProfile;
    } catch (error) {
      this.logger.error(`Error getting gameplay profile: ${error.message}`);
      return null;
    }
  }

  // Điều chỉnh nội dung dựa trên hồ sơ người chơi
  async adjustContentBasedOnProfile(gameSessionId: string, content: string): Promise<string> {
    try {
      const gameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSessionId },
      });

      if (!gameSession || !gameSession.gameplayProfile) {
        return content;
      }

      let adjustedContent = content;

      // Điều chỉnh độ dài văn bản
      if (gameSession.gameplayProfile.dialogueLength > 70) {
        adjustedContent = this.expandContent(content);
      } else if (gameSession.gameplayProfile.dialogueLength < 30) {
        adjustedContent = this.condenseContent(content);
      }

      // Điều chỉnh giọng điệu nếu phát hiện được
      if (gameSession.gameplayProfile.writingStyle?.tone) {
        adjustedContent = this.adjustTone(adjustedContent, gameSession.gameplayProfile.writingStyle.tone);
      }

      return adjustedContent;
    } catch (error) {
      this.logger.error(`Error adjusting content: ${error.message}`);
      return content;
    }
  }

  // Hàm hỗ trợ
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private calculateAverageSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = sentences.reduce((count, sentence) => {
      return count + sentence.split(/\s+/).filter(w => w.length > 0).length;
    }, 0);
    
    return totalWords / sentences.length;
  }

  private detectFormality(text: string): number {
    // Đơn giản hóa: đếm từ trang trọng vs từ thông thường
    const formalWords = ['kính thưa', 'xin phép', 'trân trọng', 'kính mời', 'bản thân', 'tại hạ'];
    const informalWords = ['tớ', 'cậu', 'ừ', 'ờ', 'vậy đó', 'thôi mà'];
    
    let formalCount = 0;
    let informalCount = 0;
    
    const lowerText = text.toLowerCase();
    formalWords.forEach(word => {
      if (lowerText.includes(word)) formalCount++;
    });
    
    informalWords.forEach(word => {
      if (lowerText.includes(word)) informalCount++;
    });
    
    // Thang điểm 0-100, 0 là không trang trọng, 100 là rất trang trọng
    if (formalCount + informalCount === 0) return 50;
    return Math.min(100, Math.max(0, 50 + (formalCount - informalCount) * 10));
  }

  private detectTone(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Đếm từ chỉ cảm xúc khác nhau
    const tones = {
      humorous: ['cười', 'vui', 'hài hước', 'đùa', 'haha', 'hihi'],
      serious: ['nghiêm túc', 'trách nhiệm', 'cẩn trọng', 'quan trọng'],
      aggressive: ['tức giận', 'giận dữ', 'phẫn nộ', 'căm phẫn', 'đánh'],
      formal: ['kính thưa', 'trân trọng', 'xin phép'],
      friendly: ['thân thiện', 'vui vẻ', 'thân ái', 'thân mến'],
      neutral: []
    };
    
    const toneCounts: Record<string, number> = {};
    for (const [tone, words] of Object.entries(tones)) {
      toneCounts[tone] = words.filter(word => lowerText.includes(word)).length;
    }
    
    // Tìm giọng điệu nổi bật nhất
    let maxTone = 'neutral';
    let maxCount = 0;
    
    for (const [tone, count] of Object.entries(toneCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxTone = tone;
      }
    }
    
    return maxTone;
  }

  private detectDescriptiveness(text: string): number {
    // Tính tỉ lệ tính từ và trạng từ
    const descriptiveWords = ['đẹp', 'xấu', 'to', 'nhỏ', 'nhanh', 'chậm', 'tốt', 'tuyệt', 'tồi', 'mạnh', 'yếu'];
    const words = text.toLowerCase().split(/\s+/);
    
    let descriptiveCount = 0;
    descriptiveWords.forEach(word => {
      descriptiveCount += words.filter(w => w.includes(word)).length;
    });
    
    // Thang điểm 0-100
    return Math.min(100, Math.max(0, descriptiveCount * 10));
  }

  private expandContent(content: string): string {
    // Phương pháp đơn giản: thêm một số từ mô tả vào nội dung
    // Trong thực tế, cần AI để làm việc này tốt hơn
    return content + " Điều này thật sự khiến bạn suy nghĩ về những khả năng và hậu quả có thể xảy ra trong tương lai.";
  }

  private condenseContent(content: string): string {
    // Phương pháp đơn giản: rút ngắn nội dung nếu quá dài
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return content;
    
    return sentences.slice(0, 2).join('. ') + '.';
  }

  private adjustTone(content: string, tone: string): string {
    // Trong thực tế, cần AI để làm việc này tốt hơn
    switch (tone) {
      case 'humorous':
        return content + " Thật thú vị phải không nào?";
      case 'serious':
        return content + " Đây là vấn đề cần xem xét một cách nghiêm túc.";
      case 'aggressive':
        return content + " Đừng do dự nếu cần phải hành động mạnh mẽ!";
      case 'formal':
        return content + " Xin hãy cân nhắc cẩn thận trước khi tiếp tục.";
      case 'friendly':
        return content + " Mình nghĩ chúng ta sẽ cùng vượt qua được thử thách này.";
      default:
        return content;
    }
  }
}