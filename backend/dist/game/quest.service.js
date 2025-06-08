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
var QuestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const quest_entity_1 = require("./entities/quest.entity");
const game_session_entity_1 = require("./entities/game-session.entity");
const memory_service_1 = require("../memory/memory.service");
const memory_record_entity_1 = require("../memory/entities/memory-record.entity");
let QuestService = QuestService_1 = class QuestService {
    constructor(questRepository, gameSessionRepository, memoryService, configService) {
        this.questRepository = questRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.memoryService = memoryService;
        this.configService = configService;
        this.logger = new common_1.Logger(QuestService_1.name);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not set');
            return;
        }
        this.geminiAi = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.generationModel = this.geminiAi.getGenerativeModel({
            model: 'gemini-1.5-pro-latest',
        });
    }
    async generateQuest(gameSessionId, trigger, triggerType = 'event') {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: gameSessionId },
                relations: ['character'],
            });
            if (!gameSession) {
                throw new Error(`Game session with id ${gameSessionId} not found`);
            }
            const memories = await this.memoryService.findRelevantMemories(trigger, gameSession.character.id, 5);
            let memoryContext = '';
            if (memories.length > 0) {
                memoryContext = 'Thông tin liên quan từ bộ nhớ:\n';
                memories.forEach((memory) => {
                    memoryContext += `- ${memory.title}: ${memory.content}\n`;
                });
            }
            const prompt = `
Hãy tạo một nhiệm vụ phụ dựa trên yếu tố kích hoạt sau. Nhiệm vụ cần phù hợp với thể loại của game và bối cảnh thế giới.

Thông tin về nhân vật:
Tên: ${gameSession.character.name}
Lớp nhân vật: ${gameSession.character.characterClass}
Thể loại: ${gameSession.character.primaryGenre}
Thể loại game: ${gameSession.character.primaryGenre}
${gameSession.character.backstory ? `Tiểu sử: ${gameSession.character.backstory}` : ''}

Yếu tố kích hoạt: ${trigger} (Loại: ${triggerType})

${memoryContext}

Hãy trả về kết quả theo định dạng JSON:
{
  "title": "Tên nhiệm vụ ngắn gọn, hấp dẫn",
  "description": "Mô tả chi tiết về nhiệm vụ, bối cảnh và mục tiêu",
  "completionCriteria": "Điều kiện để hoàn thành nhiệm vụ",
  "rewards": {
    "experience": số điểm kinh nghiệm,
    "gold": số vàng,
    "items": ["tên vật phẩm 1", "tên vật phẩm 2"],
    "other": "phần thưởng khác (nếu có)"
  },
  "relatedNpcs": ["tên nhân vật liên quan"],
  "relatedLocations": ["tên địa điểm liên quan"]
}
`;
            const result = await this.generationModel.generateContent(prompt);
            const textResult = result.response.text();
            const jsonMatch = textResult.match(/{[\s\S]*}/);
            if (!jsonMatch) {
                throw new Error('Could not parse quest JSON from AI response');
            }
            const questData = JSON.parse(jsonMatch[0]);
            const newQuest = this.questRepository.create({
                title: questData.title,
                description: questData.description,
                completionCriteria: questData.completionCriteria,
                status: quest_entity_1.QuestStatus.AVAILABLE,
                type: quest_entity_1.QuestType.DYNAMIC,
                characterId: gameSession.character.id,
                gameSessionId: gameSession.id,
                rewards: questData.rewards,
                triggers: [trigger],
                relatedNpcs: questData.relatedNpcs || [],
                relatedLocations: questData.relatedLocations || [],
                relatedItems: [],
            });
            const savedQuest = await this.questRepository.save(newQuest);
            await this.memoryService.createMemory({
                title: `Nhiệm vụ mới: ${savedQuest.title}`,
                content: savedQuest.description,
                type: memory_record_entity_1.MemoryType.QUEST,
                characterId: gameSession.character.id,
                gameSessionId: gameSession.id,
                importance: 0.8,
            });
            return savedQuest;
        }
        catch (error) {
            this.logger.error(`Error generating quest: ${error.message}`);
            throw error;
        }
    }
    async getQuestsByGameSession(gameSessionId) {
        return this.questRepository.find({
            where: { gameSessionId },
            order: { updatedAt: 'DESC' },
        });
    }
    async getQuestById(id) {
        const quest = await this.questRepository.findOne({
            where: { id },
        });
        if (!quest) {
            throw new Error(`Quest with id ${id} not found`);
        }
        return quest;
    }
    async updateQuestStatus(id, status) {
        const quest = await this.questRepository.findOne({
            where: { id },
        });
        if (!quest) {
            throw new Error(`Quest with id ${id} not found`);
        }
        quest.status = status;
        return this.questRepository.save(quest);
    }
};
exports.QuestService = QuestService;
exports.QuestService = QuestService = QuestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(quest_entity_1.Quest)),
    __param(1, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        memory_service_1.MemoryService,
        config_1.ConfigService])
], QuestService);
//# sourceMappingURL=quest.service.js.map