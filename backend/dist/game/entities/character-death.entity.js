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
exports.CharacterDeath = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const game_session_entity_1 = require("./game-session.entity");
let CharacterDeath = class CharacterDeath {
};
exports.CharacterDeath = CharacterDeath;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CharacterDeath.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CharacterDeath.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character),
    (0, typeorm_1.JoinColumn)({ name: 'characterId' }),
    __metadata("design:type", character_entity_1.Character)
], CharacterDeath.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CharacterDeath.prototype, "gameSessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => game_session_entity_1.GameSession),
    (0, typeorm_1.JoinColumn)({ name: 'gameSessionId' }),
    __metadata("design:type", game_session_entity_1.GameSession)
], CharacterDeath.prototype, "gameSession", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CharacterDeath.prototype, "deathDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CharacterDeath.prototype, "deathCause", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CharacterDeath.prototype, "lastNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CharacterDeath.prototype, "lastDecision", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], CharacterDeath.prototype, "stats", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], CharacterDeath.prototype, "lastWords", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CharacterDeath.prototype, "timestamp", void 0);
exports.CharacterDeath = CharacterDeath = __decorate([
    (0, typeorm_1.Entity)()
], CharacterDeath);
//# sourceMappingURL=character-death.entity.js.map