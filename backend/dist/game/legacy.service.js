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
exports.LegacyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("./entities/character.entity");
const legacy_entity_1 = require("./entities/legacy.entity");
const character_death_entity_1 = require("./entities/character-death.entity");
const memory_service_1 = require("../memory/memory.service");
const gemini_ai_service_1 = require("./gemini-ai.service");
const memory_record_entity_1 = require("../memory/entities/memory-record.entity");
let LegacyService = class LegacyService {
    constructor(characterRepository, legacyRepository, characterDeathRepository, memoryService, geminiAiService) {
        this.characterRepository = characterRepository;
        this.legacyRepository = legacyRepository;
        this.characterDeathRepository = characterDeathRepository;
        this.memoryService = memoryService;
        this.geminiAiService = geminiAiService;
    }
    async createLegacyFromDeadCharacter(characterId) {
        const deadCharacter = await this.characterRepository.findOne({
            where: { id: characterId, isDead: true },
        });
        if (!deadCharacter) {
            throw new Error('Character not found or is not dead');
        }
        const characterDeath = await this.characterDeathRepository.findOne({
            where: { characterId },
            order: { timestamp: 'DESC' },
        });
        const legacyItems = await this.selectInheritableItems(deadCharacter);
        const legacyKnowledge = await this.extractCharacterKnowledge(deadCharacter);
        const legacyDescription = await this.generateLegacyDescription(deadCharacter, characterDeath?.deathDescription);
        const bonuses = this.calculateLegacyBonuses(deadCharacter, characterDeath || undefined);
        const legacy = this.legacyRepository.create({
            originCharacterId: characterId,
            name: `Legacy of ${deadCharacter.name}`,
            description: legacyDescription,
            items: legacyItems,
            knowledge: legacyKnowledge,
            deathId: characterDeath?.id,
            bonuses,
            isInherited: false,
            createdAt: new Date(),
        });
        const savedLegacy = await this.legacyRepository.save(legacy);
        deadCharacter.legacyId = savedLegacy.id;
        await this.characterRepository.save(deadCharacter);
        return savedLegacy;
    }
    async applyLegacyToNewCharacter(legacyId, newCharacterId) {
        const legacy = await this.legacyRepository.findOne({
            where: { id: legacyId, isInherited: false },
        });
        if (!legacy) {
            throw new Error('Legacy not found or already inherited');
        }
        const newCharacter = await this.characterRepository.findOne({
            where: { id: newCharacterId, isDead: false },
        });
        if (!newCharacter) {
            throw new Error('Target character not found or is dead');
        }
        this.applyLegacyItems(newCharacter, legacy.items);
        await this.applyLegacyKnowledge(newCharacter.id, legacy.knowledge);
        this.applyLegacyBonuses(newCharacter, legacy.bonuses);
        legacy.isInherited = true;
        legacy.inheritorCharacterId = newCharacterId;
        await this.legacyRepository.save(legacy);
        await this.memoryService.createMemory({
            characterId: newCharacter.id,
            title: `Inherited Legacy of ${legacy.name}`,
            content: legacy.description,
            type: memory_record_entity_1.MemoryType.LEGACY,
            importance: 1.0,
        });
        await this.characterRepository.save(newCharacter);
    }
    async selectInheritableItems(character) {
        if (!character.inventory?.items || character.inventory.items.length === 0) {
            return [];
        }
        const significantItems = character.inventory.items.filter((item) => {
            if (item.rarity &&
                ['rare', 'epic', 'legendary', 'unique'].includes(item.rarity.toLowerCase())) {
                return true;
            }
            if (item.value && item.value > 1000) {
                return true;
            }
            if (item.effects && Object.keys(item.effects).length > 0) {
                return true;
            }
            return false;
        });
        const selectedItems = significantItems.slice(0, 3);
        return selectedItems.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            rarity: item.rarity || 'common',
            type: item.type || 'item',
        }));
    }
    async extractCharacterKnowledge(character) {
        const memories = await this.memoryService.findRelevantMemories('Important memories', character.id, 10);
        return memories.map((memory) => ({
            title: memory.title,
            content: memory.content,
            importance: memory.importance,
        }));
    }
    async generateLegacyDescription(character, deathDescription) {
        const memories = await this.memoryService.findRelevantMemories('Legacy memories', character.id, 5);
        const memoryText = memories
            .map((m) => `- ${m.title}: ${m.content}`)
            .join('\n');
        const prompt = `
      Create a detailed legacy description for a character who has died. This legacy will be passed 
      down to a future character. Include details about their achievements, notable deeds, and how 
      they will be remembered.
      
      Character: ${character.name}
      Class: ${character.characterClass}
      Level: ${character.level}
      ${deathDescription ? `Death: ${deathDescription}` : ''}
      
      Key memories and achievements:
      ${memoryText}
      
      Legacy description (200-300 words):
    `;
        const result = await this.geminiAiService.generateContent(prompt);
        return result.trim();
    }
    calculateLegacyBonuses(character, death) {
        const bonuses = {};
        bonuses.startingExperience = character.level * 100;
        if (death?.stats?.daysSurvived) {
            bonuses.survivalBonus = Math.min(death.stats.daysSurvived * 5, 500);
        }
        if (death?.stats?.questsCompleted) {
            bonuses.questExperience = death.stats.questsCompleted * 50;
        }
        switch (character.characterClass.toLowerCase()) {
            case 'warrior':
            case 'fighter':
            case 'knight':
                bonuses.strengthBonus = Math.min(character.level / 5, 3);
                break;
            case 'mage':
            case 'wizard':
            case 'sorcerer':
                bonuses.intelligenceBonus = Math.min(character.level / 5, 3);
                break;
            case 'rogue':
            case 'thief':
            case 'assassin':
                bonuses.dexterityBonus = Math.min(character.level / 5, 3);
                break;
        }
        return bonuses;
    }
    applyLegacyItems(character, legacyItems) {
        if (!character.inventory) {
            character.inventory = { items: [], currency: {} };
        }
        if (!character.inventory.items) {
            character.inventory.items = [];
        }
        for (const legacyItem of legacyItems) {
            character.inventory.items.push({
                id: legacyItem.id,
                name: `${legacyItem.name} (Legacy)`,
                description: `${legacyItem.description}\n\nThis item was passed down as a legacy.`,
                quantity: 1,
                type: legacyItem.type,
                rarity: legacyItem.rarity,
                effects: { isLegacy: true },
            });
        }
    }
    async applyLegacyKnowledge(characterId, knowledge) {
        for (const item of knowledge) {
            await this.memoryService.createMemory({
                characterId,
                title: `Inherited Knowledge: ${item.title}`,
                content: item.content,
                type: memory_record_entity_1.MemoryType.LEGACY,
                importance: item.importance * 0.8,
            });
        }
    }
    applyLegacyBonuses(character, bonuses) {
        if (bonuses.startingExperience) {
            character.experience += bonuses.startingExperience;
        }
        if (bonuses.questExperience) {
            character.experience += bonuses.questExperience;
        }
        if (!character.attributes) {
            character.attributes = {
                strength: 10,
                intelligence: 10,
                dexterity: 10,
                charisma: 10,
                health: 100,
                mana: 100,
            };
        }
        if (bonuses.strengthBonus) {
            character.attributes.strength += bonuses.strengthBonus;
        }
        if (bonuses.intelligenceBonus) {
            character.attributes.intelligence += bonuses.intelligenceBonus;
        }
        if (bonuses.dexterityBonus) {
            character.attributes.dexterity += bonuses.dexterityBonus;
        }
    }
    async getAvailableLegacies(userId) {
        const deadCharacters = await this.characterRepository.find({
            where: { user: { id: userId }, isDead: true },
        });
        const characterIds = deadCharacters.map((char) => char.id);
        if (characterIds.length === 0) {
            return [];
        }
        return this.legacyRepository
            .createQueryBuilder('legacy')
            .where('legacy.originCharacterId IN (:...characterIds)', { characterIds })
            .andWhere('legacy.isInherited = :isInherited', { isInherited: false })
            .getMany();
    }
};
exports.LegacyService = LegacyService;
exports.LegacyService = LegacyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(1, (0, typeorm_1.InjectRepository)(legacy_entity_1.Legacy)),
    __param(2, (0, typeorm_1.InjectRepository)(character_death_entity_1.CharacterDeath)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        memory_service_1.MemoryService,
        gemini_ai_service_1.GeminiAiService])
], LegacyService);
//# sourceMappingURL=legacy.service.js.map