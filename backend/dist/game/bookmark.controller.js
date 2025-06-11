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
exports.BookmarkController = void 0;
const common_1 = require("@nestjs/common");
const bookmark_service_1 = require("./bookmark.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let BookmarkController = class BookmarkController {
    constructor(bookmarkService) {
        this.bookmarkService = bookmarkService;
    }
    async createBookmark(createBookmarkDto) {
        try {
            return await this.bookmarkService.createBookmark(createBookmarkDto.gameSessionId, createBookmarkDto.storyNodeId, createBookmarkDto.name, createBookmarkDto.description);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getBookmarks(gameSessionId) {
        return this.bookmarkService.getBookmarks(gameSessionId);
    }
    async getBookmark(id) {
        return this.bookmarkService.getBookmark(id);
    }
    async deleteBookmark(id) {
        await this.bookmarkService.deleteBookmark(id);
        return { message: 'Bookmark deleted successfully' };
    }
    async updateBookmark(id, updateBookmarkDto) {
        return this.bookmarkService.updateBookmark(id, updateBookmarkDto.name, updateBookmarkDto.description);
    }
};
exports.BookmarkController = BookmarkController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new bookmark' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bookmark created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookmarkController.prototype, "createBookmark", null);
__decorate([
    (0, common_1.Get)('game-session/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all bookmarks for a game session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return all bookmarks' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookmarkController.prototype, "getBookmarks", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a bookmark by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the bookmark' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bookmark not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookmarkController.prototype, "getBookmark", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a bookmark' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookmark deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bookmark not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookmarkController.prototype, "deleteBookmark", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a bookmark' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Bookmark updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Bookmark not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookmarkController.prototype, "updateBookmark", null);
exports.BookmarkController = BookmarkController = __decorate([
    (0, swagger_1.ApiTags)('bookmarks'),
    (0, common_1.Controller)('bookmarks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [bookmark_service_1.BookmarkService])
], BookmarkController);
//# sourceMappingURL=bookmark.controller.js.map