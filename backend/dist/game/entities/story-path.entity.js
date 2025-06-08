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
exports.StoryPath = void 0;
const typeorm_1 = require("typeorm");
const game_session_entity_1 = require("./game-session.entity");
const story_node_entity_1 = require("./story-node.entity");
let StoryPath = class StoryPath {
};
exports.StoryPath = StoryPath;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StoryPath.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoryPath.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoryPath.prototype, "choiceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StoryPath.prototype, "choiceText", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], StoryPath.prototype, "stepOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], StoryPath.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StoryPath.prototype, "branchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StoryPath.prototype, "parentPathId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StoryPath.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => game_session_entity_1.GameSession, (gameSession) => gameSession.storyPaths),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", game_session_entity_1.GameSession)
], StoryPath.prototype, "gameSession", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => story_node_entity_1.StoryNode),
    (0, typeorm_1.JoinColumn)({ name: 'nodeId' }),
    __metadata("design:type", story_node_entity_1.StoryNode)
], StoryPath.prototype, "storyNode", void 0);
exports.StoryPath = StoryPath = __decorate([
    (0, typeorm_1.Entity)()
], StoryPath);
//# sourceMappingURL=story-path.entity.js.map