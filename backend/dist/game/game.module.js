"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const game_controller_1 = require("./game.controller");
const game_service_1 = require("./game.service");
const character_entity_1 = require("./entities/character.entity");
const game_session_entity_1 = require("./entities/game-session.entity");
const story_node_entity_1 = require("./entities/story-node.entity");
const choice_entity_1 = require("./entities/choice.entity");
const gemini_ai_service_1 = require("./gemini-ai.service");
const character_generator_service_1 = require("./character-generator.service");
const user_entity_1 = require("../user/entities/user.entity");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([character_entity_1.Character, game_session_entity_1.GameSession, story_node_entity_1.StoryNode, choice_entity_1.Choice, user_entity_1.User]),
            config_1.ConfigModule,
        ],
        controllers: [game_controller_1.GameController],
        providers: [game_service_1.GameService, gemini_ai_service_1.GeminiAiService, character_generator_service_1.CharacterGeneratorService],
        exports: [game_service_1.GameService, character_generator_service_1.CharacterGeneratorService],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map