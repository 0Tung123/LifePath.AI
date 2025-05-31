import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Character,
  GameGenre,
  CharacterAttributes,
} from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { GeminiAiService } from './gemini-ai.service';
import { CharacterGeneratorService } from './character-generator.service';
import { User } from '../user/entities/user.entity';

// Định nghĩa các interface
interface ItemGain {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  type?: string;
  rarity?: string;
  value?: number;
}

interface ItemLoss {
  id?: string;
  name: string;
  quantity: number;
}

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(StoryNode)
    private storyNodeRepository: Repository<StoryNode>,
    @InjectRepository(Choice)
    private choiceRepository: Repository<Choice>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geminiAiService: GeminiAiService,
    private characterGeneratorService: CharacterGeneratorService,
  ) {}

  async createCharacter(
    userId: string,
    characterData: Partial<Character>,
  ): Promise<Character> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Set default attributes based on genre if not provided
      if (!characterData.attributes) {
        const defaultAttributes: CharacterAttributes =
          this.getDefaultAttributes(
            characterData.primaryGenre || GameGenre.FANTASY,
            characterData.secondaryGenres,
          );
        characterData.attributes = defaultAttributes;
      }

      // Set default inventory if not provided
      if (!characterData.inventory) {
        characterData.inventory = this.getDefaultInventory(
          characterData.primaryGenre || GameGenre.FANTASY,
          characterData.secondaryGenres,
        );
      }

      // Set default skills if not provided
      if (!characterData.skills || characterData.skills.length === 0) {
        characterData.skills = ['Basic Attack', 'Defend'];
      }

      const character = this.characterRepository.create({
        ...characterData,
        user,
      });

      return this.characterRepository.save(character);
    } catch (error) {
      this.logger.error(
        `Error creating character: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create character: ${error.message}`,
      );
    }
  }

  async generateCharacterFromDescription(
    userId: string,
    description: string,
    primaryGenre?: GameGenre,
    secondaryGenres?: GameGenre[],
    customGenreDescription?: string,
  ): Promise<Character> {
    try {
      // Use AI to generate character based on description
      const generatedCharacter =
        await this.characterGeneratorService.generateCharacterFromDescription(
          description,
          primaryGenre,
        );

      // Add secondary genres and custom description if provided
      if (secondaryGenres && secondaryGenres.length > 0) {
        generatedCharacter.secondaryGenres = secondaryGenres;
      }

      if (customGenreDescription) {
        generatedCharacter.customGenreDescription = customGenreDescription;
      }

      // Create and save the character
      return this.createCharacter(userId, generatedCharacter);
    } catch (error) {
      this.logger.error(
        `Error generating character from description: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to generate character: ${error.message}`,
      );
    }
  }

  private getDefaultAttributes(
    primaryGenre: GameGenre,
    secondaryGenres?: GameGenre[],
  ): CharacterAttributes {
    // Bắt đầu với các thuộc tính cơ bản mà tất cả các nhân vật đều có
    const baseAttributes: CharacterAttributes = {
      strength: 10,
      intelligence: 10,
      dexterity: 10,
      charisma: 10,
      health: 100,
      mana: 100,
    };

    // Thêm thuộc tính dựa trên thể loại chính
    this.addGenreAttributes(baseAttributes, primaryGenre);

    // Thêm thuộc tính từ các thể loại phụ (nếu có)
    if (secondaryGenres && secondaryGenres.length > 0) {
      secondaryGenres.forEach((genre) => {
        this.addGenreAttributes(baseAttributes, genre, true);
      });
    }

    return baseAttributes;
  }

  private addGenreAttributes(
    attributes: CharacterAttributes,
    genre: GameGenre,
    isSecondary: boolean = false,
  ): void {
    // Hệ số giảm cho thể loại phụ
    const multiplier = isSecondary ? 0.7 : 1;

    switch (genre) {
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        attributes.qi = attributes.qi || Math.round(100 * multiplier);
        attributes.cultivation =
          attributes.cultivation || Math.round(1 * multiplier);
        attributes.perception =
          attributes.perception || Math.round(10 * multiplier);
        break;

      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        attributes.tech = attributes.tech || Math.round(10 * multiplier);
        attributes.hacking = attributes.hacking || Math.round(5 * multiplier);
        break;

      case GameGenre.HORROR:
        attributes.sanity = attributes.sanity || Math.round(100 * multiplier);
        attributes.willpower =
          attributes.willpower || Math.round(10 * multiplier);
        break;

      case GameGenre.MODERN:
        attributes.education =
          attributes.education || Math.round(10 * multiplier);
        attributes.wealth = attributes.wealth || Math.round(10 * multiplier);
        attributes.influence =
          attributes.influence || Math.round(5 * multiplier);
        break;
    }
  }

  private getDefaultInventory(
    primaryGenre: GameGenre,
    secondaryGenres?: GameGenre[],
  ): any {
    const defaultItems: {
      id: string;
      name: string;
      description: string;
      quantity: number;
      type?: string;
      effects?: Record<string, any>;
      value?: number;
      rarity?: string;
    }[] = [];
    let currency: Record<string, number> = {};

    // Thêm vật phẩm dựa trên thể loại chính
    this.addGenreItems(defaultItems, primaryGenre, false);

    // Thêm vật phẩm từ các thể loại phụ (nếu có)
    if (secondaryGenres && secondaryGenres.length > 0) {
      secondaryGenres.forEach((genre) => {
        this.addGenreItems(defaultItems, genre, true);
      });
    }

    // Xác định loại tiền tệ dựa trên thể loại chính
    currency = this.getGenreCurrency(primaryGenre);

    // Thêm tiền tệ từ các thể loại phụ (với số lượng ít hơn)
    if (secondaryGenres && secondaryGenres.length > 0) {
      secondaryGenres.forEach((genre) => {
        const secondaryCurrency = this.getGenreCurrency(genre, 0.5);
        // Kết hợp tiền tệ
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

  private addGenreItems(
    items: any[],
    genre: GameGenre,
    isSecondary: boolean = false,
  ): void {
    // Nếu là thể loại phụ, chỉ thêm 1 vật phẩm đặc trưng
    const itemsToAdd = isSecondary ? 1 : 2;
    let addedItems = 0;

    switch (genre) {
      case GameGenre.FANTASY:
        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'weapon', 'Rusty Sword')
        ) {
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

        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'consumable', 'Health Potion')
        ) {
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

      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'weapon', 'Training Sword')
        ) {
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

        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'consumable', 'Qi Cultivation Pill')
        ) {
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

      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'weapon', 'Basic Blaster')
        ) {
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

        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'consumable', 'MedKit')
        ) {
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

      case GameGenre.HORROR:
        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'tool', 'Flashlight')
        ) {
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

        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'consumable', 'Bandages')
        ) {
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

      case GameGenre.MODERN:
        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'tool', 'Smartphone')
        ) {
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

        if (
          addedItems < itemsToAdd &&
          !this.hasItemOfType(items, 'consumable', 'First Aid Kit')
        ) {
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

  private hasItemOfType(items: any[], type: string, name: string): boolean {
    return items.some((item) => item.type === type && item.name === name);
  }

  private getGenreCurrency(
    genre: GameGenre,
    multiplier: number = 1,
  ): Record<string, number> {
    switch (genre) {
      case GameGenre.FANTASY:
        return {
          gold: Math.round(50 * multiplier),
          silver: Math.round(100 * multiplier),
        };
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return {
          spirit_stones: Math.round(5 * multiplier),
          yuan: Math.round(1000 * multiplier),
        };
      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        return { credits: Math.round(1000 * multiplier) };
      case GameGenre.HORROR:
      case GameGenre.MODERN:
        return { dollars: Math.round(1000 * multiplier) };
      default:
        return { gold: Math.round(100 * multiplier) };
    }
  }

  async getCharactersByUserId(userId: string): Promise<Character[]> {
    return this.characterRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getCharacterById(id: string): Promise<Character> {
    const character = await this.characterRepository.findOne({
      where: { id },
      relations: ['user', 'gameSessions'],
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    return character;
  }

  async updateCharacter(
    id: string,
    updateData: Partial<Character>,
  ): Promise<Character> {
    const character = await this.getCharacterById(id);
    Object.assign(character, updateData);
    return this.characterRepository.save(character);
  }

  async deleteCharacter(id: string): Promise<void> {
    const character = await this.getCharacterById(id);
    await this.characterRepository.remove(character);
  }

  async startGameSession(
    characterId: string,
    initialPrompt?: string,
  ): Promise<GameSession> {
    try {
      const character = await this.getCharacterById(characterId);

      // Create initial game state
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

      // Create and save the game session
      const gameSession = this.gameSessionRepository.create({
        character,
        gameState,
        isActive: true,
      });

      const savedSession = await this.gameSessionRepository.save(gameSession);

      // Generate initial story content
      if (!initialPrompt) {
        initialPrompt = `You are ${character.name}, a ${
          character.characterClass
        } in a ${character.primaryGenre} world${
          character.customGenreDescription
            ? ' with ' + character.customGenreDescription
            : ''
        }. Your adventure begins...`;
      }

      const storyContent = await this.geminiAiService.generateStoryContent(
        initialPrompt,
        { character, gameState: gameSession.gameState },
      );

      const storyNode = this.storyNodeRepository.create({
        content: storyContent,
        location: 'Starting Village',
        gameSession: savedSession,
      });

      const savedStoryNode = await this.storyNodeRepository.save(storyNode);

      // Generate choices for the initial story node
      const choices = await this.geminiAiService.generateChoices(storyContent, {
        character,
        gameState: gameSession.gameState,
      });

      // Save the choices
      for (const choiceData of choices) {
        const choice = this.choiceRepository.create({
          ...choiceData,
          storyNode: savedStoryNode,
        });
        await this.choiceRepository.save(choice);
      }

      // Update the game session with the current story node
      savedSession.currentStoryNode = savedStoryNode;
      await this.gameSessionRepository.save(savedSession);

      return this.getGameSessionWithDetails(savedSession.id);
    } catch (error) {
      this.logger.error(
        `Error starting game session: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to start game session: ${error.message}`,
      );
    }
  }

  async getGameSessionWithDetails(sessionId: string): Promise<GameSession> {
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
      throw new NotFoundException(
        `Game session with ID ${sessionId} not found`,
      );
    }

    return gameSession;
  }

  async getActiveGameSessionForCharacter(
    characterId: string,
  ): Promise<GameSession> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { character: { id: characterId }, isActive: true },
      relations: ['character', 'currentStoryNode', 'currentStoryNode.choices'],
      order: { lastSavedAt: 'DESC' },
    });

    if (!gameSession) {
      throw new NotFoundException(
        `No active game session found for character ${characterId}`,
      );
    }

    return gameSession;
  }

  async makeChoice(sessionId: string, choiceId: string): Promise<GameSession> {
    try {
      const gameSession = await this.getGameSessionWithDetails(sessionId);
      const character = await this.getCharacterById(gameSession.character.id);

      // Find the selected choice
      const choice = await this.choiceRepository.findOne({
        where: { id: choiceId },
        relations: ['storyNode'],
      });

      if (!choice) {
        throw new NotFoundException(`Choice with ID ${choiceId} not found`);
      }

      if (choice.storyNode.id !== gameSession.currentStoryNode.id) {
        throw new BadRequestException(
          'The selected choice does not belong to the current story node',
        );
      }

      // Apply choice consequences to character and game state
      if (choice.consequences) {
        // Apply attribute changes
        if (choice.consequences.attributeChanges) {
          for (const [attr, change] of Object.entries(
            choice.consequences.attributeChanges,
          )) {
            if (character.attributes[attr] !== undefined) {
              character.attributes[attr] += change;
            }
          }
          await this.characterRepository.save(character);
        }

        // Add items
        if (
          choice.consequences.itemGains &&
          choice.consequences.itemGains.length > 0
        ) {
          for (const itemGain of choice.consequences.itemGains as ItemGain[]) {
            const existingItem = character.inventory.items.find(
              (item) => item.id === itemGain.id || item.name === itemGain.name,
            );
            if (existingItem) {
              existingItem.quantity += itemGain.quantity;
            } else {
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

        // Remove items
        if (
          choice.consequences.itemLosses &&
          choice.consequences.itemLosses.length > 0
        ) {
          for (const itemLoss of choice.consequences.itemLosses as ItemLoss[]) {
            const existingItemIndex = character.inventory.items.findIndex(
              (item) => item.id === itemLoss.id || item.name === itemLoss.name,
            );
            if (existingItemIndex >= 0) {
              const item = character.inventory.items[existingItemIndex];
              item.quantity -= itemLoss.quantity;
              if (item.quantity <= 0) {
                character.inventory.items.splice(existingItemIndex, 1);
              }
            }
          }
        }

        // Update currency
        if (choice.consequences.currencyChanges) {
          for (const [currency, amount] of Object.entries(
            choice.consequences.currencyChanges as Record<string, number>,
          )) {
            if (character.inventory.currency[currency] !== undefined) {
              character.inventory.currency[currency] += amount;
              if (character.inventory.currency[currency] < 0) {
                character.inventory.currency[currency] = 0;
              }
            } else if (amount > 0) {
              character.inventory.currency[currency] = amount;
            }
          }
        }

        // Save character changes
        await this.characterRepository.save(character);

        // Update game state flags
        if (choice.consequences.flagChanges) {
          for (const [flag, value] of Object.entries(
            choice.consequences.flagChanges,
          )) {
            gameSession.gameState.flags[flag] = value;
          }
        }

        // Cũng hỗ trợ trường flags cho tương thích ngược
        if (choice.consequences.flags) {
          for (const [flag, value] of Object.entries(
            choice.consequences.flags,
          )) {
            gameSession.gameState.flags[flag] = value;
          }
        }

        // Update location if needed
        if (choice.consequences.locationChange) {
          gameSession.gameState.currentLocation =
            choice.consequences.locationChange;
          if (
            !gameSession.gameState.discoveredLocations.includes(
              choice.consequences.locationChange,
            )
          ) {
            gameSession.gameState.discoveredLocations.push(
              choice.consequences.locationChange,
            );
          }
        }
      }

      // Determine the next prompt
      const nextPrompt =
        choice.nextPrompt ||
        `After ${character.name} decides to ${choice.text.toLowerCase()}, what happens next?`;

      // Check if this should be a combat scene
      let isCombatScene = false;
      let combatData = undefined;

      // Randomly determine if this should be a combat scene (20% chance)
      if (Math.random() < 0.2) {
        isCombatScene = true;
        const location =
          gameSession.currentStoryNode.location || 'unknown location';
        combatData = await this.geminiAiService.generateCombatScene(
          character,
          location,
        );
      }

      // Generate story content
      const storyContent = await this.geminiAiService.generateStoryContent(
        nextPrompt,
        {
          character,
          gameState: gameSession.gameState,
          previousChoice: choice.text,
        },
      );

      // Create the new story node
      const storyNode = this.storyNodeRepository.create({
        content: storyContent,
        location: gameSession.currentStoryNode.location, // Can be updated based on the story
        gameSession,
        isCombatScene,
        combatData,
      });

      const savedStoryNode = await this.storyNodeRepository.save(storyNode);

      // Generate choices for the new story node
      const choices = await this.geminiAiService.generateChoices(storyContent, {
        character,
        gameState: gameSession.gameState,
        isCombatScene,
      });

      // Save the choices
      for (const choiceData of choices) {
        const newChoice = this.choiceRepository.create({
          ...choiceData,
          storyNode: savedStoryNode,
        });
        await this.choiceRepository.save(newChoice);
      }

      // Update the game session with the current story node
      gameSession.currentStoryNode = savedStoryNode;
      await this.gameSessionRepository.save(gameSession);

      return this.getGameSessionWithDetails(gameSession.id);
    } catch (error) {
      this.logger.error(`Error making choice: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Failed to process choice: ${error.message}`,
      );
    }
  }

  async endGameSession(sessionId: string): Promise<GameSession> {
    const gameSession = await this.getGameSessionWithDetails(sessionId);
    gameSession.isActive = false;
    gameSession.endedAt = new Date();
    return this.gameSessionRepository.save(gameSession);
  }

  async getGameSessionHistory(sessionId: string): Promise<StoryNode[]> {
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['storyNodes', 'storyNodes.choices'],
    });

    if (!gameSession) {
      throw new NotFoundException(
        `Game session with ID ${sessionId} not found`,
      );
    }

    // Sort story nodes by creation date
    return gameSession.storyNodes.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }

  async getGameSessionsByCharacterId(
    characterId: string,
  ): Promise<GameSession[]> {
    return this.gameSessionRepository.find({
      where: { character: { id: characterId } },
      order: { startedAt: 'DESC' },
    });
  }
}
