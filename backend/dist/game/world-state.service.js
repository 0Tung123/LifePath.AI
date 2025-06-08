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
var WorldStateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldStateService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const game_session_entity_1 = require("./entities/game-session.entity");
const character_entity_1 = require("./entities/character.entity");
const memory_service_1 = require("../memory/memory.service");
const memory_record_entity_1 = require("../memory/entities/memory-record.entity");
let WorldStateService = WorldStateService_1 = class WorldStateService {
    constructor(gameSessionRepository, characterRepository, memoryService, configService) {
        this.gameSessionRepository = gameSessionRepository;
        this.characterRepository = characterRepository;
        this.memoryService = memoryService;
        this.configService = configService;
        this.logger = new common_1.Logger(WorldStateService_1.name);
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
    async updateWorldState() {
        this.logger.log('Updating world state...');
        try {
            const activeSessions = await this.gameSessionRepository.find({
                where: { isActive: true },
                relations: ['character'],
            });
            for (const session of activeSessions) {
                const lastActivity = session.updatedAt;
                const now = new Date();
                const hoursSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
                if (hoursSinceLastActivity >= 3) {
                    await this.generateWorldEvents(session);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error updating world state: ${error.message}`);
        }
    }
    async generateWorldEvents(session) {
        try {
            const character = session.character;
            const existingMemories = await this.memoryService.findRelevantMemories('', character.id, 10);
            let memoriesContext = '';
            if (existingMemories.length > 0) {
                memoriesContext = 'Các sự kiện đã xảy ra trước đó:\n';
                existingMemories.forEach((memory) => {
                    memoriesContext += `- ${memory.title}: ${memory.content}\n`;
                });
            }
            const worldContext = `
Nhân vật: ${character.name}, ${character.characterClass}
Thế giới: ${character.primaryGenre}
Thời gian kể từ hoạt động cuối: ${Math.floor((new Date().getTime() - session.updatedAt.getTime()) / (1000 * 60 * 60))} giờ
${memoriesContext}
      `;
            const prompt = `
Hãy tạo ra 1-3 sự kiện đã xảy ra trong thế giới game trong khoảng thời gian người chơi vắng mặt.
Những sự kiện này nên liên quan đến bối cảnh thế giới, các phe phái hoặc NPC đã xuất hiện trước đó.
Hãy trả về kết quả theo format JSON:
[
  {
    "title": "Tên sự kiện ngắn gọn",
    "content": "Mô tả chi tiết về sự kiện",
    "importance": số từ 0.1 đến 1.0 thể hiện mức độ quan trọng
  }
]

Thông tin về nhân vật và thế giới:
${worldContext}
`;
            const result = await this.generationModel.generateContent(prompt);
            const textResult = result.response.text();
            let events = [];
            try {
                const jsonMatch = textResult.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    events = JSON.parse(jsonMatch[0]);
                }
            }
            catch (error) {
                this.logger.error(`Error parsing events JSON: ${error.message}`);
                return;
            }
            for (const event of events) {
                await this.memoryService.createMemory({
                    title: event.title,
                    content: event.content,
                    type: memory_record_entity_1.MemoryType.EVENT,
                    characterId: character.id,
                    gameSessionId: session.id,
                    importance: event.importance || 0.5,
                });
            }
            this.logger.log(`Generated ${events.length} events for session ${session.id}`);
        }
        catch (error) {
            this.logger.error(`Error generating world events: ${error.message}`);
        }
    }
};
exports.WorldStateService = WorldStateService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WorldStateService.prototype, "updateWorldState", null);
exports.WorldStateService = WorldStateService = WorldStateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(1, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        memory_service_1.MemoryService,
        config_1.ConfigService])
], WorldStateService);
//# sourceMappingURL=world-state.service.js.map