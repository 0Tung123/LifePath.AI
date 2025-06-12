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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGameDto = exports.GameSettingsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GameSettingsDto {
}
exports.GameSettingsDto = GameSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Theme of the game', example: 'Fantasy' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GameSettingsDto.prototype, "theme", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Setting of the game',
        example: 'Medieval Kingdom',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GameSettingsDto.prototype, "setting", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the main character',
        example: 'Sir Galahad',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GameSettingsDto.prototype, "characterName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Backstory of the main character',
        example: 'A knight from a fallen kingdom searching for redemption',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GameSettingsDto.prototype, "characterBackstory", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional game details and preferences',
        required: false,
        example: {
            difficulty: 'medium',
            gameLength: 'medium',
            combatStyle: 'balanced',
        },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], GameSettingsDto.prototype, "additionalSettings", void 0);
class CreateGameDto {
}
exports.CreateGameDto = CreateGameDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Settings for the game',
        type: GameSettingsDto,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GameSettingsDto),
    __metadata("design:type", GameSettingsDto)
], CreateGameDto.prototype, "gameSettings", void 0);
//# sourceMappingURL=create-game.dto.js.map