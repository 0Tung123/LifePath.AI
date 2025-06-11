"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProfileLearningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileLearningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const game_session_entity_1 = require("./entities/game-session.entity");
const character_entity_1 = require("./entities/character.entity");
let ProfileLearningService = ProfileLearningService_1 = class ProfileLearningService {
    constructor(gameSessionRepository, characterRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.characterRepository = characterRepository;
        this.logger = new common_1.Logger(ProfileLearningService_1.name);
    }
    async recordPlayerDecision(gameSessionId, decisionData) {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: gameSessionId },
            });
            if (!gameSession) {
                this.logger.error(`Game session with ID ${gameSessionId} not found`);
                return;
            }
            const weight = this.determineDecisionWeight(decisionData.nodeId, decisionData.decisionType);
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
            if (!gameSession.decisionHistory) {
                gameSession.decisionHistory = [];
            }
            gameSession.decisionHistory.push(decision);
            await this.updateGameplayProfile(gameSession, decision);
            await this.gameSessionRepository.save(gameSession);
        }
        catch (error) {
            this.logger.error(`Error recording player decision: ${error.message}`);
        }
    }
    determineDecisionWeight(nodeId, decisionType) {
        if (decisionType === 'main_branch') {
            return 10;
        }
        if (decisionType === 'trait_changing') {
            return 7;
        }
        if (decisionType === 'faction_related') {
            return 6;
        }
        return 2;
    }
    generateTagsFromContent(content) {
        const tags = [];
        const lowerContent = content.toLowerCase();
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
        if (lowerContent.includes('đàm phán') ||
            lowerContent.includes('thương lượng') ||
            lowerContent.includes('hòa giải') ||
            lowerContent.includes('giúp đỡ')) {
            tags.push('peaceful');
        }
        if (lowerContent.includes('khám phá') ||
            lowerContent.includes('tìm kiếm') ||
            lowerContent.includes('điều tra') ||
            lowerContent.includes('đi đến')) {
            tags.push('exploration');
        }
        if (lowerContent.includes('giúp đỡ') ||
            lowerContent.includes('cứu') ||
            lowerContent.includes('bảo vệ')) {
            tags.push('good');
        }
        else if (lowerContent.includes('lừa dối') ||
            lowerContent.includes('đánh cắp') ||
            lowerContent.includes('tàn nhẫn')) {
            tags.push('evil');
        }
        if (lowerContent.includes('mạo hiểm') ||
            lowerContent.includes('liều lĩnh')) {
            tags.push('risky');
        }
        else if (lowerContent.includes('thận trọng') ||
            lowerContent.includes('cẩn thận') ||
            lowerContent.includes('quan sát')) {
            tags.push('cautious');
        }
        return tags;
    }
    async updateGameplayProfile(gameSession, decision) {
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
            if (decision.tags.includes('combat')) {
                if (decision.tags.includes('aggressive')) {
                    gameSession.gameplayProfile.combatPreference += 2;
                }
                else if (decision.tags.includes('peaceful')) {
                    gameSession.gameplayProfile.combatPreference -= 2;
                }
                gameSession.gameplayProfile.combatPreference = Math.max(0, Math.min(100, gameSession.gameplayProfile.combatPreference));
            }
            if (decision.tags.includes('exploration')) {
                gameSession.gameplayProfile.explorationTendency += 2;
                gameSession.gameplayProfile.explorationTendency = Math.max(0, Math.min(100, gameSession.gameplayProfile.explorationTendency));
            }
            if (decision.tags.includes('good')) {
                gameSession.gameplayProfile.moralAlignment += 2;
            }
            else if (decision.tags.includes('evil')) {
                gameSession.gameplayProfile.moralAlignment -= 2;
            }
            gameSession.gameplayProfile.moralAlignment = Math.max(-100, Math.min(100, gameSession.gameplayProfile.moralAlignment));
            if (decision.tags.includes('risky')) {
                gameSession.gameplayProfile.riskTolerance += 2;
            }
            else if (decision.tags.includes('cautious')) {
                gameSession.gameplayProfile.riskTolerance -= 2;
            }
            gameSession.gameplayProfile.riskTolerance = Math.max(0, Math.min(100, gameSession.gameplayProfile.riskTolerance));
            if (decision.decisionType === 'free_input') {
                const wordCount = decision.content.split(' ').length;
                if (wordCount > 20) {
                    gameSession.gameplayProfile.dialogueLength += 1;
                }
                else if (wordCount < 10) {
                    gameSession.gameplayProfile.dialogueLength -= 1;
                }
                gameSession.gameplayProfile.dialogueLength = Math.max(0, Math.min(100, gameSession.gameplayProfile.dialogueLength));
            }
        }
        catch (error) {
            this.logger.error(`Error updating gameplay profile: ${error.message}`);
        }
    }
    async analyzeWritingStyle(gameSessionId, text) {
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
            const sentenceLength = this.calculateAverageSentenceLength(text);
            const formality = this.detectFormality(text);
            const tone = this.detectTone(text);
            const descriptiveness = this.detectDescriptiveness(text);
            gameSession.gameplayProfile.writingStyle = {
                sentenceLength: sentenceLength,
                formality: formality,
                tone: tone,
                descriptiveness: descriptiveness
            };
            await this.gameSessionRepository.save(gameSession);
        }
        catch (error) {
            this.logger.error(`Error analyzing writing style: ${error.message}`);
        }
    }
    async getGameplayProfile(gameSessionId) {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: gameSessionId },
            });
            if (!gameSession) {
                this.logger.error(`Game session with ID ${gameSessionId} not found`);
                return null;
            }
            return gameSession.gameplayProfile;
        }
        catch (error) {
            this.logger.error(`Error getting gameplay profile: ${error.message}`);
            return null;
        }
    }
    async adjustContentBasedOnProfile(gameSessionId, content) {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: gameSessionId },
            });
            if (!gameSession || !gameSession.gameplayProfile) {
                return content;
            }
            let adjustedContent = content;
            if (gameSession.gameplayProfile.dialogueLength > 70) {
                adjustedContent = this.expandContent(content);
            }
            else if (gameSession.gameplayProfile.dialogueLength < 30) {
                adjustedContent = this.condenseContent(content);
            }
            if (gameSession.gameplayProfile.writingStyle?.tone) {
                adjustedContent = this.adjustTone(adjustedContent, gameSession.gameplayProfile.writingStyle.tone);
            }
            return adjustedContent;
        }
        catch (error) {
            this.logger.error(`Error adjusting content: ${error.message}`);
            return content;
        }
    }
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    calculateAverageSentenceLength(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length === 0)
            return 0;
        const totalWords = sentences.reduce((count, sentence) => {
            return count + sentence.split(/\s+/).filter(w => w.length > 0).length;
        }, 0);
        return totalWords / sentences.length;
    }
    detectFormality(text) {
        const formalWords = ['kính thưa', 'xin phép', 'trân trọng', 'kính mời', 'bản thân', 'tại hạ'];
        const informalWords = ['tớ', 'cậu', 'ừ', 'ờ', 'vậy đó', 'thôi mà'];
        let formalCount = 0;
        let informalCount = 0;
        const lowerText = text.toLowerCase();
        formalWords.forEach(word => {
            if (lowerText.includes(word))
                formalCount++;
        });
        informalWords.forEach(word => {
            if (lowerText.includes(word))
                informalCount++;
        });
        if (formalCount + informalCount === 0)
            return 50;
        return Math.min(100, Math.max(0, 50 + (formalCount - informalCount) * 10));
    }
    detectTone(text) {
        const lowerText = text.toLowerCase();
        const tones = {
            humorous: ['cười', 'vui', 'hài hước', 'đùa', 'haha', 'hihi'],
            serious: ['nghiêm túc', 'trách nhiệm', 'cẩn trọng', 'quan trọng'],
            aggressive: ['tức giận', 'giận dữ', 'phẫn nộ', 'căm phẫn', 'đánh'],
            formal: ['kính thưa', 'trân trọng', 'xin phép'],
            friendly: ['thân thiện', 'vui vẻ', 'thân ái', 'thân mến'],
            neutral: []
        };
        const toneCounts = {};
        for (const [tone, words] of Object.entries(tones)) {
            toneCounts[tone] = words.filter(word => lowerText.includes(word)).length;
        }
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
    detectDescriptiveness(text) {
        const descriptiveWords = ['đẹp', 'xấu', 'to', 'nhỏ', 'nhanh', 'chậm', 'tốt', 'tuyệt', 'tồi', 'mạnh', 'yếu'];
        const words = text.toLowerCase().split(/\s+/);
        let descriptiveCount = 0;
        descriptiveWords.forEach(word => {
            descriptiveCount += words.filter(w => w.includes(word)).length;
        });
        return Math.min(100, Math.max(0, descriptiveCount * 10));
    }
    expandContent(content) {
        return content + " Điều này thật sự khiến bạn suy nghĩ về những khả năng và hậu quả có thể xảy ra trong tương lai.";
    }
    condenseContent(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length <= 2)
            return content;
        return sentences.slice(0, 2).join('. ') + '.';
    }
    adjustTone(content, tone) {
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
};
exports.ProfileLearningService = ProfileLearningService;
exports.ProfileLearningService = ProfileLearningService = ProfileLearningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(1, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProfileLearningService);
//# sourceMappingURL=profile-learning.service.js.map