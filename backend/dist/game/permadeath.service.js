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
exports.PermadeathService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("./entities/character.entity");
const game_session_entity_1 = require("./entities/game-session.entity");
const character_death_entity_1 = require("./entities/character-death.entity");
const story_node_entity_1 = require("./entities/story-node.entity");
const memory_service_1 = require("../memory/memory.service");
const gemini_ai_service_1 = require("./gemini-ai.service");
const memory_record_entity_1 = require("../memory/entities/memory-record.entity");
const schedule_1 = require("@nestjs/schedule");
let PermadeathService = class PermadeathService {
    constructor(characterRepository, gameSessionRepository, characterDeathRepository, storyNodeRepository, memoryService, geminiAiService) {
        this.characterRepository = characterRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.characterDeathRepository = characterDeathRepository;
        this.storyNodeRepository = storyNodeRepository;
        this.memoryService = memoryService;
        this.geminiAiService = geminiAiService;
    }
    async evaluateLethalSituation(gameSessionId, decision, dangerLevel) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
            relations: ['character', 'currentStoryNode'],
        });
        if (!gameSession) {
            throw new Error('Game session not found');
        }
        if (!gameSession.permadeathEnabled) {
            return { died: false };
        }
        const character = gameSession.character;
        const currentNode = gameSession.currentStoryNode;
        const prompt = `
      Based on the following situation and the player's decision, evaluate whether this decision
      could realistically lead to the character's death. Be fair but unforgiving - in real life,
      bad decisions in dangerous situations can be fatal.

      Situation: ${currentNode.content}
      Player's decision: ${decision}
      Current danger level: ${dangerLevel}/10
      Character level: ${character.level}
      Character class: ${character.characterClass}
      
      Return your evaluation in JSON format:
      {
        "shouldDie": true/false,
        "deathProbability": 0-1,
        "reasoning": "Detailed reasoning for why this decision leads to death or not",
        "deathDescription": "Detailed and dramatic description of the death if it occurs",
        "lastWords": ["1-3 possible last thoughts or words from the character"]
      }
    `;
        const aiResult = await this.geminiAiService.generateContent(prompt);
        let evaluation;
        try {
            const jsonMatch = aiResult.match(/{[\s\S]*}/);
            if (jsonMatch) {
                evaluation = JSON.parse(jsonMatch[0]);
            }
            else {
                throw new Error('Could not parse JSON from AI response');
            }
        }
        catch (error) {
            console.error('Error parsing AI response:', error);
            return { died: false };
        }
        const baseThreshold = this.calculateDeathThreshold(character, gameSession.difficultyLevel);
        if (evaluation.deathProbability > baseThreshold &&
            !this.hasProtection(character, gameSession)) {
            await this.executeCharacterDeath(gameSession, character, evaluation.deathDescription, evaluation.lastWords, currentNode.id, decision);
            return {
                died: true,
                description: evaluation.deathDescription,
                lastWords: evaluation.lastWords,
                deathProbability: evaluation.deathProbability,
                reasoning: evaluation.reasoning,
            };
        }
        if (evaluation.deathProbability > baseThreshold - 0.2) {
            await this.recordNearDeathExperience(gameSession, evaluation.reasoning);
        }
        return { died: false };
    }
    calculateDeathThreshold(character, difficultyLevel) {
        let baseThreshold = 0.7;
        switch (difficultyLevel) {
            case 'easy':
                baseThreshold = 0.85;
                break;
            case 'hard':
                baseThreshold = 0.6;
                break;
            case 'hardcore':
                baseThreshold = 0.5;
                break;
        }
        const levelBonus = Math.min(character.level * 0.01, 0.1);
        return Math.min(baseThreshold - levelBonus, 0.9);
    }
    hasProtection(character, gameSession) {
        if (character.inventory?.items) {
            const hasProtectionItem = character.inventory.items.some((item) => item.name.toLowerCase().includes('resurrection') ||
                item.name.toLowerCase().includes('protection') ||
                (item.effects && item.effects.preventDeath));
            if (hasProtectionItem)
                return true;
        }
        if (character.specialAbilities) {
            const hasProtectionAbility = character.specialAbilities.some((ability) => ability.name.toLowerCase().includes('survival') ||
                ability.name.toLowerCase().includes('invulnerability'));
            if (hasProtectionAbility)
                return true;
        }
        return false;
    }
    async executeCharacterDeath(gameSession, character, deathDescription, lastWords, lastNodeId, lastDecision) {
        character.isDead = true;
        character.deathDate = new Date();
        await this.characterRepository.save(character);
        gameSession.isActive = false;
        gameSession.endedAt = new Date();
        gameSession.deathReason = deathDescription.substring(0, 100) + '...';
        await this.gameSessionRepository.save(gameSession);
        const daysSurvived = Math.floor((new Date().getTime() - character.createdAt.getTime()) /
            (1000 * 3600 * 24));
        await this.characterDeathRepository.save({
            characterId: character.id,
            gameSessionId: gameSession.id,
            deathDescription,
            deathCause: await this.extractDeathCause(deathDescription),
            lastNodeId,
            lastDecision,
            lastWords,
            stats: {
                level: character.level,
                daysSurvived,
                questsCompleted: gameSession.gameState?.completedQuests?.length || 0,
                significantChoices: character.survivalStats?.majorDecisionsMade || 0,
            },
            timestamp: new Date(),
        });
        await this.memoryService.createMemory({
            characterId: character.id,
            title: `The Death of ${character.name}`,
            content: deathDescription,
            type: memory_record_entity_1.MemoryType.DEATH,
            importance: 1.0,
        });
        const epitaph = await this.generateEpitaph(character, deathDescription);
        character.epitaph = epitaph;
        await this.characterRepository.save(character);
    }
    async recordNearDeathExperience(gameSession, reason) {
        if (!gameSession.gameState) {
            gameSession.gameState = {};
        }
        if (!gameSession.gameState.nearDeathExperiences) {
            gameSession.gameState.nearDeathExperiences = 0;
        }
        gameSession.gameState.nearDeathExperiences++;
        if (!gameSession.character.survivalStats) {
            gameSession.character.survivalStats = {
                daysSurvived: 0,
                dangerousSituationsOvercome: 0,
                nearDeathExperiences: 0,
                majorDecisionsMade: 0,
            };
        }
        gameSession.character.survivalStats.nearDeathExperiences++;
        await this.gameSessionRepository.save(gameSession);
        await this.characterRepository.save(gameSession.character);
        await this.memoryService.createMemory({
            characterId: gameSession.character.id,
            title: `Near Death Experience`,
            content: `You nearly died: ${reason}`,
            type: memory_record_entity_1.MemoryType.EXPERIENCE,
            importance: 0.9,
        });
    }
    async extractDeathCause(deathDescription) {
        const prompt = `
      Extract a brief cause of death (5-10 words) from the following death description.
      Example: "Slain by goblin ambush" or "Fell into lava pit"
      
      Death description:
      ${deathDescription}
      
      Cause of death (keep it brief):
    `;
        return this.geminiAiService
            .generateContent(prompt)
            .then((result) => result.trim())
            .catch(() => 'Unknown cause');
    }
    async generateEpitaph(character, deathDescription) {
        const prompt = `
      Create a short, poetic epitaph (15-20 words) for a character who died.
      The epitaph should capture the essence of their life and death.
      
      Character: ${character.name}, ${character.characterClass}
      Death: ${deathDescription}
      
      Epitaph:
    `;
        return this.geminiAiService
            .generateContent(prompt)
            .then((result) => result.trim())
            .catch(() => `Here lies ${character.name}, who lived bravely and died boldly.`);
    }
    async calculateCurrentDangerLevel(gameSessionId) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameSessionId },
            relations: ['currentStoryNode'],
        });
        if (!gameSession || !gameSession.currentStoryNode) {
            return 0;
        }
        const prompt = `
      Based on the following situation, calculate a danger level from 0 to 10,
      where 0 is completely safe and 10 is almost certain death.
      
      Situation: ${gameSession.currentStoryNode.content}
      
      Return only a number between 0 and 10.
    `;
        const result = await this.geminiAiService.generateContent(prompt);
        const dangerLevel = parseInt(result.trim(), 10);
        if (isNaN(dangerLevel) || dangerLevel < 0 || dangerLevel > 10) {
            return 5;
        }
        if (!gameSession.gameState) {
            gameSession.gameState = {};
        }
        gameSession.gameState.dangerLevel = dangerLevel;
        await this.gameSessionRepository.save(gameSession);
        return dangerLevel;
    }
    async updateSurvivalStats() {
        const activeCharacters = await this.characterRepository.find({
            where: { isDead: false },
        });
        for (const character of activeCharacters) {
            if (!character.survivalStats) {
                character.survivalStats = {
                    daysSurvived: 0,
                    dangerousSituationsOvercome: 0,
                    nearDeathExperiences: 0,
                    majorDecisionsMade: 0,
                };
            }
            character.survivalStats.daysSurvived++;
            await this.characterRepository.save(character);
        }
    }
};
exports.PermadeathService = PermadeathService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermadeathService.prototype, "updateSurvivalStats", null);
exports.PermadeathService = PermadeathService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(1, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(2, (0, typeorm_1.InjectRepository)(character_death_entity_1.CharacterDeath)),
    __param(3, (0, typeorm_1.InjectRepository)(story_node_entity_1.StoryNode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        memory_service_1.MemoryService,
        gemini_ai_service_1.GeminiAiService])
], PermadeathService);
//# sourceMappingURL=permadeath.service.js.map