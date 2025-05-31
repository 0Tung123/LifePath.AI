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
exports.GameSession = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const story_node_entity_1 = require("./story-node.entity");
let GameSession = class GameSession {
};
exports.GameSession = GameSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GameSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], GameSession.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], GameSession.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], GameSession.prototype, "lastSavedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], GameSession.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GameSession.prototype, "currentStoryNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], GameSession.prototype, "gameState", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, (character) => character.gameSessions),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", character_entity_1.Character)
], GameSession.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => story_node_entity_1.StoryNode, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'currentStoryNodeId' }),
    __metadata("design:type", story_node_entity_1.StoryNode)
], GameSession.prototype, "currentStoryNode", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => story_node_entity_1.StoryNode, (storyNode) => storyNode.gameSession),
    __metadata("design:type", Array)
], GameSession.prototype, "storyNodes", void 0);
exports.GameSession = GameSession = __decorate([
    (0, typeorm_1.Entity)()
], GameSession);
//# sourceMappingURL=game-session.entity.js.map