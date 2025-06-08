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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const story_entity_1 = require("./entities/story.entity");
const gemini_service_1 = require("./gemini.service");
let StoryService = class StoryService {
    constructor(storyRepository, geminiService) {
        this.storyRepository = storyRepository;
        this.geminiService = geminiService;
    }
    async createStory(userId, type, userChoice) {
        const content = await this.geminiService.generateStory(type, userChoice);
        const story = this.storyRepository.create({
            type,
            content,
            userId,
            metadata: {
                initialChoice: userChoice,
                currentChoices: this.extractChoices(content),
            },
        });
        return this.storyRepository.save(story);
    }
    async continueStory(storyId, userChoice) {
        const story = await this.storyRepository.findOneBy({ id: storyId });
        if (!story) {
            throw new Error(`Story with id ${storyId} not found`);
        }
        const newContent = await this.geminiService.continueStory(story.type, story.content, userChoice);
        story.content += '\n\n' + newContent;
        story.metadata = {
            ...story.metadata,
            lastChoice: userChoice,
            currentChoices: this.extractChoices(newContent),
        };
        return this.storyRepository.save(story);
    }
    async getStoriesByUser(userId) {
        return this.storyRepository.find({
            where: { userId },
            order: { updatedAt: 'DESC' },
        });
    }
    async getStoryById(id) {
        return this.storyRepository.findOneBy({ id });
    }
    extractChoices(content) {
        try {
            const choiceSection = content.match(/\[LỰA CHỌN\]:([\s\S]*?)(?=\[|$)/);
            if (!choiceSection)
                return [];
            const choiceText = choiceSection[1];
            const choices = choiceText.match(/\d+\.\s+(.*?)(?=\d+\.\s+|$)/g);
            if (!choices)
                return [];
            return choices.map(choice => choice.trim());
        }
        catch (error) {
            console.error('Error extracting choices:', error);
            return [];
        }
    }
};
exports.StoryService = StoryService;
exports.StoryService = StoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(story_entity_1.Story)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        gemini_service_1.GeminiService])
], StoryService);
//# sourceMappingURL=story.service.js.map