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
exports.MiniGameController = void 0;
const common_1 = require("@nestjs/common");
const mini_game_service_1 = require("./mini-game.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let MiniGameController = class MiniGameController {
    constructor(miniGameService) {
        this.miniGameService = miniGameService;
    }
    async createMiniGame(createMiniGameDto) {
        try {
            return await this.miniGameService.createMiniGame(createMiniGameDto);
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getMiniGame(id) {
        return this.miniGameService.getMiniGame(id);
    }
    async deleteMiniGame(id) {
        await this.miniGameService.deleteMiniGame(id);
        return { message: 'Mini-game deleted successfully' };
    }
    async updateMiniGame(id, updateMiniGameDto) {
        return this.miniGameService.updateMiniGame(id, updateMiniGameDto);
    }
    async handleMiniGameResult(id, resultDto) {
        return this.miniGameService.handleMiniGameResult(id, resultDto.gameSessionId, resultDto.success, resultDto.score);
    }
};
exports.MiniGameController = MiniGameController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new mini-game' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mini-game created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MiniGameController.prototype, "createMiniGame", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a mini-game by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the mini-game' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Mini-game not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MiniGameController.prototype, "getMiniGame", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a mini-game' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mini-game deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Mini-game not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MiniGameController.prototype, "deleteMiniGame", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a mini-game' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mini-game updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Mini-game not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MiniGameController.prototype, "updateMiniGame", null);
__decorate([
    (0, common_1.Post)(':id/result'),
    (0, swagger_1.ApiOperation)({ summary: 'Handle mini-game result' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mini-game result processed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MiniGameController.prototype, "handleMiniGameResult", null);
exports.MiniGameController = MiniGameController = __decorate([
    (0, swagger_1.ApiTags)('mini-games'),
    (0, common_1.Controller)('mini-games'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [mini_game_service_1.MiniGameService])
], MiniGameController);
//# sourceMappingURL=mini-game.controller.js.map