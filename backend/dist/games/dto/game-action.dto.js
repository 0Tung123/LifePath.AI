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
exports.GameActionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class GameActionDto {
}
exports.GameActionDto = GameActionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'The choice number (1-4) selected by the player',
        example: 2,
        type: Number,
        minimum: 1,
        maximum: 4,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(4),
    (0, class_validator_1.ValidateIf)((o) => !o.action && !o.think && !o.communication),
    __metadata("design:type", Number)
], GameActionDto.prototype, "choiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom action input by the player',
        example: 'Investigate the strange sound coming from the bushes',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => !o.choiceNumber && !o.think && !o.communication),
    __metadata("design:type", String)
], GameActionDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "The character's thoughts or internal monologue",
        example: 'I wonder if I should trust this merchant...',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => !o.choiceNumber && !o.action && !o.communication),
    __metadata("design:type", String)
], GameActionDto.prototype, "think", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Communication with other characters',
        example: 'Hello stranger, where can I find the nearest inn?',
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.ValidateIf)((o) => !o.choiceNumber && !o.action && !o.think),
    __metadata("design:type", String)
], GameActionDto.prototype, "communication", void 0);
//# sourceMappingURL=game-action.dto.js.map