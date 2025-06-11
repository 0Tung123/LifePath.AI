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
const quest_entity_1 = require("./entities/quest.entity");
const character_death_entity_1 = require("./entities/character-death.entity");
const legacy_entity_1 = require("./entities/legacy.entity");
const consequence_entity_1 = require("./entities/consequence.entity");
const bookmark_entity_1 = require("./entities/bookmark.entity");
const mini_game_entity_1 = require("./entities/mini-game.entity");
const gemini_ai_service_1 = require("./gemini-ai.service");
const character_generator_service_1 = require("./character-generator.service");
const world_state_service_1 = require("./world-state.service");
const quest_service_1 = require("./quest.service");
const quest_controller_1 = require("./quest.controller");
const permadeath_service_1 = require("./permadeath.service");
const legacy_service_1 = require("./legacy.service");
const consequence_service_1 = require("./consequence.service");
const custom_input_service_1 = require("./custom-input.service");
const custom_input_controller_1 = require("./custom-input.controller");
const bookmark_service_1 = require("./bookmark.service");
const bookmark_controller_1 = require("./bookmark.controller");
const mini_game_service_1 = require("./mini-game.service");
const mini_game_controller_1 = require("./mini-game.controller");
const profile_learning_service_1 = require("./profile-learning.service");
const user_entity_1 = require("../user/entities/user.entity");
const memory_module_1 = require("../memory/memory.module");
let GameModule = class GameModule {
};
exports.GameModule = GameModule;
exports.GameModule = GameModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                character_entity_1.Character,
                game_session_entity_1.GameSession,
                story_node_entity_1.StoryNode,
                choice_entity_1.Choice,
                quest_entity_1.Quest,
                user_entity_1.User,
                character_death_entity_1.CharacterDeath,
                legacy_entity_1.Legacy,
                consequence_entity_1.Consequence,
                bookmark_entity_1.Bookmark,
                mini_game_entity_1.MiniGame
            ]),
            config_1.ConfigModule,
            memory_module_1.MemoryModule,
        ],
        controllers: [
            game_controller_1.GameController,
            quest_controller_1.QuestController,
            custom_input_controller_1.CustomInputController,
            bookmark_controller_1.BookmarkController,
            mini_game_controller_1.MiniGameController
        ],
        providers: [
            game_service_1.GameService,
            gemini_ai_service_1.GeminiAiService,
            character_generator_service_1.CharacterGeneratorService,
            world_state_service_1.WorldStateService,
            quest_service_1.QuestService,
            permadeath_service_1.PermadeathService,
            legacy_service_1.LegacyService,
            consequence_service_1.ConsequenceService,
            custom_input_service_1.CustomInputService,
            bookmark_service_1.BookmarkService,
            mini_game_service_1.MiniGameService,
            profile_learning_service_1.ProfileLearningService
        ],
        exports: [
            game_service_1.GameService,
            character_generator_service_1.CharacterGeneratorService,
            world_state_service_1.WorldStateService,
            quest_service_1.QuestService,
            permadeath_service_1.PermadeathService,
            legacy_service_1.LegacyService,
            consequence_service_1.ConsequenceService,
            custom_input_service_1.CustomInputService,
            bookmark_service_1.BookmarkService,
            mini_game_service_1.MiniGameService,
            profile_learning_service_1.ProfileLearningService
        ],
    })
], GameModule);
//# sourceMappingURL=game.module.js.map