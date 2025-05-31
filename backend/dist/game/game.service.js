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
var GameService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("./entities/character.entity");
const game_session_entity_1 = require("./entities/game-session.entity");
const story_node_entity_1 = require("./entities/story-node.entity");
const choice_entity_1 = require("./entities/choice.entity");
const gemini_ai_service_1 = require("./gemini-ai.service");
const character_generator_service_1 = require("./character-generator.service");
const user_entity_1 = require("../user/entities/user.entity");
let GameService = GameService_1 = class GameService {
    constructor(characterRepository, gameSessionRepository, storyNodeRepository, choiceRepository, geminiAiService, characterGeneratorService) {
        this.characterRepository = characterRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.storyNodeRepository = storyNodeRepository;
        this.choiceRepository = choiceRepository;
        this.geminiAiService = geminiAiService;
        this.characterGeneratorService = characterGeneratorService;
        this.logger = new common_1.Logger(GameService_1.name);
    }
    async createCharacter(userId, characterData) {
        const user = new user_entity_1.User();
        user.id = userId;
        const defaultGenre = characterData.genre || character_entity_1.GameGenre.FANTASY;
        const character = this.characterRepository.create({
            ...characterData,
            user,
            genre: defaultGenre,
            attributes: characterData.attributes || this.getDefaultAttributes(defaultGenre),
            skills: characterData.skills || [],
            specialAbilities: characterData.specialAbilities || [],
            inventory: characterData.inventory || this.getDefaultInventory(defaultGenre),
            relationships: characterData.relationships || [],
        });
        return this.characterRepository.save(character);
    }
    async generateCharacterFromDescription(userId, description, preferredGenre) {
        try {
            const generatedCharacter = await this.characterGeneratorService.generateCharacterFromDescription(description, preferredGenre);
            return this.createCharacter(userId, generatedCharacter);
        }
        catch (error) {
            this.logger.error(`Error generating character from description: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to generate character: ${error.message}`);
        }
    }
    getDefaultAttributes(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return {
                    strength: 10,
                    intelligence: 10,
                    dexterity: 10,
                    charisma: 10,
                    health: 100,
                    mana: 100,
                };
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return {
                    strength: 10,
                    intelligence: 10,
                    dexterity: 10,
                    cultivation: 1,
                    qi: 100,
                    perception: 10,
                };
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return {
                    strength: 10,
                    intelligence: 10,
                    dexterity: 10,
                    tech: 10,
                    hacking: 5,
                    health: 100,
                };
            case character_entity_1.GameGenre.MODERN:
                return {
                    strength: 10,
                    intelligence: 10,
                    charisma: 10,
                    education: 10,
                    wealth: 10,
                    health: 100,
                };
            case character_entity_1.GameGenre.HORROR:
                return {
                    strength: 10,
                    intelligence: 10,
                    dexterity: 10,
                    sanity: 100,
                    willpower: 10,
                    health: 100,
                };
            default:
                return {
                    strength: 10,
                    intelligence: 10,
                    dexterity: 10,
                    charisma: 10,
                    health: 100,
                    mana: 100,
                };
        }
    }
    getDefaultInventory(genre) {
        const defaultItems = [];
        let currency = {};
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                defaultItems.push({
                    id: 'starter-weapon',
                    name: 'Rusty Sword',
                    description: 'A basic sword showing signs of wear.',
                    quantity: 1,
                    type: 'weapon',
                    rarity: 'common',
                });
                defaultItems.push({
                    id: 'health-potion',
                    name: 'Health Potion',
                    description: 'Restores 50 health when consumed.',
                    quantity: 3,
                    type: 'consumable',
                    rarity: 'common',
                });
                currency = { gold: 50, silver: 100 };
                break;
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                defaultItems.push({
                    id: 'starter-weapon',
                    name: 'Training Sword',
                    description: 'A basic sword for martial arts practice.',
                    quantity: 1,
                    type: 'weapon',
                    rarity: 'common',
                });
                defaultItems.push({
                    id: 'qi-pill',
                    name: 'Qi Cultivation Pill',
                    description: 'Helps restore qi and improve cultivation.',
                    quantity: 3,
                    type: 'consumable',
                    rarity: 'common',
                });
                currency = { spirit_stones: 5, yuan: 1000 };
                break;
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                defaultItems.push({
                    id: 'starter-weapon',
                    name: 'Basic Blaster',
                    description: 'A standard-issue energy weapon.',
                    quantity: 1,
                    type: 'weapon',
                    rarity: 'common',
                });
                defaultItems.push({
                    id: 'medkit',
                    name: 'MedKit',
                    description: 'Restores 50 health when used.',
                    quantity: 2,
                    type: 'consumable',
                    rarity: 'common',
                });
                currency = { credits: 1000 };
                break;
            case character_entity_1.GameGenre.MODERN:
                defaultItems.push({
                    id: 'smartphone',
                    name: 'Smartphone',
                    description: 'A modern smartphone with various apps.',
                    quantity: 1,
                    type: 'tool',
                    rarity: 'common',
                });
                defaultItems.push({
                    id: 'first-aid',
                    name: 'First Aid Kit',
                    description: 'Basic medical supplies for emergencies.',
                    quantity: 1,
                    type: 'consumable',
                    rarity: 'common',
                });
                currency = { dollars: 1000 };
                break;
            case character_entity_1.GameGenre.HORROR:
                defaultItems.push({
                    id: 'flashlight',
                    name: 'Flashlight',
                    description: 'A reliable flashlight with batteries.',
                    quantity: 1,
                    type: 'tool',
                    rarity: 'common',
                });
                defaultItems.push({
                    id: 'bandages',
                    name: 'Bandages',
                    description: 'Basic medical supplies to stop bleeding.',
                    quantity: 3,
                    type: 'consumable',
                    rarity: 'common',
                });
                currency = { dollars: 50 };
                break;
            default:
                defaultItems.push({
                    id: 'starter-item',
                    name: 'Basic Equipment',
                    description: 'Standard equipment for beginners.',
                    quantity: 1,
                    type: 'equipment',
                    rarity: 'common',
                });
                currency = { gold: 100 };
        }
        return {
            items: defaultItems,
            currency,
        };
    }
    async getCharactersByUserId(userId) {
        return this.characterRepository.find({
            where: { user: { id: userId } },
        });
    }
    async getCharacterById(id) {
        const character = await this.characterRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!character) {
            throw new common_1.NotFoundException(`Character with ID ${id} not found`);
        }
        return character;
    }
    async startNewGameSession(characterId) {
        const character = await this.getCharacterById(characterId);
        const gameSession = this.gameSessionRepository.create({
            character,
            isActive: true,
            gameState: {
                visitedLocations: [],
                completedQuests: [],
                acquiredItems: [],
                npcRelations: {},
                flags: {},
            },
        });
        const savedSession = await this.gameSessionRepository.save(gameSession);
        const initialPrompt = `A new adventure begins for ${character.name}, a level ${character.level} ${character.characterClass}. 
    The journey starts in a small village where rumors of strange occurrences have been circulating.`;
        const storyContent = await this.geminiAiService.generateStoryContent(initialPrompt, { character, gameState: gameSession.gameState });
        const storyNode = this.storyNodeRepository.create({
            content: storyContent,
            location: 'Starting Village',
            gameSession: savedSession,
        });
        const savedStoryNode = await this.storyNodeRepository.save(storyNode);
        const choices = await this.geminiAiService.generateChoices(storyContent, {
            character,
            gameState: gameSession.gameState,
        });
        for (const choiceData of choices) {
            const choice = this.choiceRepository.create({
                ...choiceData,
                storyNode: savedStoryNode,
            });
            await this.choiceRepository.save(choice);
        }
        savedSession.currentStoryNode = savedStoryNode;
        savedSession.currentStoryNodeId = savedStoryNode.id;
        await this.gameSessionRepository.save(savedSession);
        return this.getGameSessionWithDetails(savedSession.id);
    }
    async getActiveGameSessionsByUserId(userId) {
        return this.gameSessionRepository.find({
            where: { character: { user: { id: userId } }, isActive: true },
            relations: ['character', 'currentStoryNode'],
        });
    }
    async getGameSessionById(id) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id },
            relations: ['character', 'currentStoryNode'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${id} not found`);
        }
        return gameSession;
    }
    async getGameSessionWithDetails(id) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id },
            relations: ['character', 'currentStoryNode', 'currentStoryNode.choices'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${id} not found`);
        }
        return gameSession;
    }
    async saveGameSession(id) {
        const gameSession = await this.getGameSessionById(id);
        gameSession.lastSavedAt = new Date();
        return this.gameSessionRepository.save(gameSession);
    }
    async makeChoice(gameSessionId, choiceId) {
        const gameSession = await this.getGameSessionWithDetails(gameSessionId);
        if (!gameSession.isActive) {
            throw new common_1.BadRequestException('This game session is no longer active');
        }
        const choice = await this.choiceRepository.findOne({
            where: { id: choiceId },
            relations: ['storyNode'],
        });
        if (!choice) {
            throw new common_1.NotFoundException(`Choice with ID ${choiceId} not found`);
        }
        if (choice.storyNode.id !== gameSession.currentStoryNodeId) {
            throw new common_1.BadRequestException('This choice is not available in the current story node');
        }
        const character = await this.getCharacterById(gameSession.character.id);
        if (choice.requiredAttribute && choice.requiredAttributeValue) {
            const attributeValue = character.attributes[choice.requiredAttribute];
            if (!attributeValue || attributeValue < choice.requiredAttributeValue) {
                throw new common_1.BadRequestException(`Your ${choice.requiredAttribute} is too low for this choice`);
            }
        }
        if (choice.requiredSkill &&
            !character.skills.includes(choice.requiredSkill)) {
            throw new common_1.BadRequestException(`You don't have the required skill: ${choice.requiredSkill}`);
        }
        if (choice.requiredItem) {
            const hasItem = character.inventory.items.some((item) => item.name === choice.requiredItem && item.quantity > 0);
            if (!hasItem) {
                throw new common_1.BadRequestException(`You don't have the required item: ${choice.requiredItem}`);
            }
        }
        if (choice.consequences) {
            if (choice.consequences.attributeChanges) {
                for (const [attr, change] of Object.entries(choice.consequences.attributeChanges)) {
                    if (character.attributes[attr] !== undefined) {
                        character.attributes[attr] += change;
                    }
                }
            }
            if (choice.consequences.skillGains &&
                choice.consequences.skillGains.length > 0) {
                for (const skill of choice.consequences.skillGains) {
                    if (!character.skills.includes(skill)) {
                        character.skills.push(skill);
                    }
                }
            }
            if (choice.consequences.itemGains &&
                choice.consequences.itemGains.length > 0) {
                for (const itemGain of choice.consequences.itemGains) {
                    const existingItem = character.inventory.items.find((item) => item.id === itemGain.id || item.name === itemGain.name);
                    if (existingItem) {
                        existingItem.quantity += itemGain.quantity;
                    }
                    else {
                        character.inventory.items.push({
                            id: itemGain.id || `item-${Date.now()}`,
                            name: itemGain.name,
                            description: itemGain.description || `A ${itemGain.name}`,
                            quantity: itemGain.quantity,
                            type: itemGain.type || 'misc',
                            rarity: itemGain.rarity || 'common',
                            value: itemGain.value || 0,
                        });
                    }
                }
            }
            if (choice.consequences.itemLosses &&
                choice.consequences.itemLosses.length > 0) {
                for (const itemLoss of choice.consequences.itemLosses) {
                    const existingItemIndex = character.inventory.items.findIndex((item) => item.id === itemLoss.id);
                    if (existingItemIndex >= 0) {
                        const existingItem = character.inventory.items[existingItemIndex];
                        existingItem.quantity -= itemLoss.quantity;
                        if (existingItem.quantity <= 0) {
                            character.inventory.items.splice(existingItemIndex, 1);
                        }
                    }
                }
            }
            if (choice.consequences.relationChanges) {
                for (const [npcId, change] of Object.entries(choice.consequences.relationChanges)) {
                    gameSession.gameState.npcRelations[npcId] =
                        (gameSession.gameState.npcRelations[npcId] || 0) + change;
                }
            }
            if (choice.consequences.flagChanges) {
                for (const [flag, value] of Object.entries(choice.consequences.flagChanges)) {
                    gameSession.gameState.flags[flag] = value;
                }
            }
        }
        await this.characterRepository.save(character);
        const nextPrompt = choice.nextPrompt ||
            `After ${character.name} decides to ${choice.text.toLowerCase()}, what happens next?`;
        let isCombatScene = false;
        let combatData = undefined;
        if (Math.random() < 0.2) {
            isCombatScene = true;
            const location = gameSession.currentStoryNode.location || 'unknown location';
            combatData = await this.geminiAiService.generateCombatScene(character, location);
        }
        const storyContent = await this.geminiAiService.generateStoryContent(nextPrompt, {
            character,
            gameState: gameSession.gameState,
            previousChoice: choice.text,
        });
        const storyNode = this.storyNodeRepository.create({
            content: storyContent,
            location: gameSession.currentStoryNode.location,
            gameSession,
            isCombatScene,
            combatData,
        });
        const savedStoryNode = await this.storyNodeRepository.save(storyNode);
        const choices = await this.geminiAiService.generateChoices(storyContent, {
            character,
            gameState: gameSession.gameState,
        });
        for (const choiceData of choices) {
            const newChoice = this.choiceRepository.create({
                ...choiceData,
                storyNode: savedStoryNode,
            });
            await this.choiceRepository.save(newChoice);
        }
        gameSession.currentStoryNode = savedStoryNode;
        gameSession.currentStoryNodeId = savedStoryNode.id;
        gameSession.lastSavedAt = new Date();
        if (savedStoryNode.location &&
            !gameSession.gameState.visitedLocations.includes(savedStoryNode.location)) {
            gameSession.gameState.visitedLocations.push(savedStoryNode.location);
        }
        await this.gameSessionRepository.save(gameSession);
        return this.getGameSessionWithDetails(gameSession.id);
    }
    async endGameSession(id) {
        const gameSession = await this.getGameSessionById(id);
        gameSession.isActive = false;
        return this.gameSessionRepository.save(gameSession);
    }
};
exports.GameService = GameService;
exports.GameService = GameService = GameService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(1, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(2, (0, typeorm_1.InjectRepository)(story_node_entity_1.StoryNode)),
    __param(3, (0, typeorm_1.InjectRepository)(choice_entity_1.Choice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        gemini_ai_service_1.GeminiAiService,
        character_generator_service_1.CharacterGeneratorService])
], GameService);
//# sourceMappingURL=game.service.js.map