"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const prompt_service_1 = require("./prompt.service");
const gemini_service_1 = require("./gemini.service");
const story_service_1 = require("./story.service");
const story_controller_1 = require("./story.controller");
const story_entity_1 = require("./entities/story.entity");
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([story_entity_1.Story]),
        ],
        controllers: [story_controller_1.StoryController],
        providers: [prompt_service_1.PromptService, gemini_service_1.GeminiService, story_service_1.StoryService],
        exports: [prompt_service_1.PromptService, gemini_service_1.GeminiService, story_service_1.StoryService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map