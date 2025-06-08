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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomInputService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const game_session_entity_1 = require("./entities/game-session.entity");
const character_entity_1 = require("./entities/character.entity");
const story_node_entity_1 = require("./entities/story-node.entity");
const choice_entity_1 = require("./entities/choice.entity");
const gemini_ai_service_1 = require("./gemini-ai.service");
const memory_service_1 = require("../memory/memory.service");
const permadeath_service_1 = require("./permadeath.service");
const consequence_service_1 = require("./consequence.service");
const memory_record_entity_1 = require("../memory/entities/memory-record.entity");
const custom_input_dto_1 = require("./dto/custom-input.dto");
let CustomInputService = class CustomInputService {
    constructor(gameSessionRepository, characterRepository, storyNodeRepository, choiceRepository, geminiAiService, memoryService, permadeathService, consequenceService) {
        this.gameSessionRepository = gameSessionRepository;
        this.characterRepository = characterRepository;
        this.storyNodeRepository = storyNodeRepository;
        this.choiceRepository = choiceRepository;
        this.geminiAiService = geminiAiService;
        this.memoryService = memoryService;
        this.permadeathService = permadeathService;
        this.consequenceService = consequenceService;
    }
    async processCustomInput(gameSessionId, inputType, content, target) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
            relations: ['character', 'currentStoryNode'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
        }
        if (!gameSession.isActive) {
            throw new common_1.BadRequestException('This game session is no longer active');
        }
        const character = gameSession.character;
        if (character.isDead) {
            throw new common_1.BadRequestException('This character is dead and cannot perform actions');
        }
        const dangerLevel = await this.permadeathService.calculateCurrentDangerLevel(gameSessionId);
        const formattedInput = this.formatInputBasedOnType(inputType, content, character.name, target);
        const nextStoryNode = await this.generateResponseToCustomInput(gameSession, character, formattedInput, inputType);
        const savedStoryNode = await this.storyNodeRepository.save(nextStoryNode);
        gameSession.currentStoryNodeId = savedStoryNode.id;
        gameSession.currentStoryNode = savedStoryNode;
        gameSession.lastSavedAt = new Date();
        await this.gameSessionRepository.save(gameSession);
        if (inputType === custom_input_dto_1.InputType.ACTION || inputType === custom_input_dto_1.InputType.SPEECH) {
            await this.memoryService.createMemory({
                characterId: character.id,
                title: inputType === custom_input_dto_1.InputType.ACTION ? 'Action Taken' : 'Conversation',
                content: `${inputType === custom_input_dto_1.InputType.ACTION ? 'You performed: ' : 'You said: '} ${content}`,
                type: inputType === custom_input_dto_1.InputType.ACTION
                    ? memory_record_entity_1.MemoryType.ACTION
                    : memory_record_entity_1.MemoryType.CONVERSATION,
                importance: 0.6,
            });
        }
        if (inputType === custom_input_dto_1.InputType.ACTION && gameSession.permadeathEnabled) {
            const deathEvaluation = await this.permadeathService.evaluateLethalSituation(gameSessionId, content, dangerLevel);
            if (deathEvaluation.died) {
                const updatedSession = await this.gameSessionRepository.findOne({
                    where: { id: gameSessionId },
                    relations: ['character', 'currentStoryNode'],
                });
                if (!updatedSession) {
                    throw new common_1.NotFoundException(`Game session with ID ${gameSessionId} not found`);
                }
                return updatedSession;
            }
        }
        if (inputType === custom_input_dto_1.InputType.ACTION || inputType === custom_input_dto_1.InputType.SPEECH) {
            const gameContext = {
                gameSessionId,
                characterId: character.id,
                currentSituation: gameSession.currentStoryNode.content,
                characterDescription: `${character.name}, a level ${character.level} ${character.characterClass}`,
            };
            await this.consequenceService.evaluateActionConsequences(content, gameContext);
            if (inputType === custom_input_dto_1.InputType.ACTION) {
                if (!character.survivalStats) {
                    character.survivalStats = {
                        daysSurvived: 0,
                        dangerousSituationsOvercome: 0,
                        nearDeathExperiences: 0,
                        majorDecisionsMade: 0,
                    };
                }
                character.survivalStats.majorDecisionsMade++;
                if (dangerLevel >= 7) {
                    character.survivalStats.dangerousSituationsOvercome++;
                }
                await this.characterRepository.save(character);
            }
        }
        return gameSession;
    }
    formatInputBasedOnType(type, content, characterName, target) {
        switch (type) {
            case custom_input_dto_1.InputType.ACTION:
                return `${characterName} decides to ${content}.`;
            case custom_input_dto_1.InputType.THOUGHT:
                return `${characterName} thinks to themself: "${content}"`;
            case custom_input_dto_1.InputType.SPEECH:
                if (target) {
                    return `${characterName} says to ${target}: "${content}"`;
                }
                return `${characterName} says: "${content}"`;
            case custom_input_dto_1.InputType.CUSTOM:
            default:
                return content;
        }
    }
    async generateResponseToCustomInput(gameSession, character, formattedInput, inputType) {
        const currentNode = gameSession.currentStoryNode;
        const contextPrompt = `
      Current situation: ${currentNode.content}
      
      Character: ${character.name}, a ${character.characterClass} (Level ${character.level})
      
      ${formattedInput}
      
      Respond with how the world and NPCs react to this ${inputType}. Be descriptive and engaging.
      Then, provide 4 possible choices for what ${character.name} could do next.
      
      Format your response as follows:
      [NARRATIVE]
      Your detailed narrative response here, describing what happens after the ${inputType}.
      [/NARRATIVE]
      
      [CHOICES]
      1. First choice option
      2. Second choice option
      3. Third choice option
      4. Custom action...
      [/CHOICES]
    `;
        const aiResponse = await this.geminiAiService.generateContent(contextPrompt);
        const narrativeMatch = aiResponse.match(/\[NARRATIVE\]([\s\S]*?)\[\/NARRATIVE\]/);
        const choicesMatch = aiResponse.match(/\[CHOICES\]([\s\S]*?)\[\/CHOICES\]/);
        const narrative = narrativeMatch ? narrativeMatch[1].trim() : aiResponse;
        let choicesText = choicesMatch ? choicesMatch[1].trim() : '';
        if (!choicesText) {
            choicesText =
                '1. Continue\n2. Investigate further\n3. Talk to someone\n4. Custom action...';
        }
        const storyNode = new story_node_entity_1.StoryNode();
        storyNode.gameSessionId = gameSession.id;
        storyNode.content = narrative;
        storyNode.isRoot = false;
        storyNode.parentNodeId = currentNode.id;
        storyNode.metadata = {
            inputType,
            userInput: formattedInput,
        };
        storyNode.createdAt = new Date();
        const savedNode = await this.storyNodeRepository.save(storyNode);
        const choiceLines = choicesText
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .map((line) => line.replace(/^\d+\.\s*/, '').trim());
        if (choiceLines.length === 0) {
            choiceLines.push('Continue');
            choiceLines.push('Do something else');
            choiceLines.push('Talk to someone');
            choiceLines.push('Custom action...');
        }
        const choices = choiceLines.map((choiceText, index) => {
            const choice = new choice_entity_1.Choice();
            choice.storyNodeId = savedNode.id;
            choice.text = choiceText;
            choice.order = index;
            if (choiceText.toLowerCase().includes('custom action')) {
                choice.metadata = { isCustomAction: true };
            }
            return choice;
        });
        await this.choiceRepository.save(choices);
        savedNode.choices = choices;
        return savedNode;
    }
};
exports.CustomInputService = CustomInputService;
exports.CustomInputService = CustomInputService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(1, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(2, (0, typeorm_1.InjectRepository)(story_node_entity_1.StoryNode)),
    __param(3, (0, typeorm_1.InjectRepository)(choice_entity_1.Choice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        gemini_ai_service_1.GeminiAiService,
        memory_service_1.MemoryService,
        permadeath_service_1.PermadeathService,
        consequence_service_1.ConsequenceService])
], CustomInputService);
//# sourceMappingURL=custom-input.service.js.map