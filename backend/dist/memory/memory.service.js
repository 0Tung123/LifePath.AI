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
var MemoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const memory_record_entity_1 = require("./entities/memory-record.entity");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let MemoryService = MemoryService_1 = class MemoryService {
    constructor(memoryRepository, configService) {
        this.memoryRepository = memoryRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(MemoryService_1.name);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is not set');
            return;
        }
        this.geminiAi = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.embeddingModel = this.geminiAi.getGenerativeModel({ model: 'embedding-001' });
    }
    async createEmbedding(text) {
        try {
            if (!this.embeddingModel) {
                return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
            }
            const embeddingResult = await this.embeddingModel.embedContent(text);
            return embeddingResult.embedding.values;
        }
        catch (error) {
            this.logger.error(`Error creating embedding: ${error.message}`);
            return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
        }
    }
    async createMemory(data) {
        const embedding = await this.createEmbedding(`${data.title} ${data.content}`);
        const newMemory = this.memoryRepository.create({
            ...data,
            embedding,
        });
        return this.memoryRepository.save(newMemory);
    }
    async findRelevantMemories(context, characterId, limit = 5) {
        const query = this.memoryRepository.createQueryBuilder('memory');
        if (characterId) {
            query.where('memory.characterId = :characterId', { characterId });
        }
        return query
            .orderBy('memory.importance', 'DESC')
            .addOrderBy('memory.updatedAt', 'DESC')
            .take(limit)
            .getMany();
    }
    async createPromptWithMemories(basePrompt, context, characterId) {
        const relevantMemories = await this.findRelevantMemories(context, characterId);
        let memorySection = '';
        if (relevantMemories.length > 0) {
            memorySection = `\n\nRELEVANT MEMORIES:\n`;
            relevantMemories.forEach((memory) => {
                memorySection += `[${memory.type}] ${memory.title}: ${memory.content}\n`;
            });
        }
        return `${basePrompt}${memorySection}`;
    }
};
exports.MemoryService = MemoryService;
exports.MemoryService = MemoryService = MemoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(memory_record_entity_1.MemoryRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], MemoryService);
//# sourceMappingURL=memory.service.js.map