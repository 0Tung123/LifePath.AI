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
var GamesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const game_entity_1 = require("./entities/game.entity");
const gemini_service_1 = require("./gemini.service");
let GamesService = GamesService_1 = class GamesService {
    constructor(gamesRepository, geminiService) {
        this.gamesRepository = gamesRepository;
        this.geminiService = geminiService;
        this.logger = new common_1.Logger(GamesService_1.name);
    }
    async create(userId, createGameDto) {
        try {
            const { gameSettings } = createGameDto;
            const initialPrompt = this.buildInitialPrompt(gameSettings);
            this.logger.log('Generating initial game content with Gemini...');
            const aiResponse = await this.geminiService.generateGameContent(initialPrompt);
            this.logger.log(`AI Response length: ${aiResponse.length} characters`);
            const parsedContent = this.parseAiResponse(aiResponse);
            this.logger.log(`Parsed content - Choices found: ${parsedContent.choices.length}`);
            const statsWithHealth = {
                ...parsedContent.stats,
                ...(!parsedContent.stats.Health &&
                    !parsedContent.stats['Máu'] &&
                    !parsedContent.stats['Sinh Lực'] && {
                    'Sinh Lực': '100/100',
                }),
            };
            const newGame = this.gamesRepository.create();
            newGame.userId = userId;
            newGame.settings = gameSettings;
            newGame.storyHistory = [
                {
                    type: 'story',
                    content: parsedContent.storyText,
                    timestamp: new Date(),
                },
            ];
            newGame.characterStats = statsWithHealth;
            newGame.inventoryItems = parsedContent.inventory;
            newGame.characterSkills = parsedContent.skills;
            newGame.loreFragments = parsedContent.lore;
            newGame.currentPrompt = parsedContent.storyText;
            newGame.currentChoices = parsedContent.choices;
            newGame.chatHistoryForGemini = [];
            newGame.knowledgeBase = [];
            newGame.currentObjective = null;
            newGame.npcsMet = [];
            newGame.itemsUsed = [];
            newGame.importantEvents = [];
            newGame.achievements = [];
            newGame.karmaScore = parsedContent.karmaChange || 0;
            newGame.reputation = parsedContent.reputationChanges || {};
            newGame.active = true;
            newGame.deathDate = null;
            newGame.deathCause = null;
            this.logger.log(`Creating game with settings: ${JSON.stringify(gameSettings)}`);
            this.logger.log(`Character name: ${gameSettings.characterName}`);
            const savedGame = (await this.gamesRepository.save(newGame));
            this.logger.log(`Saved game settings: ${JSON.stringify(savedGame.settings)}`);
            this.logger.log(`Saved character name: ${savedGame.settings.characterName}`);
            return savedGame;
        }
        catch (error) {
            console.error('Error creating game:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create game');
        }
    }
    async findAllByUser(userId) {
        try {
            return this.gamesRepository.find({
                where: { userId },
                order: { updatedAt: 'DESC' },
            });
        }
        catch (error) {
            this.logger.error(`Error fetching games for user ${userId}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch games');
        }
    }
    async findOne(id, userId) {
        try {
            const game = await this.gamesRepository.findOne({
                where: { id, userId },
            });
            if (!game) {
                throw new common_1.BadRequestException(`Game with ID ${id} not found or you don't have access to it`);
            }
            this.logger.log(`Retrieved game settings: ${JSON.stringify(game.settings)}`);
            this.logger.log(`Retrieved character name: ${game.settings.characterName}`);
            return game;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Error fetching game ${id}:`, error);
            throw new common_1.InternalServerErrorException('Failed to fetch game');
        }
    }
    async remove(id, userId) {
        try {
            const game = await this.gamesRepository.findOne({
                where: { id, userId },
            });
            if (!game) {
                throw new common_1.BadRequestException(`Game with ID ${id} not found or you don't have access to it`);
            }
            await this.gamesRepository.delete({ id, userId });
            this.logger.log(`Game ${id} successfully deleted`);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Error deleting game ${id}:`, error);
            throw new common_1.InternalServerErrorException('Failed to delete game');
        }
    }
    async processAction(id, userId, choiceNumber, action, think, communication) {
        try {
            const game = await this.gamesRepository.findOne({
                where: { id, userId },
            });
            if (!game) {
                throw new common_1.BadRequestException(`Game with ID ${id} not found or you don't have access to it`);
            }
            if (!choiceNumber && !action && !think && !communication) {
                throw new common_1.BadRequestException('Must provide a choice number, action, thought, or communication');
            }
            if (choiceNumber) {
                const validChoice = game.currentChoices.find((choice) => choice.number === choiceNumber);
                if (!validChoice) {
                    throw new common_1.BadRequestException(`Invalid choice number: ${choiceNumber}`);
                }
                if (!game.active &&
                    (validChoice.text.includes('Hồi Quy') ||
                        validChoice.text.includes('hồi sinh'))) {
                    return await this.resurrectCharacter(id, userId);
                }
                else if (!game.active &&
                    (validChoice.text.includes('Chấp nhận cái chết') ||
                        validChoice.text.includes('kết thúc cuộc phiêu lưu'))) {
                    return game;
                }
            }
            const prompt = this.buildActionPrompt(game, choiceNumber, action, think, communication);
            const aiResponse = await this.geminiService.generateGameContent(prompt);
            const parsedContent = this.parseAiResponse(aiResponse);
            const now = new Date();
            if (choiceNumber) {
                const selectedChoice = game.currentChoices.find((c) => c.number === choiceNumber);
                if (selectedChoice) {
                    game.storyHistory.push({
                        type: 'user_choice',
                        content: selectedChoice.text,
                        timestamp: now,
                    });
                }
            }
            else if (action) {
                game.storyHistory.push({
                    type: 'user_custom_action',
                    content: action,
                    timestamp: now,
                });
            }
            else if (think) {
                game.storyHistory.push({
                    type: 'user_thinking',
                    content: think,
                    timestamp: now,
                });
            }
            else if (communication) {
                game.storyHistory.push({
                    type: 'user_communication',
                    content: communication,
                    timestamp: now,
                });
            }
            game.storyHistory.push({
                type: 'story',
                content: parsedContent.storyText,
                timestamp: new Date(),
            });
            game.currentPrompt = parsedContent.storyText;
            game.currentChoices = parsedContent.choices;
            game.characterStats = { ...game.characterStats, ...parsedContent.stats };
            const isDead = this.checkIfCharacterIsDead(game.characterStats);
            if (isDead && game.active) {
                const hasResurrectionItem = this.checkForResurrectionItems(game.inventoryItems, game.characterSkills);
                if (hasResurrectionItem) {
                    const resurrectionSkill = game.characterSkills.find((skill) => {
                        const skillName = skill.name.toLowerCase();
                        const skillDesc = skill.description?.toLowerCase() || '';
                        const resurrectionKeywords = [
                            'hồi quy',
                            'bản thể',
                            'trọng sinh',
                            'tái sinh',
                            'hồi sinh',
                            'phục sinh',
                            'luân hồi',
                            'bất tử',
                            'bất diệt',
                            'regression',
                            'rebirth',
                            'resurrection',
                        ];
                        return (resurrectionKeywords.some((keyword) => skillName.includes(keyword) || skillDesc.includes(keyword)) ||
                            skillDesc.includes('quay trở về') ||
                            skillDesc.includes('sau khi chết'));
                    });
                    let resurrectionChoiceText = 'Kích hoạt khả năng đặc biệt để tránh cái chết';
                    if (resurrectionSkill) {
                        const skillName = resurrectionSkill.name.toLowerCase();
                        if (skillName.includes('hồi quy') ||
                            skillName.includes('bản thể')) {
                            resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - quay về thời điểm trước khi chết`;
                        }
                        else if (skillName.includes('trọng sinh') ||
                            skillName.includes('tái sinh')) {
                            resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - tái sinh với ký ức`;
                        }
                        else if (skillName.includes('phục sinh') ||
                            skillName.includes('hồi sinh')) {
                            resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - hồi sinh từ cõi chết`;
                        }
                        else if (skillName.includes('bất tử') ||
                            skillName.includes('bất diệt')) {
                            resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - sử dụng sức mạnh bất tử`;
                        }
                        else {
                            resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - tránh cái chết`;
                        }
                    }
                    game.currentChoices = [
                        {
                            text: resurrectionChoiceText + ' (có hình phạt)',
                            number: 1,
                        },
                        {
                            text: 'Chấp nhận cái chết và kết thúc cuộc phiêu lưu',
                            number: 2,
                        },
                    ];
                    game.currentPrompt = `${parsedContent.storyText}\n\n**⚠️ NHÂN VẬT ĐÃ CHẾT! ⚠️**\n\nTuy nhiên, bạn có khả năng đặc biệt có thể thay đổi số phận này. Hãy lựa chọn:`;
                }
                else {
                    game.active = false;
                    game.deathDate = new Date();
                    game.deathCause = this.extractDeathCause(parsedContent.storyText);
                    game.currentChoices = [];
                    game.currentPrompt = `${parsedContent.storyText}\n\n**GAME OVER: Nhân vật của bạn đã chết!**`;
                }
            }
            parsedContent.inventory.forEach((newItem) => {
                const existingItem = game.inventoryItems.find((item) => item.name === newItem.name);
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                    if (newItem.description &&
                        newItem.description !== existingItem.description) {
                        existingItem.description = newItem.description;
                    }
                }
                else {
                    game.inventoryItems.push(newItem);
                }
            });
            parsedContent.skills.forEach((newSkill) => {
                const existingSkill = game.characterSkills.find((skill) => skill.name === newSkill.name);
                if (existingSkill) {
                    if (newSkill.level)
                        existingSkill.level = newSkill.level;
                    if (newSkill.mastery)
                        existingSkill.mastery = newSkill.mastery;
                    if (newSkill.description)
                        existingSkill.description = newSkill.description;
                }
                else {
                    game.characterSkills.push(newSkill);
                }
            });
            game.loreFragments = [...game.loreFragments, ...parsedContent.lore];
            if (parsedContent.karmaChange && parsedContent.karmaChange !== 0) {
                game.karmaScore = (game.karmaScore || 0) + parsedContent.karmaChange;
                this.logger.log(`Karma changed by ${parsedContent.karmaChange} (${parsedContent.karmaReason}). New score: ${game.karmaScore}`);
            }
            if (parsedContent.reputationChanges &&
                Object.keys(parsedContent.reputationChanges).length > 0) {
                if (!game.reputation) {
                    game.reputation = {};
                }
                Object.entries(parsedContent.reputationChanges).forEach(([group, change]) => {
                    game.reputation[group] = (game.reputation[group] || 0) + change;
                    this.logger.log(`Reputation with ${group} changed by ${change}. New score: ${game.reputation[group]}`);
                });
            }
            const updatedGame = await this.gamesRepository.save(game);
            this.logger.log(`Game ${id} action processed successfully`);
            return updatedGame;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Error processing action for game ${id}:`, error);
            throw new common_1.InternalServerErrorException('Failed to process game action');
        }
    }
    buildActionPrompt(game, choiceNumber, action, think, communication) {
        try {
            const { buildEnhancedActionPrompt } = require('./prompts/enhanced-world-building.prompt');
            return buildEnhancedActionPrompt(game, choiceNumber, action, think, communication);
        }
        catch (error) {
            this.logger.error('Error building action prompt:', error);
            throw new common_1.BadRequestException('Failed to build action prompt');
        }
    }
    buildInitialPrompt(gameSettings) {
        try {
            const { buildEnhancedWorldPrompt } = require('./prompts/enhanced-world-building.prompt');
            return buildEnhancedWorldPrompt(gameSettings);
        }
        catch (error) {
            console.error('Error building initial prompt:', error);
            throw new common_1.InternalServerErrorException('Failed to build game prompt');
        }
    }
    parseAiResponse(response) {
        try {
            if (!response) {
                throw new Error('AI response is empty or undefined');
            }
            this.logger.log('=== AI Response Debug ===');
            this.logger.log(`Response length: ${response.length}`);
            this.logger.log(`Response preview: ${response.substring(0, 500)}...`);
            const hasStatsTag = response.includes('[STATS:');
            const hasInventoryTag = response.includes('[INVENTORY_ADD:') ||
                response.includes('[INVENTORY_INIT:');
            const hasSkillTag = response.includes('[SKILL:') || response.includes('[SKILLS:');
            this.logger.log(`Tags found - STATS: ${hasStatsTag}, INVENTORY: ${hasInventoryTag}, SKILL: ${hasSkillTag}`);
            let storyText = response;
            const firstTagMatch = response.match(/\[(STATS|INVENTORY_ADD|INVENTORY_REMOVE|SKILL|LORE_NPC|LORE_ITEM|LORE_LOCATION|KARMA_SCORE|REPUTATION):/);
            if (firstTagMatch && firstTagMatch.index !== undefined) {
                storyText = response.substring(0, firstTagMatch.index).trim();
            }
            const statsMatches = [...response.matchAll(/\[STATS:\s*(.*?)\]/g)];
            const stats = {};
            if (statsMatches.length > 0) {
                const statsString = statsMatches[0][1];
                const keyValuePairs = statsString.split(',').map((pair) => pair.trim());
                keyValuePairs.forEach((pair) => {
                    if (!pair.includes('=')) {
                        console.warn(`Invalid stats pair format: ${pair}`);
                        return;
                    }
                    const [key, ...valueParts] = pair
                        .split('=')
                        .map((item) => item.trim());
                    const value = valueParts.join('=');
                    if (!key || value === undefined) {
                        console.warn(`Invalid key-value pair: ${pair}`);
                        return;
                    }
                    const cleanValue = value &&
                        typeof value === 'string' &&
                        value.startsWith('"') &&
                        value.endsWith('"')
                        ? value.substring(1, value.length - 1)
                        : value;
                    stats[key] = cleanValue;
                });
            }
            const inventoryAddMatches = [
                ...response.matchAll(/\[INVENTORY_ADD:\s*(.*?)\]/g),
            ];
            const inventory = [];
            this.logger.log(`Found ${inventoryAddMatches.length} INVENTORY_ADD matches`);
            inventoryAddMatches.forEach((match) => {
                const itemString = match[1];
                const itemProps = {
                    name: '',
                    quantity: 1,
                };
                const nameMatch = itemString.match(/Name="([^"]+)"/);
                const descMatch = itemString.match(/Description="([^"]+)"/);
                const quantityMatch = itemString.match(/Quantity=(\d+)/);
                if (nameMatch)
                    itemProps.name = nameMatch[1];
                if (descMatch)
                    itemProps.description = descMatch[1];
                if (quantityMatch)
                    itemProps.quantity = parseInt(quantityMatch[1]);
                else
                    itemProps.quantity = 1;
                inventory.push(itemProps);
            });
            if (inventory.length === 0) {
                const inventoryInitMatch = response.match(/\[INVENTORY_INIT:\s*({[\s\S]*?})\]/);
                if (inventoryInitMatch) {
                    try {
                        const initInventory = JSON.parse(inventoryInitMatch[1]);
                        if (initInventory.items && Array.isArray(initInventory.items)) {
                            inventory.push(...initInventory.items);
                        }
                    }
                    catch (e) {
                        console.error('Error parsing INVENTORY_INIT:', e);
                    }
                }
            }
            const skillMatches = [...response.matchAll(/\[SKILL:\s*(.*?)\]/g)];
            const skills = [];
            this.logger.log(`Found ${skillMatches.length} SKILL matches`);
            skillMatches.forEach((match) => {
                const skillString = match[1];
                const skillProps = { name: '' };
                const nameMatch = skillString.match(/Name="([^"]+)"/);
                const descMatch = skillString.match(/Description="([^"]+)"/);
                const levelMatch = skillString.match(/Level=(\d+)/);
                const thanhThucMatch = skillString.match(/ThanhThuc="([^"]+)"/);
                if (nameMatch)
                    skillProps.name = nameMatch[1];
                if (descMatch)
                    skillProps.description = descMatch[1];
                if (levelMatch)
                    skillProps.level = parseInt(levelMatch[1]);
                if (thanhThucMatch)
                    skillProps.mastery = thanhThucMatch[1];
                skills.push(skillProps);
            });
            if (skills.length === 0) {
                const skillsMatch = response.match(/\[SKILLS:\s*({[\s\S]*?})\]/);
                if (skillsMatch) {
                    try {
                        const parsedSkills = JSON.parse(skillsMatch[1]);
                        if (parsedSkills.abilities &&
                            Array.isArray(parsedSkills.abilities)) {
                            skills.push(...parsedSkills.abilities);
                        }
                    }
                    catch (e) {
                        console.error('Error parsing SKILLS:', e);
                    }
                }
            }
            let karmaChange = 0;
            let karmaReason = '';
            const karmaMatches = [
                ...response.matchAll(/\[KARMA_SCORE:\s*([+-]?\d+)(?:,\s*"([^"]+)")?\]/g),
            ];
            if (karmaMatches.length > 0) {
                karmaChange = parseInt(karmaMatches[0][1]) || 0;
                karmaReason = karmaMatches[0][2] || '';
            }
            const reputationChanges = {};
            const reputationMatches = [
                ...response.matchAll(/\[REPUTATION:\s*([^\]]+)\]/g),
            ];
            if (reputationMatches.length > 0) {
                const reputationString = reputationMatches[0][1];
                const repPairs = reputationString.split(',').map((pair) => pair.trim());
                repPairs.forEach((pair) => {
                    const [key, value] = pair.split('=').map((item) => item.trim());
                    if (key && value) {
                        const numValue = parseInt(value.replace(/[+-]/, '')) *
                            (value.startsWith('-') ? -1 : 1);
                        reputationChanges[key] = numValue;
                    }
                });
            }
            const loreNpcMatches = [...response.matchAll(/\[LORE_NPC:\s*(.*?)\]/g)];
            const loreItemMatches = [...response.matchAll(/\[LORE_ITEM:\s*(.*?)\]/g)];
            const loreLocationMatches = [
                ...response.matchAll(/\[LORE_LOCATION:\s*(.*?)\]/g),
            ];
            const lore = [];
            const processLoreMatch = (match, type) => {
                const loreString = match[1];
                const loreProps = { type };
                const nameMatch = loreString.match(/Name="([^"]+)"/);
                const descMatch = loreString.match(/Description="([^"]+)"/);
                const titleMatch = loreString.match(/Title="([^"]+)"/);
                const contentMatch = loreString.match(/Content="([^"]+)"/);
                if (nameMatch)
                    loreProps.name = nameMatch[1];
                if (titleMatch)
                    loreProps.title = titleMatch[1];
                if (descMatch)
                    loreProps.description = descMatch[1];
                if (contentMatch)
                    loreProps.content = contentMatch[1];
                if (!loreProps.title && loreProps.name) {
                    loreProps.title = loreProps.name;
                }
                if (!loreProps.content && loreProps.description) {
                    loreProps.content = loreProps.description;
                }
                lore.push(loreProps);
            };
            loreNpcMatches.forEach((match) => processLoreMatch(match, 'npc'));
            loreItemMatches.forEach((match) => processLoreMatch(match, 'item'));
            loreLocationMatches.forEach((match) => processLoreMatch(match, 'location'));
            if (lore.length === 0) {
                const loreMatch = response.match(/\[LORE:\s*({[\s\S]*?})\]/);
                if (loreMatch) {
                    try {
                        const parsedLore = JSON.parse(loreMatch[1]);
                        if (parsedLore.fragments && Array.isArray(parsedLore.fragments)) {
                            lore.push(...parsedLore.fragments.map((fragment) => ({
                                ...fragment,
                                type: 'general',
                            })));
                        }
                    }
                    catch (e) {
                        console.error('Error parsing LORE:', e);
                    }
                }
            }
            let choices = [];
            const lines = response.split('\n');
            const choiceLines = [];
            let foundChoicesSection = false;
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                if (/^\d+\.\s+/.test(line)) {
                    choiceLines.unshift(line);
                    foundChoicesSection = true;
                }
                else if (foundChoicesSection && line === '') {
                    continue;
                }
                else if (foundChoicesSection) {
                    break;
                }
            }
            if (choiceLines.length >= 2) {
                choices = choiceLines.map((line, index) => {
                    const choiceText = line.replace(/^\d+\.\s*/, '').trim();
                    const number = index + 1;
                    return {
                        text: choiceText,
                        number,
                    };
                });
                choiceLines.forEach((line) => {
                    storyText = storyText.replace(line, '');
                });
                storyText = storyText.trim();
            }
            else {
                const storyChoiceLines = storyText
                    .split('\n')
                    .filter((line) => /^\d+\./.test(line.trim()));
                if (storyChoiceLines.length >= 2) {
                    choices = storyChoiceLines.map((line, index) => {
                        const choiceText = line.replace(/^\d+\.\s*/, '').trim();
                        const number = index + 1;
                        return {
                            text: choiceText,
                            number,
                        };
                    });
                    storyChoiceLines.forEach((line) => {
                        storyText = storyText.replace(line, '');
                    });
                    storyText = storyText.trim();
                }
                else {
                    const choicesMatch = response.match(/\[CHOICES:\s*({[\s\S]*?})\]/);
                    if (choicesMatch) {
                        try {
                            const parsedChoices = JSON.parse(choicesMatch[1]);
                            if (parsedChoices.options &&
                                Array.isArray(parsedChoices.options)) {
                                choices = parsedChoices.options.map((option, index) => ({
                                    text: option.text || option,
                                    number: option.number || index + 1,
                                }));
                            }
                        }
                        catch (e) {
                            this.logger.error('Error parsing CHOICES tag:', e);
                        }
                    }
                }
            }
            if (choices.length === 0) {
                this.logger.warn('No choices found in AI response, adding default choices');
                choices = [
                    { text: 'Tiếp tục quan sát tình hình', number: 1 },
                    { text: 'Hành động ngay lập tức', number: 2 },
                    { text: 'Tìm cách khác để giải quyết', number: 3 },
                ];
            }
            return {
                storyText,
                stats,
                inventory,
                skills,
                lore,
                choices,
                karmaChange,
                karmaReason,
                reputationChanges,
            };
        }
        catch (error) {
            const logger = new common_1.Logger('GamesService');
            logger.error('Error parsing AI response:', error);
            throw new common_1.BadRequestException('Failed to parse AI response: ' + error.message);
        }
    }
    checkIfCharacterIsDead(stats) {
        const healthKeys = ['Health', 'Máu', 'Sinh Lực', 'HP', 'Sức Khỏe'];
        for (const key of healthKeys) {
            if (stats[key]) {
                const healthValue = String(stats[key]);
                if (healthValue.includes('/')) {
                    const currentHealth = parseInt(healthValue.split('/')[0]);
                    return currentHealth <= 0;
                }
                else {
                    const currentHealth = parseInt(healthValue);
                    return currentHealth <= 0;
                }
            }
        }
        return false;
    }
    checkForResurrectionItems(inventory, skills) {
        const resurrectionItemNames = [
            'luân hồi',
            'trọng sinh',
            'hồi sinh',
            'phục sinh',
            'tái sinh',
            'bất tử',
            'bất diệt',
            'hồi nguyên đan',
            'tái sinh đan',
            'resurrection',
            'revive',
            'rebirth',
            'reincarnation',
        ];
        const hasResurrectionItem = inventory.some((item) => resurrectionItemNames.some((name) => item.name.toLowerCase().includes(name.toLowerCase())) && item.quantity > 0);
        const hasResurrectionSkill = skills.some((skill) => {
            const skillName = skill.name.toLowerCase();
            const skillDesc = skill.description?.toLowerCase() || '';
            const hasTraditionalResurrection = resurrectionItemNames.some((name) => skillName.includes(name.toLowerCase()) ||
                skillDesc.includes(name.toLowerCase()));
            const hasRegressionAbility = skillName.includes('hồi quy') ||
                skillName.includes('bản thể') ||
                skillName.includes('regression') ||
                skillName.includes('time travel') ||
                skillName.includes('quay về') ||
                skillName.includes('trở về') ||
                skillDesc.includes('quay trở về') ||
                skillDesc.includes('sau khi chết') ||
                skillDesc.includes('thời điểm trong quá khứ') ||
                skillDesc.includes('số lần sử dụng');
            return hasTraditionalResurrection || hasRegressionAbility;
        });
        this.logger.log(`Checking resurrection abilities - Items: ${hasResurrectionItem}, Skills: ${hasResurrectionSkill}`);
        if (hasResurrectionSkill) {
            const resurrectionSkills = skills.filter((skill) => {
                const skillName = skill.name.toLowerCase();
                const skillDesc = skill.description?.toLowerCase() || '';
                return (skillName.includes('hồi quy') ||
                    skillName.includes('bản thể') ||
                    skillDesc.includes('quay trở về') ||
                    skillDesc.includes('sau khi chết'));
            });
            this.logger.log(`Found resurrection skills: ${resurrectionSkills.map((s) => s.name).join(', ')}`);
        }
        return hasResurrectionItem || hasResurrectionSkill;
    }
    extractDeathCause(storyText) {
        const sentences = storyText
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 0);
        return sentences[sentences.length - 1]?.trim() || 'Nguyên nhân không rõ';
    }
    handleResurrection(game) {
        const healthKeys = ['Health', 'Máu', 'Sinh Lực', 'HP', 'Sức Khỏe'];
        for (const key of healthKeys) {
            if (game.characterStats[key]) {
                const healthValue = String(game.characterStats[key]);
                if (healthValue.includes('/')) {
                    const maxHealth = parseInt(healthValue.split('/')[1]);
                    game.characterStats[key] =
                        `${Math.floor(maxHealth * 0.5)}/${maxHealth}`;
                }
                else {
                    game.characterStats[key] = '50';
                }
                break;
            }
        }
        Object.keys(game.characterStats).forEach((key) => {
            if (key !== 'Health' &&
                key !== 'Máu' &&
                key !== 'Sinh Lực' &&
                key !== 'HP' &&
                key !== 'Sức Khỏe') {
                const value = game.characterStats[key];
                if (typeof value === 'number') {
                    game.characterStats[key] = Math.floor(value * 0.9);
                }
                else if (typeof value === 'string' && !isNaN(Number(value))) {
                    game.characterStats[key] = Math.floor(Number(value) * 0.9);
                }
            }
        });
        const resurrectionItemNames = [
            'luân hồi',
            'trọng sinh',
            'hồi sinh',
            'phục sinh',
            'tái sinh',
            'bất tử',
            'bất diệt',
            'hồi nguyên đan',
            'tái sinh đan',
        ];
        game.inventoryItems.forEach((item) => {
            if (resurrectionItemNames.some((name) => item.name.toLowerCase().includes(name.toLowerCase())) &&
                item.quantity > 0) {
                item.quantity -= 1;
            }
        });
        game.inventoryItems = game.inventoryItems.filter((item) => item.quantity > 0);
    }
    async generateLifeSummary(gameId) {
        const game = await this.gamesRepository.findOne({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        const playTime = new Date().getTime() - new Date(game.createdAt).getTime();
        const playDays = Math.floor(playTime / (1000 * 60 * 60 * 24));
        const playHours = Math.floor((playTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const npcsMet = game.loreFragments
            .filter((lore) => lore.type === 'npc')
            .map((npc) => ({ name: npc.name, description: npc.description }));
        const importantEvents = game.storyHistory
            .filter((story) => story.type === 'story')
            .slice(0, 10)
            .map((event) => ({
            description: event.content.substring(0, 100) + '...',
            timestamp: event.timestamp,
        }));
        return {
            characterName: game.settings.characterName,
            theme: game.settings.theme,
            setting: game.settings.setting,
            birthDate: game.createdAt,
            deathDate: game.deathDate || new Date(),
            deathCause: game.deathCause || 'Không rõ nguyên nhân',
            playTime: `${playDays} ngày ${playHours} giờ`,
            finalStats: game.characterStats,
            inventory: game.inventoryItems,
            skills: game.characterSkills,
            npcsMet: npcsMet,
            importantEvents: importantEvents,
            totalChapters: game.storyHistory.length,
            achievements: game.achievements || [],
        };
    }
    async resurrectCharacter(gameId, userId) {
        const game = await this.gamesRepository.findOne({
            where: { id: gameId, userId },
        });
        if (!game) {
            throw new common_1.NotFoundException('Game not found');
        }
        if (game.active) {
            throw new common_1.BadRequestException('Character is not dead');
        }
        const hasResurrectionItem = this.checkForResurrectionItems(game.inventoryItems, game.characterSkills);
        if (!hasResurrectionItem) {
            throw new common_1.BadRequestException('No resurrection items or skills available');
        }
        const resurrectionSkill = game.characterSkills.find((skill) => {
            const skillName = skill.name.toLowerCase();
            const skillDesc = skill.description?.toLowerCase() || '';
            const resurrectionKeywords = [
                'hồi quy',
                'bản thể',
                'trọng sinh',
                'tái sinh',
                'hồi sinh',
                'phục sinh',
                'luân hồi',
                'bất tử',
                'bất diệt',
                'regression',
                'rebirth',
                'resurrection',
                'reincarnation',
                'immortal',
                'revive',
                'phoenix',
            ];
            const hasResurrectionKeyword = resurrectionKeywords.some((keyword) => skillName.includes(keyword) || skillDesc.includes(keyword));
            const hasResurrectionDescription = skillDesc.includes('quay trở về') ||
                skillDesc.includes('sau khi chết') ||
                skillDesc.includes('thời điểm trong quá khứ') ||
                skillDesc.includes('số lần sử dụng') ||
                skillDesc.includes('khi nhân vật chết') ||
                skillDesc.includes('tránh cái chết') ||
                skillDesc.includes('hồi phục sau khi chết');
            return hasResurrectionKeyword || hasResurrectionDescription;
        });
        let resurrectionMessage = '';
        let skillType = 'hồi sinh';
        if (resurrectionSkill) {
            const skillName = resurrectionSkill.name.toLowerCase();
            if (skillName.includes('hồi quy') || skillName.includes('bản thể')) {
                skillType = 'hồi quy';
                resurrectionMessage =
                    '🔄 **HỒI QUY THÀNH CÔNG!**\n\nBạn đã quay trở về thời điểm trước khi chết. Ký ức về cái chết vẫn còn rõ nét trong tâm trí, nhắc nhở bạn về những hậu quả của quyết định sai lầm.';
            }
            else if (skillName.includes('trọng sinh') ||
                skillName.includes('tái sinh')) {
                skillType = 'trọng sinh';
                resurrectionMessage =
                    '✨ **TRỌNG SINH THÀNH CÔNG!**\n\nBạn đã được tái sinh với ký ức về cuộc đời trước. Kinh nghiệm đau đớn từ cái chết trước đây sẽ giúp bạn đưa ra những quyết định khôn ngoan hơn.';
            }
            else if (skillName.includes('phục sinh') ||
                skillName.includes('hồi sinh')) {
                skillType = 'phục sinh';
                resurrectionMessage =
                    '⚡ **PHỤC SINH THÀNH CÔNG!**\n\nBạn đã được hồi sinh từ cõi chết. Mặc dù còn yếu ớt, nhưng bạn đã có cơ hội thứ hai để tiếp tục cuộc phiêu lưu.';
            }
            else if (skillName.includes('bất tử') ||
                skillName.includes('bất diệt')) {
                skillType = 'bất tử';
                resurrectionMessage =
                    '🛡️ **SỨC MẠNH BẤT TỬ KÍCH HOẠT!**\n\nKhả năng bất tử của bạn đã cứu bạn khỏi cái chết. Tuy nhiên, sức mạnh này đã bị suy yếu đáng kể sau lần sử dụng này.';
            }
            else {
                resurrectionMessage =
                    '💫 **HỒI SINH THÀNH CÔNG!**\n\nBạn đã được cứu sống bởi một sức mạnh bí ẩn. Cơ hội thứ hai này không nên bị lãng phí.';
            }
            if (resurrectionSkill.description) {
                const usageMatch = resurrectionSkill.description.match(/Số lần sử dụng:\s*(\d+)/);
                if (usageMatch) {
                    const currentUses = parseInt(usageMatch[1]);
                    if (currentUses > 1) {
                        resurrectionSkill.description =
                            resurrectionSkill.description.replace(/Số lần sử dụng:\s*\d+/, `Số lần sử dụng: ${currentUses - 1}`);
                    }
                    else {
                        resurrectionSkill.description =
                            resurrectionSkill.description.replace(/Số lần sử dụng:\s*\d+/, 'Số lần sử dụng: 0 (Đã cạn kiệt)');
                        const skillIndex = game.characterSkills.findIndex((s) => s.name === resurrectionSkill.name);
                        if (skillIndex !== -1) {
                            game.characterSkills.splice(skillIndex, 1);
                        }
                    }
                }
                else {
                    const skillIndex = game.characterSkills.findIndex((s) => s.name === resurrectionSkill.name);
                    if (skillIndex !== -1) {
                        game.characterSkills.splice(skillIndex, 1);
                    }
                }
            }
            this.logger.log(`Used resurrection skill: ${resurrectionSkill.name} (Type: ${skillType})`);
        }
        this.handleResurrection(game);
        game.active = true;
        game.deathDate = null;
        game.deathCause = null;
        const storyContent = resurrectionMessage +
            (resurrectionSkill
                ? ` Khả năng "${resurrectionSkill.name}" đã được sử dụng.`
                : '') +
            ' Hãy cẩn thận hơn trong những quyết định tiếp theo...';
        game.storyHistory.push({
            type: 'system',
            content: storyContent,
            timestamp: new Date(),
        });
        game.currentChoices = [
            { text: '[AN TOÀN] Quan sát kỹ lưỡng tình hình xung quanh', number: 1 },
            {
                text: '[THẬN TRỌNG] Tiến hành thận trọng với kế hoạch rõ ràng',
                number: 2,
            },
            { text: '[NGUY HIỂM] Hành động quyết đoán như trước đây', number: 3 },
        ];
        const weaknessNote = '\n\nBạn cảm thấy yếu ớt hơn so với trước đây do hình phạt từ việc sử dụng khả năng đặc biệt. Lần này, bạn sẽ làm gì?';
        game.currentPrompt = resurrectionMessage + weaknessNote;
        return await this.gamesRepository.save(game);
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = GamesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(game_entity_1.Game)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        gemini_service_1.GeminiService])
], GamesService);
//# sourceMappingURL=games.service.js.map