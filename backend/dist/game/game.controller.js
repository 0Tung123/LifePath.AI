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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const character_entity_1 = require("./entities/character.entity");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    async createCharacter(req, characterData) {
        return this.gameService.createCharacter(req.user.id, characterData);
    }
    async generateCharacter(req, data) {
        return this.gameService.generateCharacterFromDescription(req.user.id, data.description, data.primaryGenre, data.secondaryGenres, data.customGenreDescription);
    }
    async getMyCharacters(req) {
        return this.gameService.getCharactersByUserId(req.user.id);
    }
    async getCharacter(id) {
        return this.gameService.getCharacterById(id);
    }
    async getAvailableGenres() {
        return [
            {
                id: character_entity_1.GameGenre.FANTASY,
                name: 'Fantasy',
                description: 'Thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí',
            },
            {
                id: character_entity_1.GameGenre.MODERN,
                name: 'Modern',
                description: 'Thế giới hiện đại với công nghệ và xã hội như thực tế',
            },
            {
                id: character_entity_1.GameGenre.SCIFI,
                name: 'Sci-Fi',
                description: 'Thế giới tương lai với công nghệ tiên tiến, du hành vũ trụ',
            },
            {
                id: character_entity_1.GameGenre.XIANXIA,
                name: 'Tiên Hiệp',
                description: 'Thế giới tu tiên, trau dồi linh khí, thăng cấp cảnh giới',
            },
            {
                id: character_entity_1.GameGenre.WUXIA,
                name: 'Võ Hiệp',
                description: 'Thế giới võ thuật, giang hồ, kiếm hiệp',
            },
            {
                id: character_entity_1.GameGenre.HORROR,
                name: 'Horror',
                description: 'Thế giới đầy rẫy những sinh vật kinh dị, ma quỷ và sự sợ hãi',
            },
            {
                id: character_entity_1.GameGenre.CYBERPUNK,
                name: 'Cyberpunk',
                description: 'Thế giới tương lai đen tối với công nghệ cao, tập đoàn lớn và cấy ghép cơ thể',
            },
            {
                id: character_entity_1.GameGenre.STEAMPUNK,
                name: 'Steampunk',
                description: 'Thế giới thay thế với công nghệ hơi nước tiên tiến, thường có bối cảnh thời Victoria',
            },
            {
                id: character_entity_1.GameGenre.POSTAPOCALYPTIC,
                name: 'Post-Apocalyptic',
                description: 'Thế giới sau thảm họa toàn cầu, con người phải sinh tồn',
            },
            {
                id: character_entity_1.GameGenre.HISTORICAL,
                name: 'Historical',
                description: 'Thế giới dựa trên các giai đoạn lịch sử thực tế',
            },
        ];
    }
    async startNewGame(data) {
        return this.gameService.startGameSession(data.characterId);
    }
    async getMyActiveSessions(req) {
        const allSessions = await this.gameService.getGameSessionsByCharacterId(req.user.id);
        return allSessions.filter((session) => session.isActive);
    }
    async getGameSession(id) {
        return this.gameService.getGameSessionWithDetails(id);
    }
    async getGameSessionHistory(id) {
        return this.gameService.getGameSessionHistory(id);
    }
    async getActualPathHistory(id) {
        return this.gameService.getActualPathHistory(id);
    }
    async getAllBranches(id) {
        return this.gameService.getAllBranches(id);
    }
    async restoreBranch(sessionId, branchId) {
        return this.gameService.restoreBranch(sessionId, branchId);
    }
    async saveGame(id) {
        const session = await this.gameService.getGameSessionWithDetails(id);
        return session;
    }
    async endGame(id) {
        return this.gameService.endGameSession(id);
    }
    async deleteGameSession(id, req) {
        return this.gameService.deleteGameSession(id, req.user.id);
    }
    async deleteCharacter(id, req) {
        return this.gameService.deleteCharacter(id, req.user.id);
    }
    async makeChoice(id, choiceId) {
        return this.gameService.makeChoice(id, choiceId);
    }
    async goBackToNode(sessionId, nodeId) {
        return this.gameService.goBackToNode(sessionId, nodeId);
    }
    async getStoryTree(sessionId) {
        return this.gameService.getStoryTree(sessionId);
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Post)('characters'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "createCharacter", null);
__decorate([
    (0, common_1.Post)('characters/generate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "generateCharacter", null);
__decorate([
    (0, common_1.Get)('characters'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getMyCharacters", null);
__decorate([
    (0, common_1.Get)('characters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getCharacter", null);
__decorate([
    (0, common_1.Get)('genres'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getAvailableGenres", null);
__decorate([
    (0, common_1.Post)('sessions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "startNewGame", null);
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getMyActiveSessions", null);
__decorate([
    (0, common_1.Get)('sessions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGameSession", null);
__decorate([
    (0, common_1.Get)('sessions/:id/history'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGameSessionHistory", null);
__decorate([
    (0, common_1.Get)('sessions/:id/path-history'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getActualPathHistory", null);
__decorate([
    (0, common_1.Get)('sessions/:id/branches'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getAllBranches", null);
__decorate([
    (0, common_1.Post)('sessions/:id/restore-branch/:branchId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "restoreBranch", null);
__decorate([
    (0, common_1.Put)('sessions/:id/save'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "saveGame", null);
__decorate([
    (0, common_1.Put)('sessions/:id/end'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "endGame", null);
__decorate([
    (0, common_1.Delete)('sessions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "deleteGameSession", null);
__decorate([
    (0, common_1.Delete)('characters/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "deleteCharacter", null);
__decorate([
    (0, common_1.Post)('sessions/:id/choices/:choiceId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('choiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "makeChoice", null);
__decorate([
    (0, common_1.Post)('sessions/:id/go-back/:nodeId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('nodeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "goBackToNode", null);
__decorate([
    (0, common_1.Get)('sessions/:id/tree'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getStoryTree", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('game'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map