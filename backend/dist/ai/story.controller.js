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
exports.StoryController = void 0;
const common_1 = require("@nestjs/common");
const story_service_1 = require("./story.service");
const prompt_service_1 = require("./prompt.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
class CreateStoryDto {
}
class ContinueStoryDto {
}
let StoryController = class StoryController {
    constructor(storyService) {
        this.storyService = storyService;
    }
    async createStory(req, createStoryDto) {
        const userId = req.user.id;
        const { type, userChoice } = createStoryDto;
        const story = await this.storyService.createStory(userId, type, userChoice);
        return story;
    }
    async continueStory(continueStoryDto) {
        const { storyId, userChoice } = continueStoryDto;
        const updatedStory = await this.storyService.continueStory(storyId, userChoice);
        return updatedStory;
    }
    getStoryTypes() {
        return {
            types: [
                {
                    id: prompt_service_1.StoryType.CHINESE,
                    name: 'Truyện Trung Quốc (Tiên Hiệp/Huyền Huyễn/Tình Cảm/Cung Đấu)',
                },
                {
                    id: prompt_service_1.StoryType.KOREAN,
                    name: 'Truyện Hàn Quốc (Thợ Săn Hầm Ngục/Hồi Quy/Tình Cảm/Học Đường)',
                },
            ],
        };
    }
    async getMyStories(req) {
        const userId = req.user.id;
        const stories = await this.storyService.getStoriesByUser(userId);
        return stories;
    }
    async getStory(id) {
        return this.storyService.getStoryById(id);
    }
};
exports.StoryController = StoryController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateStoryDto]),
    __metadata("design:returntype", Promise)
], StoryController.prototype, "createStory", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('continue'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ContinueStoryDto]),
    __metadata("design:returntype", Promise)
], StoryController.prototype, "continueStory", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StoryController.prototype, "getStoryTypes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-stories'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StoryController.prototype, "getMyStories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoryController.prototype, "getStory", null);
exports.StoryController = StoryController = __decorate([
    (0, common_1.Controller)('story'),
    __metadata("design:paramtypes", [story_service_1.StoryService])
], StoryController);
//# sourceMappingURL=story.controller.js.map