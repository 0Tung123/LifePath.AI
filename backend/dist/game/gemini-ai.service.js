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
var GeminiAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiAiService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const character_entity_1 = require("./entities/character.entity");
let GeminiAiService = GeminiAiService_1 = class GeminiAiService {
    constructor() {
        this.logger = new common_1.Logger(GeminiAiService_1.name);
        const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
        this.generativeAI = new generative_ai_1.GoogleGenerativeAI(API_KEY);
        this.model = this.generativeAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    async generateStoryContent(prompt, gameContext) {
        try {
            const character = gameContext.character;
            if (!character) {
                throw new Error('Character information is required for story generation');
            }
            const genre = character.genre || character_entity_1.GameGenre.FANTASY;
            let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;
            switch (genre) {
                case character_entity_1.GameGenre.FANTASY:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Dexterity ${character.attributes.dexterity || 0}, ` +
                            `Charisma ${character.attributes.charisma || 0}, ` +
                            `Health ${character.attributes.health || 0}, ` +
                            `Mana ${character.attributes.mana || 0}. `;
                    break;
                case character_entity_1.GameGenre.XIANXIA:
                case character_entity_1.GameGenre.WUXIA:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Cultivation Level ${character.attributes.cultivation || 0}, ` +
                            `Qi ${character.attributes.qi || 0}, ` +
                            `Perception ${character.attributes.perception || 0}. `;
                    break;
                case character_entity_1.GameGenre.SCIFI:
                case character_entity_1.GameGenre.CYBERPUNK:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Tech Aptitude ${character.attributes.tech || 0}, ` +
                            `Hacking ${character.attributes.hacking || 0}, ` +
                            `Health ${character.attributes.health || 0}. `;
                    break;
                case character_entity_1.GameGenre.HORROR:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Sanity ${character.attributes.sanity || 0}, ` +
                            `Willpower ${character.attributes.willpower || 0}, ` +
                            `Health ${character.attributes.health || 0}. `;
                    break;
                default:
                    characterInfo +=
                        'Attributes: ' +
                            Object.entries(character.attributes)
                                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)} ${value}`)
                                .join(', ') +
                            '. ';
            }
            if (character.skills && character.skills.length > 0) {
                characterInfo += `Skills: ${character.skills.join(', ')}. `;
            }
            if (character.specialAbilities && character.specialAbilities.length > 0) {
                characterInfo += `Special Abilities: ${character.specialAbilities.map((a) => a.name).join(', ')}. `;
            }
            const gameState = gameContext.gameState
                ? `Game state: Visited locations: ${gameContext.gameState.visitedLocations.join(', ')}. ` +
                    `Completed quests: ${gameContext.gameState.completedQuests.join(', ')}.`
                : '';
            const genreInstructions = this.getGenreSpecificInstructions(genre);
            const fullPrompt = `
        You are a creative storyteller for an interactive text adventure game called "Nhập Vai A.I Simulator".
        Create an engaging and immersive story segment based on the following context:
        
        ${characterInfo}
        ${gameState}
        
        Current situation: ${prompt}
        
        Genre: ${this.getGenreName(genre)}
        ${genreInstructions}
        
        Provide a rich, detailed description of the scene, including sensory details, character emotions, and environmental elements.
        The tone should be immersive and engaging, making the player feel present in the world.
        
        Return only the narrative text without any explanations or meta-commentary.
      `;
            const result = await this.model.generateContent(fullPrompt);
            const response = result.response;
            return response.text();
        }
        catch (error) {
            this.logger.error(`Error generating story content: ${error.message}`, error.stack);
            throw new Error(`Failed to generate story content: ${error.message}`);
        }
    }
    async generateChoices(storyContext, gameContext) {
        try {
            const character = gameContext.character;
            if (!character) {
                throw new Error('Character information is required for choices generation');
            }
            const genre = character.genre || character_entity_1.GameGenre.FANTASY;
            let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;
            switch (genre) {
                case character_entity_1.GameGenre.FANTASY:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Dexterity ${character.attributes.dexterity || 0}, ` +
                            `Charisma ${character.attributes.charisma || 0}, ` +
                            `Health ${character.attributes.health || 0}, ` +
                            `Mana ${character.attributes.mana || 0}. `;
                    break;
                case character_entity_1.GameGenre.XIANXIA:
                case character_entity_1.GameGenre.WUXIA:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Cultivation Level ${character.attributes.cultivation || 0}, ` +
                            `Qi ${character.attributes.qi || 0}, ` +
                            `Perception ${character.attributes.perception || 0}. `;
                    break;
                case character_entity_1.GameGenre.SCIFI:
                case character_entity_1.GameGenre.CYBERPUNK:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Tech Aptitude ${character.attributes.tech || 0}, ` +
                            `Hacking ${character.attributes.hacking || 0}, ` +
                            `Health ${character.attributes.health || 0}. `;
                    break;
                case character_entity_1.GameGenre.HORROR:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Sanity ${character.attributes.sanity || 0}, ` +
                            `Willpower ${character.attributes.willpower || 0}, ` +
                            `Health ${character.attributes.health || 0}. `;
                    break;
                default:
                    characterInfo +=
                        'Attributes: ' +
                            Object.entries(character.attributes)
                                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)} ${value}`)
                                .join(', ') +
                            '. ';
            }
            if (character.skills && character.skills.length > 0) {
                characterInfo += `Skills: ${character.skills.join(', ')}. `;
            }
            if (character.specialAbilities && character.specialAbilities.length > 0) {
                characterInfo += `Special Abilities: ${character.specialAbilities.map((a) => a.name).join(', ')}. `;
            }
            if (character.inventory &&
                character.inventory.items &&
                character.inventory.items.length > 0) {
                characterInfo += `Items: ${character.inventory.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}. `;
            }
            const genreAttributes = this.getGenreAttributes(genre);
            const genreItems = this.getGenreItems(genre);
            const fullPrompt = `
        You are designing choices for an interactive text adventure game called "Nhập Vai A.I Simulator".
        Based on the following story context and character information, generate 3-4 meaningful choices for the player.
        
        ${characterInfo}
        
        Story context: ${storyContext}
        
        Genre: ${this.getGenreName(genre)}
        
        For each choice:
        1. Provide the choice text (what the player sees)
        2. Include a brief description of potential consequences (not shown to player)
        3. Indicate if any special attributes, skills, or items would be beneficial
        
        The choices should be appropriate for the ${this.getGenreName(genre)} genre and reflect its themes and tropes.
        
        Relevant attributes for this genre include: ${genreAttributes.join(', ')}
        Relevant item types for this genre include: ${genreItems.join(', ')}
        
        Format your response as a JSON array with objects containing:
        - text: The choice text shown to player
        - requiredAttribute: Optional attribute that would be beneficial (choose from the relevant attributes)
        - requiredAttributeValue: Minimum value for the attribute
        - requiredSkill: Optional skill that would be beneficial
        - requiredItem: Optional item that would be beneficial
        - nextPrompt: Brief description of what happens next if this choice is selected
        - consequences: Object with potential effects (attributeChanges, skillGains, itemGains, itemLosses, relationChanges, flagChanges)
      `;
            const result = await this.model.generateContent(fullPrompt);
            const response = result.response;
            const choicesText = response.text();
            const jsonMatch = choicesText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Failed to parse choices from AI response');
            }
            return JSON.parse(jsonMatch[0]);
        }
        catch (error) {
            this.logger.error(`Error generating choices: ${error.message}`, error.stack);
            throw new Error(`Failed to generate choices: ${error.message}`);
        }
    }
    async generateCombatScene(character, location) {
        try {
            const genre = character.genre || character_entity_1.GameGenre.FANTASY;
            let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;
            switch (genre) {
                case character_entity_1.GameGenre.FANTASY:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Dexterity ${character.attributes.dexterity || 0}, ` +
                            `Charisma ${character.attributes.charisma || 0}, ` +
                            `Health ${character.attributes.health || 0}, ` +
                            `Mana ${character.attributes.mana || 0}. `;
                    break;
                case character_entity_1.GameGenre.XIANXIA:
                case character_entity_1.GameGenre.WUXIA:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Cultivation Level ${character.attributes.cultivation || 0}, ` +
                            `Qi ${character.attributes.qi || 0}, ` +
                            `Perception ${character.attributes.perception || 0}. `;
                    break;
                case character_entity_1.GameGenre.SCIFI:
                case character_entity_1.GameGenre.CYBERPUNK:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Tech Aptitude ${character.attributes.tech || 0}, ` +
                            `Hacking ${character.attributes.hacking || 0}, ` +
                            `Health ${character.attributes.health || 0}. `;
                    break;
                case character_entity_1.GameGenre.HORROR:
                    characterInfo +=
                        `Attributes: Strength ${character.attributes.strength || 0}, ` +
                            `Intelligence ${character.attributes.intelligence || 0}, ` +
                            `Sanity ${character.attributes.sanity || 0}, ` +
                            `Willpower ${character.attributes.willpower || 0}, ` +
                            `Health ${character.attributes.health || 0}. `;
                    break;
                default:
                    characterInfo +=
                        'Attributes: ' +
                            Object.entries(character.attributes)
                                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)} ${value}`)
                                .join(', ') +
                            '. ';
            }
            if (character.skills && character.skills.length > 0) {
                characterInfo += `Skills: ${character.skills.join(', ')}. `;
            }
            if (character.specialAbilities && character.specialAbilities.length > 0) {
                characterInfo += `Special Abilities: ${character.specialAbilities.map((a) => a.name).join(', ')}. `;
            }
            const combatInstructions = this.getGenreCombatInstructions(genre);
            const enemyTypes = this.getGenreEnemyTypes(genre);
            const rewardTypes = this.getGenreRewardTypes(genre);
            const fullPrompt = `
        You are designing a combat encounter for an interactive text adventure game called "Nhập Vai A.I Simulator".
        Create an engaging combat scenario based on the following character and location:
        
        ${characterInfo}
        
        Location: ${location}
        
        Genre: ${this.getGenreName(genre)}
        
        ${combatInstructions}
        
        Appropriate enemy types for this genre include: ${enemyTypes.join(', ')}
        Appropriate reward types for this genre include: ${rewardTypes.join(', ')}
        
        Generate a complete combat scene including:
        1. A description of the enemies and the combat situation
        2. Enemy stats appropriate for the character's level
        3. Possible combat actions for the player
        4. Potential rewards for victory
        
        Format your response as a JSON object with:
        - description: Narrative description of the combat scene
        - enemies: Array of enemy objects with name, level, health, attributes, and abilities
        - playerActions: Array of possible combat actions
        - rewards: Object containing experience, currency, and potential item drops
      `;
            const result = await this.model.generateContent(fullPrompt);
            const response = result.response;
            const combatText = response.text();
            const jsonMatch = combatText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse combat scene from AI response');
            }
            return JSON.parse(jsonMatch[0]);
        }
        catch (error) {
            this.logger.error(`Error generating combat scene: ${error.message}`, error.stack);
            throw new Error(`Failed to generate combat scene: ${error.message}`);
        }
    }
    getGenreName(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return 'Fantasy (giả tưởng)';
            case character_entity_1.GameGenre.MODERN:
                return 'Modern (hiện đại)';
            case character_entity_1.GameGenre.SCIFI:
                return 'Sci-Fi (khoa học viễn tưởng)';
            case character_entity_1.GameGenre.XIANXIA:
                return 'Xianxia (Tiên Hiệp)';
            case character_entity_1.GameGenre.WUXIA:
                return 'Wuxia (Võ Hiệp)';
            case character_entity_1.GameGenre.HORROR:
                return 'Horror (kinh dị)';
            case character_entity_1.GameGenre.CYBERPUNK:
                return 'Cyberpunk';
            case character_entity_1.GameGenre.STEAMPUNK:
                return 'Steampunk';
            case character_entity_1.GameGenre.POSTAPOCALYPTIC:
                return 'Post-Apocalyptic (hậu tận thế)';
            case character_entity_1.GameGenre.HISTORICAL:
                return 'Historical (lịch sử)';
            default:
                return 'Fantasy (giả tưởng)';
        }
    }
    getGenreSpecificInstructions(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return `
          This is a fantasy world with magic, knights, dragons, and mythical creatures.
          Use rich descriptions of magical elements, ancient ruins, mystical forests, and fantastical creatures.
          The tone should be epic and wondrous, with elements of heroism and adventure.
        `;
            case character_entity_1.GameGenre.XIANXIA:
                return `
          This is a Xianxia (Tiên Hiệp) world with cultivation, immortal sects, spiritual energy, and martial arts.
          Use terminology like cultivation realms, qi, meridians, spiritual energy, immortal sects, and heavenly tribulations.
          The tone should emphasize personal growth, enlightenment, and the pursuit of immortality.
          Include references to Taoist philosophy, alchemy, and the balance of yin and yang.
        `;
            case character_entity_1.GameGenre.WUXIA:
                return `
          This is a Wuxia (Võ Hiệp) world with martial arts, jianghu (martial world), sects, and honor codes.
          Focus on martial arts techniques, internal energy, swordplay, and the code of xia (chivalry).
          The tone should emphasize honor, righteousness, loyalty, and the martial arts journey.
          Include references to martial arts sects, famous weapons, and the jianghu society.
        `;
            case character_entity_1.GameGenre.SCIFI:
                return `
          This is a science fiction world with advanced technology, space travel, and futuristic societies.
          Use terminology related to technology, space, alien species, and scientific concepts.
          The tone should balance wonder at technological marvels with thoughtful exploration of their implications.
        `;
            case character_entity_1.GameGenre.CYBERPUNK:
                return `
          This is a cyberpunk world with high tech and low life, megacorporations, and cybernetic enhancements.
          Use terminology related to hacking, cyberspace, augmentations, and corporate dystopia.
          The tone should be gritty, cynical, and noir-inspired, with themes of rebellion against corporate control.
        `;
            case character_entity_1.GameGenre.HORROR:
                return `
          This is a horror world with supernatural threats, psychological terror, and survival against the unknown.
          Use descriptions that evoke fear, dread, and unease, with attention to atmosphere and tension.
          The tone should be suspenseful and unsettling, with a sense of vulnerability and limited resources.
        `;
            case character_entity_1.GameGenre.MODERN:
                return `
          This is a modern world similar to our contemporary reality, but with unique story elements.
          Use realistic descriptions of modern settings, technology, and social dynamics.
          The tone should be grounded and relatable, with conflicts based on realistic human motivations.
        `;
            default:
                return '';
        }
    }
    getGenreAttributes(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return [
                    'strength',
                    'intelligence',
                    'dexterity',
                    'charisma',
                    'health',
                    'mana',
                ];
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return [
                    'strength',
                    'intelligence',
                    'dexterity',
                    'cultivation',
                    'qi',
                    'perception',
                ];
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return [
                    'strength',
                    'intelligence',
                    'dexterity',
                    'tech',
                    'hacking',
                    'health',
                ];
            case character_entity_1.GameGenre.HORROR:
                return [
                    'strength',
                    'intelligence',
                    'dexterity',
                    'sanity',
                    'willpower',
                    'health',
                ];
            case character_entity_1.GameGenre.MODERN:
                return [
                    'strength',
                    'intelligence',
                    'charisma',
                    'education',
                    'wealth',
                    'health',
                ];
            default:
                return ['strength', 'intelligence', 'dexterity', 'charisma', 'health'];
        }
    }
    getGenreItems(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return [
                    'weapon',
                    'armor',
                    'potion',
                    'scroll',
                    'magical artifact',
                    'quest item',
                ];
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return [
                    'weapon',
                    'cultivation manual',
                    'medicinal pill',
                    'spiritual herb',
                    'talisman',
                    'sect treasure',
                ];
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return [
                    'weapon',
                    'implant',
                    'gadget',
                    'medkit',
                    'data chip',
                    'hacking tool',
                ];
            case character_entity_1.GameGenre.HORROR:
                return [
                    'weapon',
                    'light source',
                    'medical supply',
                    'protective item',
                    'ritual item',
                    'evidence',
                ];
            case character_entity_1.GameGenre.MODERN:
                return [
                    'weapon',
                    'tool',
                    'medicine',
                    'document',
                    'electronic device',
                    'key item',
                ];
            default:
                return ['weapon', 'armor', 'consumable', 'key item'];
        }
    }
    getGenreCombatInstructions(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return `
          Combat in fantasy settings involves weapons, magic spells, and tactical positioning.
          Enemies should have fantasy-appropriate abilities and weaknesses.
          Player actions should include physical attacks, magical abilities, and strategic options.
        `;
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return `
          Combat in Xianxia/Wuxia settings involves martial arts techniques, qi manipulation, and flying swords.
          Enemies should have cultivation levels, martial arts styles, and special techniques.
          Player actions should include martial arts moves, qi-based attacks, and cultivation techniques.
        `;
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return `
          Combat in sci-fi settings involves advanced weapons, technological gadgets, and tactical systems.
          Enemies should have tech-based abilities, cybernetic enhancements, or alien traits.
          Player actions should include tech-based attacks, hacking options, and environmental interactions.
        `;
            case character_entity_1.GameGenre.HORROR:
                return `
          Combat in horror settings emphasizes survival, resource management, and vulnerability.
          Enemies should be terrifying, with supernatural abilities or overwhelming physical threats.
          Player actions should include desperate attacks, evasion options, and psychological responses.
        `;
            case character_entity_1.GameGenre.MODERN:
                return `
          Combat in modern settings involves realistic weapons, physical abilities, and environmental advantages.
          Enemies should have believable motivations, equipment, and tactics.
          Player actions should include physical attacks, use of modern tools, and social options.
        `;
            default:
                return '';
        }
    }
    getGenreEnemyTypes(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return [
                    'goblin',
                    'orc',
                    'troll',
                    'undead',
                    'dragon',
                    'dark mage',
                    'bandit',
                    'demon',
                ];
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return [
                    'rival cultivator',
                    'sect disciple',
                    'demonic cultivator',
                    'spirit beast',
                    'bandit',
                    'corrupt official',
                    'ancient guardian',
                ];
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return [
                    'corporate security',
                    'street gang',
                    'rogue AI',
                    'cyborg',
                    'mutant',
                    'alien species',
                    'mercenary',
                ];
            case character_entity_1.GameGenre.HORROR:
                return [
                    'zombie',
                    'ghost',
                    'cultist',
                    'eldritch horror',
                    'serial killer',
                    'mutated creature',
                    'possessed human',
                ];
            case character_entity_1.GameGenre.MODERN:
                return [
                    'criminal',
                    'corrupt official',
                    'mercenary',
                    'terrorist',
                    'rival agent',
                    'wild animal',
                    'gang member',
                ];
            default:
                return ['enemy fighter', 'monster', 'hostile creature', 'antagonist'];
        }
    }
    getGenreRewardTypes(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return [
                    'gold coins',
                    'magical items',
                    'enchanted weapons',
                    'spell scrolls',
                    'potions',
                    'rare materials',
                ];
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return [
                    'spirit stones',
                    'cultivation manuals',
                    'medicinal pills',
                    'spiritual herbs',
                    'ancient weapons',
                    'cultivation insights',
                ];
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return [
                    'credits',
                    'cybernetic implants',
                    'advanced weapons',
                    'rare tech',
                    'data files',
                    'medical supplies',
                ];
            case character_entity_1.GameGenre.HORROR:
                return [
                    'ammunition',
                    'medical supplies',
                    'ritual items',
                    'clues',
                    'survival tools',
                    'rare artifacts',
                ];
            case character_entity_1.GameGenre.MODERN:
                return [
                    'money',
                    'weapons',
                    'information',
                    'contacts',
                    'equipment',
                    'valuable items',
                ];
            default:
                return ['currency', 'equipment', 'consumables', 'key items'];
        }
    }
};
exports.GeminiAiService = GeminiAiService;
exports.GeminiAiService = GeminiAiService = GeminiAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GeminiAiService);
//# sourceMappingURL=gemini-ai.service.js.map