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
exports.StoryNode = exports.BranchType = exports.Season = exports.TimeOfDay = void 0;
const typeorm_1 = require("typeorm");
const game_session_entity_1 = require("./game-session.entity");
const choice_entity_1 = require("./choice.entity");
var TimeOfDay;
(function (TimeOfDay) {
    TimeOfDay["DAWN"] = "dawn";
    TimeOfDay["MORNING"] = "morning";
    TimeOfDay["NOON"] = "noon";
    TimeOfDay["AFTERNOON"] = "afternoon";
    TimeOfDay["EVENING"] = "evening";
    TimeOfDay["NIGHT"] = "night";
    TimeOfDay["MIDNIGHT"] = "midnight";
})(TimeOfDay || (exports.TimeOfDay = TimeOfDay = {}));
var Season;
(function (Season) {
    Season["SPRING"] = "spring";
    Season["SUMMER"] = "summer";
    Season["AUTUMN"] = "autumn";
    Season["WINTER"] = "winter";
})(Season || (exports.Season = Season = {}));
var BranchType;
(function (BranchType) {
    BranchType["MAIN"] = "main";
    BranchType["VARIANT"] = "variant";
    BranchType["SIDE"] = "side";
})(BranchType || (exports.BranchType = BranchType = {}));
let StoryNode = class StoryNode {
};
exports.StoryNode = StoryNode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StoryNode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], StoryNode.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StoryNode.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StoryNode.prototype, "sceneDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], StoryNode.prototype, "isCombatScene", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], StoryNode.prototype, "isRoot", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StoryNode.prototype, "parentNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StoryNode.prototype, "gameSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TimeOfDay,
        nullable: true,
    }),
    __metadata("design:type", String)
], StoryNode.prototype, "timeOfDay", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Season,
        nullable: true,
    }),
    __metadata("design:type", String)
], StoryNode.prototype, "season", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BranchType,
        default: BranchType.MAIN,
    }),
    __metadata("design:type", String)
], StoryNode.prototype, "branchType", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], StoryNode.prototype, "requiredFlags", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], StoryNode.prototype, "requiredStats", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], StoryNode.prototype, "statsEffects", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], StoryNode.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], StoryNode.prototype, "combatData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], StoryNode.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], StoryNode.prototype, "isEnding", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StoryNode.prototype, "endingType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => game_session_entity_1.GameSession, (gameSession) => gameSession.storyNodes),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", game_session_entity_1.GameSession)
], StoryNode.prototype, "gameSession", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => choice_entity_1.Choice, (choice) => choice.storyNode, { cascade: true }),
    __metadata("design:type", Array)
], StoryNode.prototype, "choices", void 0);
exports.StoryNode = StoryNode = __decorate([
    (0, typeorm_1.Entity)()
], StoryNode);
//# sourceMappingURL=story-node.entity.js.map