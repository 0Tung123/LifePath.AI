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
exports.BookmarkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bookmark_entity_1 = require("./entities/bookmark.entity");
const game_session_entity_1 = require("./entities/game-session.entity");
const story_node_entity_1 = require("./entities/story-node.entity");
let BookmarkService = class BookmarkService {
    constructor(bookmarkRepository, gameSessionRepository, storyNodeRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.storyNodeRepository = storyNodeRepository;
    }
    async createBookmark(gameSessionId, storyNodeId, name, description) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        const storyNode = await this.storyNodeRepository.findOne({
            where: { id: storyNodeId },
        });
        if (!storyNode) {
            throw new common_1.NotFoundException(`Story node with ID ${storyNodeId} not found`);
        }
        const autoSummary = this.generateAutoSummary(storyNode.content);
        const bookmark = this.bookmarkRepository.create({
            name,
            description,
            autoSummary,
            gameSessionId,
            storyNodeId,
        });
        const existingBookmarks = await this.bookmarkRepository.find({
            where: { gameSessionId },
        });
        if (existingBookmarks.length >= 10) {
            throw new Error('Maximum number of bookmarks (10) reached. Please delete some before creating new ones.');
        }
        return this.bookmarkRepository.save(bookmark);
    }
    async getBookmarks(gameSessionId) {
        return this.bookmarkRepository.find({
            where: { gameSessionId },
            order: { createdAt: 'DESC' },
        });
    }
    async getBookmark(id) {
        const bookmark = await this.bookmarkRepository.findOne({
            where: { id },
            relations: ['storyNode'],
        });
        if (!bookmark) {
            throw new common_1.NotFoundException(`Bookmark with ID ${id} not found`);
        }
        return bookmark;
    }
    async deleteBookmark(id) {
        const result = await this.bookmarkRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Bookmark with ID ${id} not found`);
        }
    }
    async updateBookmark(id, name, description) {
        const bookmark = await this.getBookmark(id);
        bookmark.name = name;
        if (description) {
            bookmark.description = description;
        }
        return this.bookmarkRepository.save(bookmark);
    }
    generateAutoSummary(content) {
        const maxLength = 50;
        const plainText = content.replace(/<[^>]*>/g, '');
        const summary = plainText.trim().split(/[.!?]/).filter(s => s.trim().length > 0)[0] || plainText;
        if (summary.length > maxLength) {
            return summary.substring(0, maxLength - 3) + '...';
        }
        return summary;
    }
};
exports.BookmarkService = BookmarkService;
exports.BookmarkService = BookmarkService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bookmark_entity_1.Bookmark)),
    __param(1, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(2, (0, typeorm_1.InjectRepository)(story_node_entity_1.StoryNode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BookmarkService);
//# sourceMappingURL=bookmark.service.js.map