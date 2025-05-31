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
exports.Choice = void 0;
const typeorm_1 = require("typeorm");
const story_node_entity_1 = require("./story-node.entity");
let Choice = class Choice {
};
exports.Choice = Choice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Choice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Choice.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Choice.prototype, "requiredAttribute", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Choice.prototype, "requiredAttributeValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Choice.prototype, "requiredSkill", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Choice.prototype, "requiredItem", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], Choice.prototype, "consequences", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => story_node_entity_1.StoryNode, (storyNode) => storyNode.choices),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", story_node_entity_1.StoryNode)
], Choice.prototype, "storyNode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Choice.prototype, "nextPrompt", void 0);
exports.Choice = Choice = __decorate([
    (0, typeorm_1.Entity)()
], Choice);
//# sourceMappingURL=choice.entity.js.map