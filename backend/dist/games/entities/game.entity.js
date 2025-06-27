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
exports.Game = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const create_game_dto_1 = require("../dto/create-game.dto");
let Game = class Game {
};
exports.Game = Game;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Game.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Game.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Game.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", create_game_dto_1.GameSettingsDto)
], Game.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'story_history' }),
    __metadata("design:type", Array)
], Game.prototype, "storyHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'character_stats' }),
    __metadata("design:type", Object)
], Game.prototype, "characterStats", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'inventory_items' }),
    __metadata("design:type", Array)
], Game.prototype, "inventoryItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'character_skills' }),
    __metadata("design:type", Array)
], Game.prototype, "characterSkills", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'lore_fragments' }),
    __metadata("design:type", Array)
], Game.prototype, "loreFragments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'current_prompt', nullable: true }),
    __metadata("design:type", String)
], Game.prototype, "currentPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'current_choices', nullable: true }),
    __metadata("design:type", Array)
], Game.prototype, "currentChoices", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'chat_history_for_gemini', nullable: true }),
    __metadata("design:type", Array)
], Game.prototype, "chatHistoryForGemini", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'knowledge_base', nullable: true }),
    __metadata("design:type", Array)
], Game.prototype, "knowledgeBase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'current_objective', nullable: true }),
    __metadata("design:type", Object)
], Game.prototype, "currentObjective", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'npcs_met', nullable: true }),
    __metadata("design:type", Array)
], Game.prototype, "npcsMet", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'items_used', nullable: true }),
    __metadata("design:type", Array)
], Game.prototype, "itemsUsed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'important_events', nullable: true }),
    __metadata("design:type", Array)
], Game.prototype, "importantEvents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'achievements', nullable: true }),
    __metadata("design:type", Array)
], Game.prototype, "achievements", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'karma_score', default: 0 }),
    __metadata("design:type", Number)
], Game.prototype, "karmaScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'reputation', nullable: true }),
    __metadata("design:type", Object)
], Game.prototype, "reputation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Game.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'death_date', nullable: true }),
    __metadata("design:type", Object)
], Game.prototype, "deathDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'death_cause', nullable: true }),
    __metadata("design:type", Object)
], Game.prototype, "deathCause", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Game.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Game.prototype, "updatedAt", void 0);
exports.Game = Game = __decorate([
    (0, typeorm_1.Entity)('games')
], Game);
//# sourceMappingURL=game.entity.js.map