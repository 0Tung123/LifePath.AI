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
exports.GamesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const games_service_1 = require("./games.service");
const create_game_dto_1 = require("./dto/create-game.dto");
const game_entity_1 = require("./entities/game.entity");
let GamesController = class GamesController {
    constructor(gamesService) {
        this.gamesService = gamesService;
    }
    async create(req, createGameDto) {
        const { gameSettings } = createGameDto;
        if (!gameSettings) {
            throw new common_1.BadRequestException('Game settings are required');
        }
        const userId = req.user.userId;
        return this.gamesService.create(userId, createGameDto);
    }
};
exports.GamesController = GamesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new game' }),
    (0, swagger_1.ApiBody)({ type: create_game_dto_1.CreateGameDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Game created successfully',
        type: game_entity_1.Game,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request - Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_game_dto_1.CreateGameDto]),
    __metadata("design:returntype", Promise)
], GamesController.prototype, "create", null);
exports.GamesController = GamesController = __decorate([
    (0, swagger_1.ApiTags)('games'),
    (0, common_1.Controller)('games'),
    __metadata("design:paramtypes", [games_service_1.GamesService])
], GamesController);
//# sourceMappingURL=games.controller.js.map