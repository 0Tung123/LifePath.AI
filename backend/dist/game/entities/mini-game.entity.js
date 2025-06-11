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
exports.MiniGame = exports.ReflexGameType = exports.PuzzleType = exports.MiniGameType = void 0;
const typeorm_1 = require("typeorm");
const story_node_entity_1 = require("./story-node.entity");
var MiniGameType;
(function (MiniGameType) {
    MiniGameType["PUZZLE"] = "puzzle";
    MiniGameType["REFLEX"] = "reflex";
    MiniGameType["ASSEMBLY"] = "assembly";
})(MiniGameType || (exports.MiniGameType = MiniGameType = {}));
var PuzzleType;
(function (PuzzleType) {
    PuzzleType["LOGIC"] = "logic";
    PuzzleType["WORD"] = "word";
    PuzzleType["MATH"] = "math";
    PuzzleType["PATTERN"] = "pattern";
})(PuzzleType || (exports.PuzzleType = PuzzleType = {}));
var ReflexGameType;
(function (ReflexGameType) {
    ReflexGameType["DODGE"] = "dodge";
    ReflexGameType["RHYTHM"] = "rhythm";
    ReflexGameType["REACTION"] = "reaction";
})(ReflexGameType || (exports.ReflexGameType = ReflexGameType = {}));
let MiniGame = class MiniGame {
};
exports.MiniGame = MiniGame;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MiniGame.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MiniGame.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], MiniGame.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MiniGameType,
    }),
    __metadata("design:type", String)
], MiniGame.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], MiniGame.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], MiniGame.prototype, "mandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MiniGame.prototype, "completionNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MiniGame.prototype, "failureNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], MiniGame.prototype, "rewards", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], MiniGame.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => story_node_entity_1.StoryNode, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'completionNodeId' }),
    __metadata("design:type", story_node_entity_1.StoryNode)
], MiniGame.prototype, "completionNode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => story_node_entity_1.StoryNode, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'failureNodeId' }),
    __metadata("design:type", story_node_entity_1.StoryNode)
], MiniGame.prototype, "failureNode", void 0);
exports.MiniGame = MiniGame = __decorate([
    (0, typeorm_1.Entity)()
], MiniGame);
//# sourceMappingURL=mini-game.entity.js.map