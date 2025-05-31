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
exports.Character = exports.GameGenre = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const game_session_entity_1 = require("./game-session.entity");
var GameGenre;
(function (GameGenre) {
    GameGenre["FANTASY"] = "fantasy";
    GameGenre["MODERN"] = "modern";
    GameGenre["SCIFI"] = "scifi";
    GameGenre["XIANXIA"] = "xianxia";
    GameGenre["WUXIA"] = "wuxia";
    GameGenre["HORROR"] = "horror";
    GameGenre["CYBERPUNK"] = "cyberpunk";
    GameGenre["STEAMPUNK"] = "steampunk";
    GameGenre["POSTAPOCALYPTIC"] = "postapocalyptic";
    GameGenre["HISTORICAL"] = "historical";
})(GameGenre || (exports.GameGenre = GameGenre = {}));
let Character = class Character {
};
exports.Character = Character;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Character.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Character.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Character.prototype, "characterClass", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GameGenre,
        default: GameGenre.FANTASY,
    }),
    __metadata("design:type", String)
], Character.prototype, "genre", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", Object)
], Character.prototype, "attributes", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], Character.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], Character.prototype, "specialAbilities", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], Character.prototype, "inventory", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Character.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Character.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Character.prototype, "backstory", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], Character.prototype, "relationships", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Character.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], Character.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.characters),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Character.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => game_session_entity_1.GameSession, (gameSession) => gameSession.character),
    __metadata("design:type", Array)
], Character.prototype, "gameSessions", void 0);
exports.Character = Character = __decorate([
    (0, typeorm_1.Entity)()
], Character);
//# sourceMappingURL=character.entity.js.map