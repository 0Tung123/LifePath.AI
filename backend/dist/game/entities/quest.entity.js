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
exports.Quest = exports.QuestType = exports.QuestStatus = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const game_session_entity_1 = require("./game-session.entity");
var QuestStatus;
(function (QuestStatus) {
    QuestStatus["AVAILABLE"] = "available";
    QuestStatus["ACTIVE"] = "active";
    QuestStatus["COMPLETED"] = "completed";
    QuestStatus["FAILED"] = "failed";
})(QuestStatus || (exports.QuestStatus = QuestStatus = {}));
var QuestType;
(function (QuestType) {
    QuestType["MAIN"] = "main";
    QuestType["SIDE"] = "side";
    QuestType["DYNAMIC"] = "dynamic";
    QuestType["HIDDEN"] = "hidden";
})(QuestType || (exports.QuestType = QuestType = {}));
let Quest = class Quest {
};
exports.Quest = Quest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Quest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Quest.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Quest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Quest.prototype, "completionCriteria", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QuestStatus,
        default: QuestStatus.AVAILABLE,
    }),
    __metadata("design:type", String)
], Quest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QuestType,
        default: QuestType.DYNAMIC,
    }),
    __metadata("design:type", String)
], Quest.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Quest.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character),
    (0, typeorm_1.JoinColumn)({ name: 'characterId' }),
    __metadata("design:type", character_entity_1.Character)
], Quest.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Quest.prototype, "gameSessionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => game_session_entity_1.GameSession),
    (0, typeorm_1.JoinColumn)({ name: 'gameSessionId' }),
    __metadata("design:type", game_session_entity_1.GameSession)
], Quest.prototype, "gameSession", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], Quest.prototype, "rewards", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Quest.prototype, "triggers", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Quest.prototype, "relatedItems", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Quest.prototype, "relatedLocations", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Quest.prototype, "relatedNpcs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Quest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Quest.prototype, "updatedAt", void 0);
exports.Quest = Quest = __decorate([
    (0, typeorm_1.Entity)()
], Quest);
//# sourceMappingURL=quest.entity.js.map