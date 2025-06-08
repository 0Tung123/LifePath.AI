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
const config_1 = require("@nestjs/config");
let GeminiAiService = GeminiAiService_1 = class GeminiAiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(GeminiAiService_1.name);
        this.defaultApiKey = this.configService.get('GEMINI_API_KEY') || '';
        this.allowUserApiKeys =
            this.configService.get('ALLOW_USER_API_KEYS') === 'true';
        this.defaultGenerativeAI = new generative_ai_1.GoogleGenerativeAI(this.defaultApiKey);
        this.defaultModel = this.defaultGenerativeAI.getGenerativeModel({
            model: 'gemini-pro',
        });
    }
    getModel(userApiKey) {
        if (this.allowUserApiKeys && userApiKey) {
            try {
                const userGenerativeAI = new generative_ai_1.GoogleGenerativeAI(userApiKey);
                return userGenerativeAI.getGenerativeModel({ model: 'gemini-pro' });
            }
            catch (error) {
                this.logger.warn(`Failed to initialize with user API key: ${error.message}`);
                return this.defaultModel;
            }
        }
        return this.defaultModel;
    }
    async generateStoryContent(prompt, gameContext) {
        try {
            const character = gameContext.character;
            if (!character) {
                throw new Error('Character information is required for story generation');
            }
            const userApiKey = gameContext.user?.geminiApiKey;
            const model = this.getModel(userApiKey);
            const primaryGenre = character.primaryGenre || character_entity_1.GameGenre.FANTASY;
            const secondaryGenres = character.secondaryGenres || [];
            const customGenreDescription = character.customGenreDescription || '';
            let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;
            characterInfo += 'Attributes: ';
            const attributes = character.attributes;
            const relevantAttributes = this.getRelevantAttributes(primaryGenre, secondaryGenres);
            for (const attr of relevantAttributes) {
                if (attributes[attr] !== undefined) {
                    characterInfo += `${this.formatAttributeName(attr)} ${attributes[attr]}, `;
                }
            }
            characterInfo = characterInfo.replace(/, $/, '. ');
            if (character.inventory && character.inventory.items) {
                characterInfo += 'Inventory: ';
                character.inventory.items.forEach((item, index) => {
                    characterInfo += `${item.name} (${item.quantity})`;
                    if (index < character.inventory.items.length - 1) {
                        characterInfo += ', ';
                    }
                });
                characterInfo += '. ';
            }
            if (character.inventory && character.inventory.currency) {
                characterInfo += 'Currency: ';
                Object.entries(character.inventory.currency).forEach(([currency, amount], index, array) => {
                    characterInfo += `${amount} ${currency}`;
                    if (index < array.length - 1) {
                        characterInfo += ', ';
                    }
                });
                characterInfo += '. ';
            }
            if (character.skills && character.skills.length > 0) {
                characterInfo += 'Skills: ' + character.skills.join(', ') + '. ';
            }
            if (character.specialAbilities && character.specialAbilities.length > 0) {
                characterInfo += 'Special Abilities: ';
                character.specialAbilities.forEach((ability, index) => {
                    characterInfo += `${ability.name} (${ability.description})`;
                    if (index < character.specialAbilities.length - 1) {
                        characterInfo += ', ';
                    }
                });
                characterInfo += '. ';
            }
            let gameStateInfo = '';
            if (gameContext.gameState) {
                gameStateInfo = `
        Current Location: ${gameContext.gameState.currentLocation || 'Unknown'}
        Time: Day ${gameContext.gameState.time?.day || 1}, ${gameContext.gameState.time?.hour || 0}:${gameContext.gameState.time?.minute || 0}
        Weather: ${gameContext.gameState.weather || 'Clear'}
        `;
                if (gameContext.gameState.flags &&
                    Object.keys(gameContext.gameState.flags).length > 0) {
                    gameStateInfo += 'Story Flags: ';
                    Object.entries(gameContext.gameState.flags).forEach(([flag, value]) => {
                        gameStateInfo += `${flag}: ${value}, `;
                    });
                    gameStateInfo = gameStateInfo.replace(/, $/, '\n');
                }
            }
            let previousChoiceInfo = '';
            if (gameContext.previousChoice) {
                previousChoiceInfo = `The character's previous action was: "${gameContext.previousChoice}".`;
            }
            const genreInstructions = this.getGenreSpecificInstructions(primaryGenre);
            let secondaryGenreInfluences = '';
            if (secondaryGenres && secondaryGenres.length > 0) {
                secondaryGenreInfluences =
                    'This story also incorporates elements from: ';
                secondaryGenres.forEach((genre, index) => {
                    secondaryGenreInfluences += this.getGenreName(genre);
                    if (index < secondaryGenres.length - 1) {
                        secondaryGenreInfluences += ', ';
                    }
                });
                secondaryGenreInfluences += '. ';
            }
            let customGenreInfo = '';
            if (customGenreDescription) {
                customGenreInfo = `This story has the following custom elements: ${customGenreDescription}. `;
            }
            const fullPrompt = `
      You are a creative storyteller for an interactive text adventure game.
      
      ${characterInfo}
      
      ${gameStateInfo}
      
      ${previousChoiceInfo}
      
      Primary Genre: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      ${genreInstructions}
      
      Based on the above context and the following prompt, generate the next part of the story:
      
      "${prompt}"
      
      Provide a rich, detailed description of the scene, including sensory details, character emotions, and environmental elements.
      Write in second person perspective (e.g., "You see a towering castle in the distance").
      Keep your response focused on storytelling, without meta-commentary.
      Response length: 150-250 words.
      `;
            const result = await model.generateContent(fullPrompt);
            const response = result.response;
            return response.text();
        }
        catch (error) {
            this.logger.error(`Error generating story content: ${error.message}`, error.stack);
            return 'The storyteller pauses, gathering thoughts before continuing the tale...';
        }
    }
    async generateChoices(storyContent, gameContext) {
        try {
            const character = gameContext.character;
            if (!character) {
                throw new Error('Character information is required for choice generation');
            }
            const userApiKey = gameContext.user?.geminiApiKey;
            const model = this.getModel(userApiKey);
            const primaryGenre = character.primaryGenre || character_entity_1.GameGenre.FANTASY;
            const secondaryGenres = character.secondaryGenres || [];
            const customGenreDescription = character.customGenreDescription || '';
            let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;
            characterInfo += 'Attributes: ';
            const attributes = character.attributes;
            const relevantAttributes = this.getRelevantAttributes(primaryGenre, secondaryGenres);
            for (const attr of relevantAttributes) {
                if (attributes[attr] !== undefined) {
                    characterInfo += `${this.formatAttributeName(attr)} ${attributes[attr]}, `;
                }
            }
            characterInfo = characterInfo.replace(/, $/, '. ');
            if (character.inventory && character.inventory.items) {
                characterInfo += 'Inventory: ';
                character.inventory.items.forEach((item, index) => {
                    characterInfo += `${item.name} (${item.quantity})`;
                    if (index < character.inventory.items.length - 1) {
                        characterInfo += ', ';
                    }
                });
                characterInfo += '. ';
            }
            if (character.skills && character.skills.length > 0) {
                characterInfo += 'Skills: ' + character.skills.join(', ') + '. ';
            }
            const genreAttributes = this.getGenreAttributes(primaryGenre);
            const genreItems = this.getGenreItems(primaryGenre);
            let secondaryGenreInfluences = '';
            if (secondaryGenres && secondaryGenres.length > 0) {
                secondaryGenreInfluences = 'Also incorporate elements from: ';
                secondaryGenres.forEach((genre, index) => {
                    secondaryGenreInfluences += this.getGenreName(genre);
                    if (index < secondaryGenres.length - 1) {
                        secondaryGenreInfluences += ', ';
                    }
                });
                secondaryGenreInfluences += '. ';
            }
            let customGenreInfo = '';
            if (customGenreDescription) {
                customGenreInfo = `Consider these custom elements: ${customGenreDescription}. `;
            }
            const isCombatScene = gameContext.isCombatScene || false;
            let combatInfo = '';
            if (isCombatScene) {
                combatInfo = `
        This is a COMBAT SCENE. Generate choices that include:
        - At least one offensive action
        - At least one defensive or evasive action
        - At least one creative or environmental action
        `;
            }
            const fullPrompt = `
      You are generating meaningful choices for an interactive text adventure game.
      
      ${characterInfo}
      
      Based on the following story segment, generate 3-4 distinct choices for the player:
      
      "${storyContent}"
      
      Primary Genre: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      ${combatInfo}
      
      The choices should be appropriate for the primary genre and reflect its themes and tropes.
      Each choice should be a clear action the character can take.
      
      Relevant attributes for this genre include: ${genreAttributes.join(', ')}
      Relevant item types for this genre include: ${genreItems.join(', ')}
      
      Format each choice as a JSON object with these properties:
      1. text: The choice text shown to the player (1-15 words)
      2. consequences: Potential outcomes (not shown to player)
        - attributeChanges: {attribute: numericValue, ...}
        - itemGains: [{id: string, name: string, quantity: number}, ...]
        - itemLosses: [{id: string, name: string, quantity: number}, ...]
        - currencyChanges: {currencyType: numericValue, ...}
        - flags: {flagName: value, ...}
        - locationChange: string (if applicable)
      3. nextPrompt: Brief description of what happens next if this choice is selected
      
      Return ONLY a valid JSON array of choice objects, with no additional text.
      `;
            const result = await model.generateContent(fullPrompt);
            const response = result.response;
            const responseText = response.text();
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Failed to generate valid choice JSON');
            }
            const choicesJson = jsonMatch[0];
            return JSON.parse(choicesJson);
        }
        catch (error) {
            this.logger.error(`Error generating choices: ${error.message}`, error.stack);
            return [
                {
                    text: 'Continue cautiously',
                    consequences: {
                        attributeChanges: {},
                    },
                    nextPrompt: 'The character proceeds with caution',
                },
                {
                    text: 'Look for another path',
                    consequences: {
                        attributeChanges: {},
                    },
                    nextPrompt: 'The character searches for alternatives',
                },
                {
                    text: 'Rest and recover',
                    consequences: {
                        attributeChanges: { health: 5 },
                    },
                    nextPrompt: 'The character takes time to rest',
                },
            ];
        }
    }
    async generateCombatScene(character, location) {
        try {
            const primaryGenre = character.primaryGenre || character_entity_1.GameGenre.FANTASY;
            const secondaryGenres = character.secondaryGenres || [];
            const customGenreDescription = character.customGenreDescription || '';
            const userApiKey = character.user?.geminiApiKey;
            const model = this.getModel(userApiKey);
            const relevantAttributes = this.getRelevantAttributes(primaryGenre, secondaryGenres);
            let attributesInfo = '';
            for (const attr of relevantAttributes) {
                if (character.attributes[attr] !== undefined) {
                    attributesInfo += `${this.formatAttributeName(attr)}: ${character.attributes[attr]}, `;
                }
            }
            attributesInfo = attributesInfo.replace(/, $/, '');
            let secondaryGenreInfluences = '';
            if (secondaryGenres && secondaryGenres.length > 0) {
                secondaryGenreInfluences = 'Also incorporate elements from: ';
                secondaryGenres.forEach((genre, index) => {
                    secondaryGenreInfluences += this.getGenreName(genre);
                    if (index < secondaryGenres.length - 1) {
                        secondaryGenreInfluences += ', ';
                    }
                });
                secondaryGenreInfluences += '. ';
            }
            let customGenreInfo = '';
            if (customGenreDescription) {
                customGenreInfo = `Consider these custom elements: ${customGenreDescription}. `;
            }
            const prompt = `
      Generate a combat encounter for an interactive text adventure game.
      
      Character: ${character.name}, a level ${character.level} ${character.characterClass}
      Attributes: ${attributesInfo}
      Location: ${location}
      
      Primary Genre: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      
      Create a JSON object with the following:
      1. A description of the enemies and the combat situation
      2. Enemy data appropriate for the character's level and the genre
      
      The JSON should have this structure:
      {
        "enemies": [
          {
            "id": string,
            "name": string,
            "level": number,
            "health": number,
            "attributes": {key-value pairs of relevant attributes},
            "abilities": [string array of special abilities]
          }
        ],
        "rewards": {
          "experience": number,
          "gold": number (or appropriate currency for the genre),
          "items": [
            {
              "id": string,
              "name": string,
              "quantity": number,
              "dropChance": number (0-1)
            }
          ]
        },
        "description": Narrative description of the combat scene
      }
      
      Return ONLY a valid JSON object, with no additional text.
      `;
            const result = await model.generateContent(prompt);
            const response = result.response;
            const responseText = response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to generate valid combat scene JSON');
            }
            const combatJson = jsonMatch[0];
            return JSON.parse(combatJson);
        }
        catch (error) {
            this.logger.error(`Error generating combat scene: ${error.message}`, error.stack);
            return {
                enemies: [
                    {
                        id: 'default-enemy',
                        name: 'Mysterious Opponent',
                        level: character.level,
                        health: 50,
                        attributes: {
                            strength: 10,
                            dexterity: 10,
                        },
                        abilities: ['Basic Attack'],
                    },
                ],
                rewards: {
                    experience: 50,
                    gold: 25,
                    items: [
                        {
                            id: 'minor-healing',
                            name: 'Minor Healing Potion',
                            quantity: 1,
                            dropChance: 0.7,
                        },
                    ],
                },
                description: 'A shadowy figure emerges, challenging you to combat. Prepare yourself!',
            };
        }
    }
    getGenreName(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return 'Fantasy';
            case character_entity_1.GameGenre.SCIFI:
                return 'Science Fiction';
            case character_entity_1.GameGenre.CYBERPUNK:
                return 'Cyberpunk';
            case character_entity_1.GameGenre.XIANXIA:
                return 'Xianxia (Cultivation)';
            case character_entity_1.GameGenre.WUXIA:
                return 'Wuxia (Martial Arts)';
            case character_entity_1.GameGenre.HORROR:
                return 'Horror';
            case character_entity_1.GameGenre.MODERN:
                return 'Modern';
            case character_entity_1.GameGenre.POSTAPOCALYPTIC:
                return 'Post-Apocalyptic';
            case character_entity_1.GameGenre.STEAMPUNK:
                return 'Steampunk';
            case character_entity_1.GameGenre.HISTORICAL:
                return 'Historical';
            default:
                return 'Fantasy';
        }
    }
    getGenreSpecificInstructions(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return `
        Create a high fantasy narrative with elements of magic, mythical creatures, and epic quests.
        Use rich descriptions of magical elements, ancient ruins, mystical forests, and fantastical creatures.
        Incorporate themes of heroism, destiny, and the struggle between good and evil.
        `;
            case character_entity_1.GameGenre.SCIFI:
                return `
        Create a science fiction narrative with advanced technology, space exploration, and futuristic societies.
        Use descriptions that emphasize technology, alien worlds, spacecraft, and scientific concepts.
        Incorporate themes of discovery, the impact of technology on society, and humanity's place in the universe.
        `;
            case character_entity_1.GameGenre.CYBERPUNK:
                return `
        Create a cyberpunk narrative with high tech and low life, corporate dominance, and digital realms.
        Use descriptions that contrast advanced technology with urban decay, neon-lit streets, and digital interfaces.
        Incorporate themes of rebellion against corporate control, transhumanism, and the blurring line between human and machine.
        `;
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return `
        Create a narrative of martial arts, cultivation, and Eastern mysticism.
        Use descriptions that emphasize qi manipulation, martial techniques, ancient sects, and spiritual growth.
        Incorporate themes of personal cultivation, honor, martial hierarchies, and the pursuit of immortality.
        `;
            case character_entity_1.GameGenre.HORROR:
                return `
        Create a horror narrative with elements of fear, the unknown, and psychological tension.
        Use descriptions that evoke fear, dread, and unease, with attention to atmosphere and tension.
        Incorporate themes of survival, sanity, and confronting the unknown or supernatural.
        `;
            case character_entity_1.GameGenre.MODERN:
                return `
        Create a contemporary narrative set in the present day with realistic elements.
        Use realistic descriptions of modern settings, technology, and social dynamics.
        Incorporate themes relevant to contemporary life, relationships, and societal challenges.
        `;
            case character_entity_1.GameGenre.POSTAPOCALYPTIC:
                return `
        Create a narrative set after a global catastrophe, focusing on survival and rebuilding.
        Use descriptions of ruined landscapes, scarcity, makeshift communities, and environmental hazards.
        Incorporate themes of survival, adaptation, hope in adversity, and the rebuilding of society.
        `;
            case character_entity_1.GameGenre.STEAMPUNK:
                return `
        Create a narrative with Victorian aesthetics, steam-powered technology, and retrofuturistic elements.
        Use descriptions of brass machinery, steam engines, airships, and alternative history technologies.
        Incorporate themes of invention, exploration, class dynamics, and the impact of technology.
        `;
            case character_entity_1.GameGenre.HISTORICAL:
                return `
        Create a narrative set in a specific historical period with attention to historical accuracy.
        Use descriptions that capture the setting, customs, technology, and social dynamics of the era.
        Incorporate themes relevant to the historical period while maintaining an engaging narrative.
        `;
            default:
                return `
        Create an engaging narrative with vivid descriptions and meaningful choices.
        Focus on character development, world-building, and an immersive story experience.
        `;
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
                return ['strength', 'dexterity', 'qi', 'cultivation', 'perception'];
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return ['intelligence', 'tech', 'hacking', 'piloting'];
            case character_entity_1.GameGenre.HORROR:
                return ['sanity', 'willpower', 'perception'];
            case character_entity_1.GameGenre.MODERN:
                return ['charisma', 'education', 'wealth', 'influence'];
            case character_entity_1.GameGenre.POSTAPOCALYPTIC:
                return ['strength', 'survival', 'scavenging', 'radiation resistance'];
            case character_entity_1.GameGenre.STEAMPUNK:
                return ['intelligence', 'engineering', 'social standing'];
            default:
                return ['strength', 'intelligence', 'dexterity', 'charisma'];
        }
    }
    getGenreItems(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return ['weapon', 'armor', 'potion', 'scroll', 'magical artifact'];
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return [
                    'weapon',
                    'cultivation manual',
                    'medicinal herb',
                    'qi pill',
                    'talisman',
                ];
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return ['weapon', 'implant', 'gadget', 'medkit', 'data chip'];
            case character_entity_1.GameGenre.HORROR:
                return [
                    'weapon',
                    'light source',
                    'medical supply',
                    'ritual item',
                    'key',
                ];
            case character_entity_1.GameGenre.MODERN:
                return ['smartphone', 'weapon', 'tool', 'medicine', 'document'];
            case character_entity_1.GameGenre.POSTAPOCALYPTIC:
                return ['weapon', 'scrap', 'food', 'water', 'medicine', 'fuel'];
            case character_entity_1.GameGenre.STEAMPUNK:
                return ['gadget', 'weapon', 'tool', 'blueprint', 'mechanical part'];
            default:
                return ['weapon', 'tool', 'consumable', 'key item'];
        }
    }
    getRelevantAttributes(primaryGenre, secondaryGenres) {
        const attributes = new Set(this.getGenreAttributes(primaryGenre));
        if (secondaryGenres && secondaryGenres.length > 0) {
            secondaryGenres.forEach((genre) => {
                this.getGenreAttributes(genre).forEach((attr) => attributes.add(attr));
            });
        }
        ['strength', 'intelligence', 'dexterity', 'charisma', 'health'].forEach((attr) => attributes.add(attr));
        return Array.from(attributes);
    }
    formatAttributeName(attr) {
        return attr.charAt(0).toUpperCase() + attr.slice(1);
    }
    async generateContent(prompt, userApiKey) {
        try {
            const model = this.getModel(userApiKey);
            const result = await model.generateContent(prompt);
            const response = result.response;
            return response.text();
        }
        catch (error) {
            this.logger.error(`Error generating content: ${error.message}`, error.stack);
            return 'Unable to generate content at this time.';
        }
    }
};
exports.GeminiAiService = GeminiAiService;
exports.GeminiAiService = GeminiAiService = GeminiAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiAiService);
//# sourceMappingURL=gemini-ai.service.js.map