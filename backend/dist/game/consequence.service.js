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
exports.ConsequenceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const consequence_entity_1 = require("./entities/consequence.entity");
const game_session_entity_1 = require("./entities/game-session.entity");
const character_entity_1 = require("./entities/character.entity");
const gemini_ai_service_1 = require("./gemini-ai.service");
const schedule_1 = require("@nestjs/schedule");
const memory_service_1 = require("../memory/memory.service");
const memory_record_entity_1 = require("../memory/entities/memory-record.entity");
let ConsequenceService = class ConsequenceService {
    constructor(consequenceRepository, gameSessionRepository, characterRepository, geminiAiService, memoryService) {
        this.consequenceRepository = consequenceRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.characterRepository = characterRepository;
        this.geminiAiService = geminiAiService;
        this.memoryService = memoryService;
    }
    async evaluateActionConsequences(action, gameContext) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: gameContext.gameSessionId },
            relations: ['character', 'currentStoryNode'],
        });
        if (!gameSession) {
            throw new Error('Game session not found');
        }
        const prompt = `
      Based on the player's action, generate 1-3 realistic consequences that might occur
      in the game world. These should follow naturally from the action and the current
      situation. Consequences can be immediate or delayed, positive or negative, and
      affect different entities in the game world.
      
      Action: ${action}
      Current situation: ${gameContext.currentSituation}
      Character: ${gameContext.characterDescription}
      
      Return your response in JSON format:
      [
        {
          "description": "Detailed description of the consequence",
          "timeToTrigger": "immediate/short/medium/long",
          "severity": "minor/moderate/major/critical",
          "isPermanent": true/false,
          "affectedEntities": ["entity1", "entity2"]
        }
      ]
    `;
        const aiResponse = await this.geminiAiService.generateContent(prompt);
        let consequences;
        try {
            const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                consequences = JSON.parse(jsonMatch[0]);
            }
            else {
                throw new Error('Could not parse JSON from AI response');
            }
        }
        catch (error) {
            console.error('Error parsing AI response:', error);
            return [];
        }
        for (const consequence of consequences) {
            const triggerTime = this.calculateTriggerTime(consequence.timeToTrigger);
            await this.consequenceRepository.save({
                gameSessionId: gameContext.gameSessionId,
                characterId: gameContext.characterId,
                description: consequence.description,
                triggerTime,
                severity: consequence.severity,
                isPermanent: consequence.isPermanent,
                affectedEntities: consequence.affectedEntities,
                isTriggered: consequence.timeToTrigger === 'immediate',
                sourceActionId: 'manual-action',
                metadata: {
                    originalAction: action,
                    originalSituation: gameContext.currentSituation,
                },
                createdAt: new Date(),
            });
            if (consequence.timeToTrigger === 'immediate') {
                await this.memoryService.createMemory({
                    characterId: gameContext.characterId,
                    title: `Consequence: ${this.generateConsequenceTitle(consequence)}`,
                    content: consequence.description,
                    type: memory_record_entity_1.MemoryType.CONSEQUENCE,
                    importance: this.calculateMemoryImportance(consequence.severity),
                });
            }
            if (consequence.timeToTrigger !== 'immediate') {
                if (!gameSession.gameState) {
                    gameSession.gameState = {};
                }
                if (!gameSession.gameState.pendingConsequences) {
                    gameSession.gameState.pendingConsequences = [];
                }
                gameSession.gameState.pendingConsequences.push(this.generateConsequenceTitle(consequence));
                await this.gameSessionRepository.save(gameSession);
            }
        }
        return consequences;
    }
    async triggerPendingConsequences() {
        const pendingConsequences = await this.consequenceRepository.find({
            where: {
                isTriggered: false,
                triggerTime: (0, typeorm_2.LessThan)(new Date()),
            },
            relations: ['gameSession', 'character'],
        });
        for (const consequence of pendingConsequences) {
            if (!consequence.gameSession?.isActive) {
                continue;
            }
            consequence.isTriggered = true;
            await this.consequenceRepository.save(consequence);
            await this.memoryService.createMemory({
                characterId: consequence.characterId,
                title: `Delayed Consequence: ${this.generateConsequenceTitle(consequence)}`,
                content: consequence.description,
                type: memory_record_entity_1.MemoryType.CONSEQUENCE,
                importance: this.calculateMemoryImportance(consequence.severity),
            });
            const gameSession = consequence.gameSession;
            if (gameSession &&
                gameSession.gameState &&
                gameSession.gameState.pendingConsequences) {
                const title = this.generateConsequenceTitle(consequence);
                gameSession.gameState.pendingConsequences =
                    gameSession.gameState.pendingConsequences.filter((c) => !c.includes(title));
                await this.gameSessionRepository.save(gameSession);
            }
            if (consequence.isPermanent) {
                await this.applyPermanentConsequence(consequence);
            }
        }
    }
    calculateTriggerTime(timeFrame) {
        const now = new Date();
        switch (timeFrame) {
            case 'immediate':
                return now;
            case 'short':
                return new Date(now.getTime() + 1000 * 60 * 60 * (1 + Math.random() * 2));
            case 'medium':
                return new Date(now.getTime() + 1000 * 60 * 60 * (6 + Math.random() * 18));
            case 'long':
                return new Date(now.getTime() + 1000 * 60 * 60 * 24 * (2 + Math.random() * 5));
            default:
                return now;
        }
    }
    generateConsequenceTitle(consequence) {
        const description = consequence.description;
        const firstSentence = description.split(/[.!?]/, 1)[0];
        if (firstSentence.length <= 50) {
            return firstSentence;
        }
        return firstSentence.substring(0, 47) + '...';
    }
    calculateMemoryImportance(severity) {
        switch (severity) {
            case consequence_entity_1.ConsequenceSeverity.MINOR:
                return 0.3;
            case consequence_entity_1.ConsequenceSeverity.MODERATE:
                return 0.5;
            case consequence_entity_1.ConsequenceSeverity.MAJOR:
                return 0.7;
            case consequence_entity_1.ConsequenceSeverity.CRITICAL:
                return 0.9;
            default:
                return 0.5;
        }
    }
    async applyPermanentConsequence(consequence) {
        const character = consequence.character;
        if (!character) {
            return;
        }
        if (!character.attributes) {
            character.attributes = {};
        }
        switch (consequence.severity) {
            case consequence_entity_1.ConsequenceSeverity.CRITICAL:
                if (this.isCombatRelated(consequence.description)) {
                    character.attributes.strength = Math.max(1, character.attributes.strength - 2);
                }
                else if (this.isMagicRelated(consequence.description)) {
                    character.attributes.mana = Math.max(10, character.attributes.mana - 20);
                }
                else if (this.isHealthRelated(consequence.description)) {
                    character.attributes.health = Math.max(10, character.attributes.health - 20);
                }
                break;
            case consequence_entity_1.ConsequenceSeverity.MAJOR:
                if (this.isCombatRelated(consequence.description)) {
                    character.attributes.strength = Math.max(1, character.attributes.strength - 1);
                }
                else if (this.isMagicRelated(consequence.description)) {
                    character.attributes.mana = Math.max(10, character.attributes.mana - 10);
                }
                else if (this.isHealthRelated(consequence.description)) {
                    character.attributes.health = Math.max(10, character.attributes.health - 10);
                }
                break;
        }
        await this.characterRepository.save(character);
    }
    isCombatRelated(description) {
        const combatTerms = [
            'wound',
            'scar',
            'injury',
            'combat',
            'battle',
            'fight',
            'sword',
            'weapon',
        ];
        return combatTerms.some((term) => description.toLowerCase().includes(term));
    }
    isMagicRelated(description) {
        const magicTerms = [
            'spell',
            'magic',
            'curse',
            'arcane',
            'wizard',
            'sorcery',
            'enchantment',
        ];
        return magicTerms.some((term) => description.toLowerCase().includes(term));
    }
    isHealthRelated(description) {
        const healthTerms = [
            'disease',
            'illness',
            'sickness',
            'health',
            'injury',
            'poison',
            'wound',
        ];
        return healthTerms.some((term) => description.toLowerCase().includes(term));
    }
    async getPendingConsequencesForSession(gameSessionId) {
        return this.consequenceRepository.find({
            where: {
                gameSessionId,
                isTriggered: false,
            },
            order: {
                triggerTime: 'ASC',
            },
        });
    }
};
exports.ConsequenceService = ConsequenceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsequenceService.prototype, "triggerPendingConsequences", null);
exports.ConsequenceService = ConsequenceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(consequence_entity_1.Consequence)),
    __param(1, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(2, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        gemini_ai_service_1.GeminiAiService,
        memory_service_1.MemoryService])
], ConsequenceService);
//# sourceMappingURL=consequence.service.js.map