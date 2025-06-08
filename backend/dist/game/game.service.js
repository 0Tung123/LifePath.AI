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
const story_path_entity_1 = require("./entities/story-path.entity");
const gemini_ai_service_1 = require("./gemini-ai.service");
const character_generator_service_1 = require("./character-generator.service");
const user_entity_1 = require("../user/entities/user.entity");
let GameService = GameService_1 = class GameService {
    constructor(characterRepository, gameSessionRepository, storyNodeRepository, choiceRepository, storyPathRepository, userRepository, geminiAiService, characterGeneratorService) {
        this.characterRepository = characterRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.storyNodeRepository = storyNodeRepository;
        this.choiceRepository = choiceRepository;
        this.storyPathRepository = storyPathRepository;
        this.userRepository = userRepository;
        this.geminiAiService = geminiAiService;
        this.characterGeneratorService = characterGeneratorService;
        this.logger = new common_1.Logger(GameService_1.name);
    }
    async createCharacter(userId, characterData) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            if (!characterData.attributes) {
                const defaultAttributes = this.getDefaultAttributes(characterData.primaryGenre || character_entity_1.GameGenre.FANTASY, characterData.secondaryGenres);
                characterData.attributes = defaultAttributes;
            }
            if (!characterData.inventory) {
                characterData.inventory = this.getDefaultInventory(characterData.primaryGenre || character_entity_1.GameGenre.FANTASY, characterData.secondaryGenres);
            }
            if (!characterData.skills || characterData.skills.length === 0) {
                characterData.skills = ['Basic Attack', 'Defend'];
            }
            const character = this.characterRepository.create({
                ...characterData,
                user,
            });
            return this.characterRepository.save(character);
        }
        catch (error) {
            this.logger.error(`Error creating character: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to create character: ${error.message}`);
        }
    }
    async generateCharacterFromDescription(userId, description, primaryGenre, secondaryGenres, customGenreDescription) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            const generatedCharacter = await this.characterGeneratorService.generateCharacterFromDescription(description, primaryGenre, user.geminiApiKey || undefined);
            if (secondaryGenres && secondaryGenres.length > 0) {
                generatedCharacter.secondaryGenres = secondaryGenres;
            }
            if (customGenreDescription) {
                generatedCharacter.customGenreDescription = customGenreDescription;
            }
            return this.createCharacter(userId, generatedCharacter);
        }
        catch (error) {
            this.logger.error(`Error generating character from description: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to generate character: ${error.message}`);
        }
    }
    getDefaultAttributes(primaryGenre, secondaryGenres) {
        const baseAttributes = {
            strength: 10,
            intelligence: 10,
            dexterity: 10,
            charisma: 10,
            health: 100,
            mana: 100,
        };
        this.addGenreAttributes(baseAttributes, primaryGenre);
        if (secondaryGenres && secondaryGenres.length > 0) {
            secondaryGenres.forEach((genre) => {
                this.addGenreAttributes(baseAttributes, genre, true);
            });
        }
        return baseAttributes;
    }
    addGenreAttributes(attributes, genre, isSecondary = false) {
        const multiplier = isSecondary ? 0.7 : 1;
        switch (genre) {
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                attributes.qi = attributes.qi || Math.round(100 * multiplier);
                attributes.cultivation =
                    attributes.cultivation || Math.round(1 * multiplier);
                attributes.perception =
                    attributes.perception || Math.round(10 * multiplier);
                break;
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                attributes.tech = attributes.tech || Math.round(10 * multiplier);
                attributes.hacking = attributes.hacking || Math.round(5 * multiplier);
                break;
            case character_entity_1.GameGenre.HORROR:
                attributes.sanity = attributes.sanity || Math.round(100 * multiplier);
                attributes.willpower =
                    attributes.willpower || Math.round(10 * multiplier);
                break;
            case character_entity_1.GameGenre.MODERN:
                attributes.education =
                    attributes.education || Math.round(10 * multiplier);
                attributes.wealth = attributes.wealth || Math.round(10 * multiplier);
                attributes.influence =
                    attributes.influence || Math.round(5 * multiplier);
                break;
        }
    }
    getDefaultInventory(primaryGenre, secondaryGenres) {
        const defaultItems = [];
        let currency = {};
        this.addGenreItems(defaultItems, primaryGenre, false);
        if (secondaryGenres && secondaryGenres.length > 0) {
            secondaryGenres.forEach((genre) => {
                this.addGenreItems(defaultItems, genre, true);
            });
        }
        currency = this.getGenreCurrency(primaryGenre);
        if (secondaryGenres && secondaryGenres.length > 0) {
            secondaryGenres.forEach((genre) => {
                const secondaryCurrency = this.getGenreCurrency(genre, 0.5);
                Object.keys(secondaryCurrency).forEach((key) => {
                    currency[key] = (currency[key] || 0) + secondaryCurrency[key];
                });
            });
        }
        return {
            items: defaultItems,
            currency,
        };
    }
    addGenreItems(items, genre, isSecondary = false) {
        const itemsToAdd = isSecondary ? 1 : 2;
        let addedItems = 0;
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'weapon', 'Rusty Sword')) {
                    items.push({
                        id: `fantasy-weapon-${Date.now()}`,
                        name: 'Rusty Sword',
                        description: 'A basic sword showing signs of wear.',
                        quantity: 1,
                        type: 'weapon',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'consumable', 'Health Potion')) {
                    items.push({
                        id: `fantasy-potion-${Date.now()}`,
                        name: 'Health Potion',
                        description: 'Restores 50 health when consumed.',
                        quantity: isSecondary ? 1 : 3,
                        type: 'consumable',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                break;
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'weapon', 'Training Sword')) {
                    items.push({
                        id: `wuxia-weapon-${Date.now()}`,
                        name: 'Training Sword',
                        description: 'A basic sword for martial arts practice.',
                        quantity: 1,
                        type: 'weapon',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'consumable', 'Qi Cultivation Pill')) {
                    items.push({
                        id: `qi-pill-${Date.now()}`,
                        name: 'Qi Cultivation Pill',
                        description: 'Helps restore qi and improve cultivation.',
                        quantity: isSecondary ? 1 : 3,
                        type: 'consumable',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                break;
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'weapon', 'Basic Blaster')) {
                    items.push({
                        id: `scifi-weapon-${Date.now()}`,
                        name: 'Basic Blaster',
                        description: 'A standard-issue energy weapon.',
                        quantity: 1,
                        type: 'weapon',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'consumable', 'MedKit')) {
                    items.push({
                        id: `scifi-medkit-${Date.now()}`,
                        name: 'MedKit',
                        description: 'Restores 50 health when used.',
                        quantity: isSecondary ? 1 : 2,
                        type: 'consumable',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                break;
            case character_entity_1.GameGenre.HORROR:
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'tool', 'Flashlight')) {
                    items.push({
                        id: `horror-tool-${Date.now()}`,
                        name: 'Flashlight',
                        description: 'A reliable flashlight with batteries.',
                        quantity: 1,
                        type: 'tool',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'consumable', 'Bandages')) {
                    items.push({
                        id: `horror-bandages-${Date.now()}`,
                        name: 'Bandages',
                        description: 'Basic medical supplies to stop bleeding.',
                        quantity: isSecondary ? 1 : 3,
                        type: 'consumable',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                break;
            case character_entity_1.GameGenre.MODERN:
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'tool', 'Smartphone')) {
                    items.push({
                        id: `modern-tool-${Date.now()}`,
                        name: 'Smartphone',
                        description: 'A modern smartphone with various apps.',
                        quantity: 1,
                        type: 'tool',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                if (addedItems < itemsToAdd &&
                    !this.hasItemOfType(items, 'consumable', 'First Aid Kit')) {
                    items.push({
                        id: `modern-aid-${Date.now()}`,
                        name: 'First Aid Kit',
                        description: 'Basic medical supplies for emergencies.',
                        quantity: isSecondary ? 1 : 1,
                        type: 'consumable',
                        rarity: 'common',
                    });
                    addedItems++;
                }
                break;
        }
    }
    hasItemOfType(items, type, name) {
        return items.some((item) => item.type === type && item.name === name);
    }
    getGenreCurrency(genre, multiplier = 1) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return {
                    gold: Math.round(50 * multiplier),
                    silver: Math.round(100 * multiplier),
                };
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return {
                    spirit_stones: Math.round(5 * multiplier),
                    yuan: Math.round(1000 * multiplier),
                };
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return { credits: Math.round(1000 * multiplier) };
            case character_entity_1.GameGenre.HORROR:
            case character_entity_1.GameGenre.MODERN:
                return { dollars: Math.round(1000 * multiplier) };
            default:
                return { gold: Math.round(100 * multiplier) };
        }
    }
    async getCharactersByUserId(userId) {
        return this.characterRepository.find({
            where: { user: { id: userId } },
        });
    }
    async getCharacterById(id) {
        const character = await this.characterRepository.findOne({
            where: { id },
            relations: ['user', 'gameSessions'],
        });
        if (!character) {
            throw new common_1.NotFoundException(`Character with ID ${id} not found`);
        }
        return character;
    }
    async updateCharacter(id, updateData) {
        const character = await this.getCharacterById(id);
        Object.assign(character, updateData);
        return this.characterRepository.save(character);
    }
    async startGameSession(characterId, initialPrompt) {
        try {
            const character = await this.getCharacterById(characterId);
            const gameState = {
                currentLocation: 'Starting Area',
                questLog: [],
                completedQuests: [],
                discoveredLocations: ['Starting Area'],
                visitedLocations: ['Starting Area'],
                acquiredItems: [],
                npcRelations: {},
                flags: {},
                time: {
                    day: 1,
                    hour: 8,
                    minute: 0,
                },
                weather: 'clear',
            };
            const gameSession = this.gameSessionRepository.create({
                character,
                gameState,
                isActive: true,
            });
            const savedSession = await this.gameSessionRepository.save(gameSession);
            if (!initialPrompt) {
                initialPrompt = `You are ${character.name}, a ${character.characterClass} in a ${character.primaryGenre} world${character.customGenreDescription
                    ? ' with ' + character.customGenreDescription
                    : ''}. Your adventure begins...`;
            }
            const storyContent = await this.geminiAiService.generateStoryContent(initialPrompt, {
                character,
                gameState: gameSession.gameState,
                user: character.user,
            });
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
            await this.gameSessionRepository.save(savedSession);
            return this.getGameSessionWithDetails(savedSession.id);
        }
        catch (error) {
            this.logger.error(`Error starting game session: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to start game session: ${error.message}`);
        }
    }
    async getGameSessionWithDetails(sessionId) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: sessionId },
            relations: [
                'character',
                'currentStoryNode',
                'currentStoryNode.choices',
                'storyNodes',
            ],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${sessionId} not found`);
        }
        return gameSession;
    }
    async getActiveGameSessionForCharacter(characterId) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { character: { id: characterId }, isActive: true },
            relations: ['character', 'currentStoryNode', 'currentStoryNode.choices'],
            order: { lastSavedAt: 'DESC' },
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`No active game session found for character ${characterId}`);
        }
        return gameSession;
    }
    async makeChoice(sessionId, choiceId) {
        try {
            const gameSession = await this.getGameSessionWithDetails(sessionId);
            const character = await this.getCharacterById(gameSession.character.id);
            const choice = await this.choiceRepository.findOne({
                where: { id: choiceId },
                relations: ['storyNode'],
            });
            if (!choice) {
                throw new common_1.NotFoundException(`Choice with ID ${choiceId} not found`);
            }
            if (choice.storyNode.id !== gameSession.currentStoryNode.id) {
                throw new common_1.BadRequestException('The selected choice does not belong to the current story node');
            }
            if (choice.consequences) {
                if (choice.consequences.attributeChanges) {
                    for (const [attr, change] of Object.entries(choice.consequences.attributeChanges)) {
                        if (character.attributes[attr] !== undefined) {
                            character.attributes[attr] += change;
                        }
                    }
                    await this.characterRepository.save(character);
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
                        const existingItemIndex = character.inventory.items.findIndex((item) => item.id === itemLoss.id || item.name === itemLoss.name);
                        if (existingItemIndex >= 0) {
                            const item = character.inventory.items[existingItemIndex];
                            item.quantity -= itemLoss.quantity;
                            if (item.quantity <= 0) {
                                character.inventory.items.splice(existingItemIndex, 1);
                            }
                        }
                    }
                }
                if (choice.consequences.currencyChanges) {
                    for (const [currency, amount] of Object.entries(choice.consequences.currencyChanges)) {
                        if (character.inventory.currency[currency] !== undefined) {
                            character.inventory.currency[currency] += amount;
                            if (character.inventory.currency[currency] < 0) {
                                character.inventory.currency[currency] = 0;
                            }
                        }
                        else if (amount > 0) {
                            character.inventory.currency[currency] = amount;
                        }
                    }
                }
                await this.characterRepository.save(character);
                if (choice.consequences.flagChanges) {
                    for (const [flag, value] of Object.entries(choice.consequences.flagChanges)) {
                        gameSession.gameState.flags[flag] = value;
                    }
                }
                if (choice.consequences.flags) {
                    for (const [flag, value] of Object.entries(choice.consequences.flags)) {
                        gameSession.gameState.flags[flag] = value;
                    }
                }
                if (choice.consequences.locationChange) {
                    gameSession.gameState.currentLocation =
                        choice.consequences.locationChange;
                    if (!gameSession.gameState.discoveredLocations.includes(choice.consequences.locationChange)) {
                        gameSession.gameState.discoveredLocations.push(choice.consequences.locationChange);
                    }
                }
            }
            const nextPrompt = choice.nextPrompt ||
                `After ${character.name} decides to ${choice.text.toLowerCase()}, what happens next?`;
            let isCombatScene = false;
            let combatData = undefined;
            if (Math.random() < 0.2) {
                isCombatScene = true;
                const location = gameSession.currentStoryNode.location || 'unknown location';
                combatData = await this.geminiAiService.generateCombatScene(character, location);
            }
            gameSession.currentStoryNode.isVisited = true;
            await this.storyNodeRepository.save(gameSession.currentStoryNode);
            const currentStepOrder = await this.storyPathRepository.count({
                where: { gameSession: { id: gameSession.id }, isActive: true },
            });
            const lastActivePath = await this.storyPathRepository.findOne({
                where: { gameSession: { id: gameSession.id }, isActive: true },
                order: { stepOrder: 'DESC' },
            });
            const branchId = lastActivePath?.branchId || `main-branch-${gameSession.id}`;
            const storyPath = this.storyPathRepository.create({
                nodeId: gameSession.currentStoryNode.id,
                choiceId: choice.id,
                choiceText: choice.text,
                stepOrder: currentStepOrder,
                isActive: true,
                branchId,
                parentPathId: lastActivePath?.id,
                gameSession,
                storyNode: gameSession.currentStoryNode,
            });
            await this.storyPathRepository.save(storyPath);
            const storyContent = await this.geminiAiService.generateStoryContent(nextPrompt, {
                character,
                gameState: gameSession.gameState,
                previousChoice: choice.text,
            });
            let existingNode = await this.storyNodeRepository.findOne({
                where: {
                    parentNodeId: gameSession.currentStoryNode.id,
                    choiceIdFromParent: choice.id,
                },
                relations: ['choices'],
            });
            let storyNode;
            if (existingNode) {
                storyNode = existingNode;
            }
            else {
                storyNode = this.storyNodeRepository.create({
                    content: storyContent,
                    location: gameSession.currentStoryNode.location,
                    gameSession,
                    isCombatScene,
                    combatData,
                    parentNodeId: gameSession.currentStoryNode.id,
                    choiceIdFromParent: choice.id,
                    depth: gameSession.currentStoryNode.depth + 1,
                    parentNode: gameSession.currentStoryNode,
                });
                const savedStoryNode = await this.storyNodeRepository.save(storyNode);
                const choices = await this.geminiAiService.generateChoices(storyContent, {
                    character,
                    gameState: gameSession.gameState,
                    isCombatScene,
                });
                for (const choiceData of choices) {
                    const newChoice = this.choiceRepository.create({
                        ...choiceData,
                        storyNode: savedStoryNode,
                    });
                    await this.choiceRepository.save(newChoice);
                }
                storyNode = savedStoryNode;
            }
            gameSession.currentStoryNode.selectedChoiceId = choice.id;
            gameSession.currentStoryNode.selectedChoiceText = choice.text;
            await this.storyNodeRepository.save(gameSession.currentStoryNode);
            gameSession.currentStoryNode = storyNode;
            await this.gameSessionRepository.save(gameSession);
            return this.getGameSessionWithDetails(gameSession.id);
        }
        catch (error) {
            this.logger.error(`Error making choice: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to process choice: ${error.message}`);
        }
    }
    async goBackToNode(sessionId, nodeId) {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: sessionId },
                relations: ['character', 'currentStoryNode', 'storyPaths'],
            });
            if (!gameSession) {
                throw new common_1.NotFoundException('Game session not found');
            }
            const targetNode = await this.storyNodeRepository.findOne({
                where: { id: nodeId, gameSession: { id: sessionId } },
                relations: ['choices'],
            });
            if (!targetNode) {
                throw new common_1.NotFoundException('Story node not found');
            }
            gameSession.currentStoryNode = targetNode;
            await this.gameSessionRepository.save(gameSession);
            const nodeStepOrder = await this.storyPathRepository.findOne({
                where: {
                    nodeId: nodeId,
                    gameSession: { id: sessionId },
                    isActive: true,
                },
            });
            if (nodeStepOrder) {
                const pathsToDeactivate = await this.storyPathRepository.find({
                    where: {
                        gameSession: { id: sessionId },
                        stepOrder: { $gt: nodeStepOrder.stepOrder },
                        isActive: true,
                    },
                });
                const branchId = `branch-${Date.now()}`;
                for (const path of pathsToDeactivate) {
                    path.isActive = false;
                    path.branchId = branchId;
                    await this.storyPathRepository.save(path);
                }
            }
            return this.getGameSessionWithDetails(gameSession.id);
        }
        catch (error) {
            this.logger.error(`Error going back to node: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to go back to node');
        }
    }
    async getStoryTree(sessionId) {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: sessionId },
                relations: ['storyNodes', 'storyNodes.choices', 'storyPaths'],
            });
            if (!gameSession) {
                throw new common_1.NotFoundException('Game session not found');
            }
            const nodeMap = new Map();
            const rootNodes = [];
            for (const node of gameSession.storyNodes) {
                nodeMap.set(node.id, {
                    ...node,
                    children: [],
                    isOnCurrentPath: false,
                });
            }
            for (const node of gameSession.storyNodes) {
                const nodeData = nodeMap.get(node.id);
                if (node.parentNodeId) {
                    const parent = nodeMap.get(node.parentNodeId);
                    if (parent && nodeData) {
                        parent.children.push(nodeData);
                    }
                }
                else if (nodeData) {
                    rootNodes.push(nodeData);
                }
            }
            const currentPath = gameSession.storyPaths
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((path) => path.nodeId);
            for (const nodeId of currentPath) {
                const node = nodeMap.get(nodeId);
                if (node) {
                    node.isOnCurrentPath = true;
                }
            }
            return {
                tree: rootNodes,
                currentPath: currentPath,
                currentNodeId: gameSession.currentStoryNode?.id,
            };
        }
        catch (error) {
            this.logger.error(`Error getting story tree: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to get story tree');
        }
    }
    async endGameSession(sessionId) {
        const gameSession = await this.getGameSessionWithDetails(sessionId);
        gameSession.isActive = false;
        gameSession.endedAt = new Date();
        return this.gameSessionRepository.save(gameSession);
    }
    async deleteGameSession(sessionId, userId) {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: sessionId, character: { user: { id: userId } } },
                relations: ['character', 'character.user', 'storyNodes', 'storyPaths'],
            });
            if (!gameSession) {
                throw new common_1.NotFoundException('Game session not found or you do not have permission to delete it');
            }
            if (gameSession.storyPaths && gameSession.storyPaths.length > 0) {
                await this.storyPathRepository.remove(gameSession.storyPaths);
            }
            if (gameSession.storyNodes && gameSession.storyNodes.length > 0) {
                for (const node of gameSession.storyNodes) {
                    const choices = await this.choiceRepository.find({
                        where: { storyNode: { id: node.id } },
                    });
                    if (choices.length > 0) {
                        await this.choiceRepository.remove(choices);
                    }
                }
                await this.storyNodeRepository.remove(gameSession.storyNodes);
            }
            await this.gameSessionRepository.remove(gameSession);
            return {
                success: true,
                message: 'Game session and all related data have been deleted successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error deleting game session: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to delete game session: ${error.message}`);
        }
    }
    async deleteCharacter(characterId, userId) {
        try {
            const character = await this.characterRepository.findOne({
                where: { id: characterId, user: { id: userId } },
                relations: ['gameSessions'],
            });
            if (!character) {
                throw new common_1.NotFoundException('Character not found or you do not have permission to delete it');
            }
            if (character.gameSessions && character.gameSessions.length > 0) {
                for (const session of character.gameSessions) {
                    await this.deleteGameSession(session.id, userId);
                }
            }
            await this.characterRepository.remove(character);
            return {
                success: true,
                message: 'Character and all related game sessions have been deleted successfully',
            };
        }
        catch (error) {
            this.logger.error(`Error deleting character: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to delete character: ${error.message}`);
        }
    }
    async getGameSessionHistory(sessionId) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: sessionId },
            relations: [
                'storyNodes',
                'storyNodes.choices',
                'storyNodes.parentNode',
                'storyPaths',
            ],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${sessionId} not found`);
        }
        const activePaths = gameSession.storyPaths
            .filter((path) => path.isActive)
            .sort((a, b) => a.stepOrder - b.stepOrder);
        const activeNodeIds = new Set(activePaths.map((path) => path.nodeId));
        const choiceInfoMap = new Map();
        activePaths.forEach((path) => {
            choiceInfoMap.set(path.nodeId, {
                choiceId: path.choiceId,
                choiceText: path.choiceText,
            });
        });
        const nodes = gameSession.storyNodes;
        const nodeMap = new Map();
        nodes.forEach((node) => {
            nodeMap.set(node.id, node);
        });
        for (const node of nodes) {
            if (node.parentNodeId) {
                const parentNode = nodeMap.get(node.parentNodeId);
                if (parentNode && node.choiceIdFromParent) {
                    const selectedChoice = parentNode.choices?.find((c) => c.id === node.choiceIdFromParent);
                    if (selectedChoice) {
                        parentNode.selectedChoiceId = node.choiceIdFromParent;
                        parentNode.selectedChoiceText = selectedChoice.text;
                    }
                }
            }
            const choiceInfo = choiceInfoMap.get(node.id);
            if (choiceInfo) {
                node.selectedChoiceId = choiceInfo.choiceId;
                node.selectedChoiceText = choiceInfo.choiceText;
            }
        }
        const rootNodes = nodes.filter((node) => !node.parentNodeId);
        const orderedNodes = [];
        if (rootNodes.length > 0) {
            const traverseTree = (node) => {
                orderedNodes.push(node);
                const childNodes = nodes.filter((n) => n.parentNodeId === node.id);
                childNodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                for (const child of childNodes) {
                    if (activeNodeIds.has(child.id) ||
                        child.id === gameSession.currentStoryNode?.id) {
                        traverseTree(child);
                    }
                }
            };
            rootNodes.forEach((rootNode) => traverseTree(rootNode));
        }
        else {
            orderedNodes.push(...nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
        }
        return orderedNodes;
    }
    async getActualPathHistory(sessionId) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: sessionId },
            relations: ['storyPaths', 'storyNodes', 'storyNodes.choices'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${sessionId} not found`);
        }
        const orderedPaths = gameSession.storyPaths
            .filter((path) => path.isActive)
            .sort((a, b) => a.stepOrder - b.stepOrder);
        const currentPath = orderedPaths.map((path) => path.nodeId);
        const pathNodes = [];
        for (const path of orderedPaths) {
            const node = gameSession.storyNodes.find((n) => n.id === path.nodeId);
            if (node) {
                node.selectedChoiceId = path.choiceId;
                node.selectedChoiceText = path.choiceText;
                pathNodes.push(node);
            }
        }
        if (gameSession.currentStoryNode &&
            !pathNodes.find((n) => n.id === gameSession.currentStoryNode.id)) {
            pathNodes.push(gameSession.currentStoryNode);
            currentPath.push(gameSession.currentStoryNode.id);
        }
        return {
            pathNodes,
            allNodes: gameSession.storyNodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
            currentPath,
        };
    }
    async getAllBranches(sessionId) {
        const gameSession = await this.gameSessionRepository.findOne({
            where: { id: sessionId },
            relations: ['storyPaths', 'storyNodes'],
        });
        if (!gameSession) {
            throw new common_1.NotFoundException(`Game session with ID ${sessionId} not found`);
        }
        const branchGroups = gameSession.storyPaths.reduce((groups, path) => {
            const branchId = path.branchId || 'main';
            if (!groups[branchId]) {
                groups[branchId] = [];
            }
            groups[branchId].push(path);
            return groups;
        }, {});
        const activeBranch = gameSession.storyPaths
            .filter((path) => path.isActive)
            .sort((a, b) => a.stepOrder - b.stepOrder);
        const inactiveBranches = Object.entries(branchGroups)
            .filter(([branchId]) => branchId !== 'main' && !branchId.includes('main-branch'))
            .map(([branchId, paths]) => ({
            branchId,
            paths: paths.sort((a, b) => a.stepOrder - b.stepOrder),
            createdAt: Math.min(...paths.map((p) => new Date(p.createdAt).getTime())),
        }));
        const branchPoints = [];
        const nodeChoiceCounts = {};
        for (const path of gameSession.storyPaths) {
            if (!nodeChoiceCounts[path.nodeId]) {
                nodeChoiceCounts[path.nodeId] = [];
            }
            nodeChoiceCounts[path.nodeId].push(path);
        }
        for (const [nodeId, paths] of Object.entries(nodeChoiceCounts)) {
            if (paths.length > 1) {
                branchPoints.push({
                    nodeId,
                    paths: paths,
                    branchCount: paths.length,
                });
            }
        }
        return {
            activeBranch,
            inactiveBranches,
            branchPoints,
        };
    }
    async restoreBranch(sessionId, branchId) {
        try {
            const gameSession = await this.gameSessionRepository.findOne({
                where: { id: sessionId },
                relations: ['storyPaths', 'currentStoryNode'],
            });
            if (!gameSession) {
                throw new common_1.NotFoundException('Game session not found');
            }
            const currentActivePaths = await this.storyPathRepository.find({
                where: { gameSession: { id: sessionId }, isActive: true },
            });
            const newInactiveBranchId = `deactivated-${Date.now()}`;
            for (const path of currentActivePaths) {
                path.isActive = false;
                path.branchId = newInactiveBranchId;
                await this.storyPathRepository.save(path);
            }
            const branchPaths = await this.storyPathRepository.find({
                where: { gameSession: { id: sessionId }, branchId },
            });
            for (const path of branchPaths) {
                path.isActive = true;
                await this.storyPathRepository.save(path);
            }
            if (branchPaths.length > 0) {
                const lastPath = branchPaths.sort((a, b) => b.stepOrder - a.stepOrder)[0];
                const lastNode = await this.storyNodeRepository.findOne({
                    where: { id: lastPath.nodeId },
                    relations: ['choices'],
                });
                if (lastNode) {
                    gameSession.currentStoryNode = lastNode;
                    await this.gameSessionRepository.save(gameSession);
                }
            }
            return this.getGameSessionWithDetails(gameSession.id);
        }
        catch (error) {
            this.logger.error(`Error restoring branch: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to restore branch');
        }
    }
    async getGameSessionsByCharacterId(characterId) {
        return this.gameSessionRepository.find({
            where: { character: { id: characterId } },
            order: { startedAt: 'DESC' },
        });
    }
};
exports.GameService = GameService;
exports.GameService = GameService = GameService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(1, (0, typeorm_1.InjectRepository)(game_session_entity_1.GameSession)),
    __param(2, (0, typeorm_1.InjectRepository)(story_node_entity_1.StoryNode)),
    __param(3, (0, typeorm_1.InjectRepository)(choice_entity_1.Choice)),
    __param(4, (0, typeorm_1.InjectRepository)(story_path_entity_1.StoryPath)),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        gemini_ai_service_1.GeminiAiService,
        character_generator_service_1.CharacterGeneratorService])
], GameService);
//# sourceMappingURL=game.service.js.map