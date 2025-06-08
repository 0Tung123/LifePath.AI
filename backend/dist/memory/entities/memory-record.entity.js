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
exports.MemoryRecord = exports.MemoryType = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("../../game/entities/character.entity");
const game_session_entity_1 = require("../../game/entities/game-session.entity");
var MemoryType;
(function (MemoryType) {
    MemoryType["EVENT"] = "event";
    MemoryType["NPC"] = "npc";
    MemoryType["LOCATION"] = "location";
    MemoryType["ITEM"] = "item";
    MemoryType["LORE"] = "lore";
    MemoryType["QUEST"] = "quest";
    MemoryType["CONSEQUENCE"] = "consequence";
    MemoryType["LEGACY"] = "legacy";
    MemoryType["ACTION"] = "action";
    MemoryType["CONVERSATION"] = "conversation";
    MemoryType["EXPERIENCE"] = "experience";
    MemoryType["DEATH"] = "death";
})(MemoryType || (exports.MemoryType = MemoryType = {}));
let MemoryRecord = class MemoryRecord {
};
exports.MemoryRecord = MemoryRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MemoryRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MemoryRecord.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], MemoryRecord.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MemoryRecord.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'characterId' }),
    __metadata("design:type", character_entity_1.Character)
], MemoryRecord.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MemoryRecord.prototype, "gameSessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => game_session_entity_1.GameSession, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'gameSessionId' }),
    __metadata("design:type", game_session_entity_1.GameSession)
], MemoryRecord.prototype, "gameSession", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MemoryType,
        default: MemoryType.EVENT,
    }),
    __metadata("design:type", String)
], MemoryRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], MemoryRecord.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true, array: true }),
    __metadata("design:type", Array)
], MemoryRecord.prototype, "embedding", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1.0 }),
    __metadata("design:type", Number)
], MemoryRecord.prototype, "importance", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MemoryRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MemoryRecord.prototype, "updatedAt", void 0);
exports.MemoryRecord = MemoryRecord = __decorate([
    (0, typeorm_1.Entity)()
], MemoryRecord);
//# sourceMappingURL=memory-record.entity.js.map