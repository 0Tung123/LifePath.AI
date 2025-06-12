import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { PermadeathService } from './permadeath.service';
import { ConsequenceService } from './consequence.service';
import { User } from '../user/entities/user.entity';
import { MemoryService } from '../memory/memory.service';
import { MemoryType } from '../memory/entities/memory-record.entity';

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
    private permadeathService: PermadeathService,
    private consequenceService: ConsequenceService,
    private memoryService: MemoryService,
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

      // Set default settings if not provided
      if (!characterData.settings) {
        characterData.settings = {
          permadeathEnabled: false,
          difficultyLevel: 'normal',
        };
      }

      // Initialize history array if not provided
      if (!characterData.history) {
        characterData.history = [];
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
      // Get the user to access their API key
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Use AI to generate character based on description
      const generatedCharacter =
        await this.characterGeneratorService.generateCharacterFromDescription(
          description,
          primaryGenre,
          user.geminiApiKey || undefined,
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

  /**
   * Khởi tạo một phiên game mới cho một nhân vật
   *
   * Phương thức này sử dụng transaction để đảm bảo tính nhất quán của dữ liệu
   * và tránh race condition khi nhiều người dùng tạo phiên game cùng lúc.
   *
   * @param characterId ID của nhân vật
   * @param initialPrompt Prompt ban đầu (tùy chọn)
   * @returns Phiên game đã được khởi tạo đầy đủ
   */
  async startGameSession(
    characterId: string,
    initialPrompt?: string,
  ): Promise<GameSession> {
    // Validate character ID trước khi bắt đầu quá trình
    if (!characterId || !isUUID(characterId)) {
      throw new BadRequestException('Invalid character ID');
    }

    try {
      // Lấy thông tin nhân vật với đầy đủ quan hệ
      const character = await this.getCharacterById(characterId);

      // Kiểm tra xem nhân vật đã chết chưa
      if (character.isDead) {
        throw new BadRequestException(
          'Cannot start a game session with a dead character',
        );
      }

      // Kiểm tra xem nhân vật đã có phiên game đang hoạt động chưa
      const existingActiveSessions = await this.gameSessionRepository.count({
        where: {
          character: { id: characterId },
          isActive: true,
        },
      });

      if (existingActiveSessions > 0) {
        throw new BadRequestException(
          'This character already has an active game session. Please end the current session before starting a new one.',
        );
      }

      // Tạo trạng thái game ban đầu
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
        dangerLevel: 0,
        survivalChance: 100,
        dangerWarnings: [],
        nearDeathExperiences: 0,
        pendingConsequences: [],
      };

      // Tạo prompt ban đầu nếu không được cung cấp
      if (!initialPrompt) {
        initialPrompt = `You are ${character.name}, a ${
          character.characterClass
        } in a ${character.primaryGenre} world${
          character.customGenreDescription
            ? ' with ' + character.customGenreDescription
            : ''
        }. Your adventure begins...`;
      }

      // Tạo nội dung truyện ban đầu
      let storyContent: string;
      try {
        storyContent = await this.geminiAiService.generateStoryContent(
          initialPrompt,
          {
            character,
            gameState,
            user: character.user,
          },
        );
      } catch (aiError) {
        this.logger.error(
          `Error generating story content: ${aiError.message}`,
          aiError.stack,
        );
        // Fallback nếu AI service gặp lỗi
        storyContent = `${character.name}'s adventure begins in a small village. The sun is shining, and the air is filled with the promise of adventure. What will you do?`;
      }

      // Tạo các lựa chọn ban đầu
      let choices;
      try {
        choices = await this.geminiAiService.generateChoices(storyContent, {
          character,
          gameState,
        });
      } catch (aiError) {
        this.logger.error(
          `Error generating choices: ${aiError.message}`,
          aiError.stack,
        );
        // Fallback nếu AI service gặp lỗi
        choices = [
          { text: 'Explore the village', order: 0 },
          { text: 'Talk to the locals', order: 1 },
          { text: 'Check your inventory', order: 2 },
          {
            text: 'Custom action...',
            metadata: { isCustomAction: true },
            order: 3,
          },
        ];
      }

      // Sử dụng transaction để đảm bảo tính nhất quán của dữ liệu
      return await this.gameSessionRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Tạo và lưu phiên game
          const gameSession = transactionalEntityManager.create(GameSession, {
            character,
            gameState,
            isActive: true,
            startedAt: new Date(),
            lastSavedAt: new Date(),
            // Thiết lập các tùy chọn permadeath dựa trên cài đặt của nhân vật
            permadeathEnabled: character.settings?.permadeathEnabled || false,
            difficultyLevel: character.settings?.difficultyLevel || 'normal',
          });

          const savedSession = await transactionalEntityManager.save(
            GameSession,
            gameSession,
          );

          // Tạo và lưu nút truyện gốc
          const storyNode = transactionalEntityManager.create(StoryNode, {
            content: storyContent,
            location: 'Starting Village',
            gameSession: savedSession,
            isRoot: true, // Đánh dấu đây là nút gốc
            createdAt: new Date(),
            metadata: {
              isInitialNode: true,
              initialPrompt: initialPrompt,
            },
          });

          const savedStoryNode = await transactionalEntityManager.save(
            StoryNode,
            storyNode,
          );

          // Tạo tất cả các đối tượng lựa chọn với quan hệ đúng đắn
          const choiceEntities = choices.map((choiceData, index) => {
            return transactionalEntityManager.create(Choice, {
              ...choiceData,
              storyNode: savedStoryNode,
              storyNodeId: savedStoryNode.id,
              order: choiceData.order || index,
              metadata: choiceData.metadata || {},
            });
          });

          // Lưu tất cả các lựa chọn trong một thao tác batch
          const savedChoices = await transactionalEntityManager.save(
            Choice,
            choiceEntities,
          );

          // Cập nhật nút truyện với các lựa chọn đã lưu
          // Ensure savedChoices is treated as Choice[] to match the entity type
          if (
            Array.isArray(savedChoices) &&
            savedChoices.length > 0 &&
            Array.isArray(savedChoices[0])
          ) {
            // If it's a nested array, create a properly typed flattened array
            const flattenedChoices: Choice[] = [];
            (savedChoices as unknown as any[][]).forEach((choiceArray) => {
              choiceArray.forEach((choice) => {
                flattenedChoices.push(choice as Choice);
              });
            });
            savedStoryNode.choices = flattenedChoices;
          } else {
            // Otherwise use as is, but ensure proper typing
            // Check if savedChoices is actually an array of Choice objects
            if (
              Array.isArray(savedChoices) &&
              savedChoices.length > 0 &&
              typeof savedChoices[0] === 'object' &&
              'id' in savedChoices[0]
            ) {
              // It's already a properly typed Choice array
              savedStoryNode.choices = savedChoices as unknown as Choice[];
            } else {
              // Handle unexpected type by creating an empty array
              this.logger.warn(
                'Unexpected type for savedChoices, using empty array',
              );
              savedStoryNode.choices = [];
            }
          }
          await transactionalEntityManager.save(StoryNode, savedStoryNode);

          // Cập nhật phiên game với nút truyện hiện tại
          savedSession.currentStoryNode = savedStoryNode;
          savedSession.currentStoryNodeId = savedStoryNode.id;
          await transactionalEntityManager.save(GameSession, savedSession);

          // Tạo bản ghi trong lịch sử nhân vật
          if (!character.history) {
            character.history = [];
          }

          character.history.push({
            event: 'GAME_STARTED',
            timestamp: new Date(),
            details: {
              gameSessionId: savedSession.id,
              location: 'Starting Village',
            },
          });
          await transactionalEntityManager.save(Character, character);

          // Trả về phiên game đã được tải đầy đủ
          return this.getGameSessionWithDetails(savedSession.id);
        },
      );
    } catch (error) {
      // Phân loại và xử lý lỗi
      if (error instanceof BadRequestException) {
        // Truyền lại lỗi đã được xử lý
        throw error;
      }

      if (error.name === 'QueryFailedError') {
        this.logger.error(
          `Database error starting game session: ${error.message}`,
          error.stack,
        );
        throw new InternalServerErrorException(
          'A database error occurred while starting the game session',
        );
      }

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

      // Check if character is dead
      if (character.isDead) {
        throw new ForbiddenException(
          'This character is dead and cannot make choices',
        );
      }

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

      // Calculate current danger level for permadeath evaluation
      const dangerLevel =
        await this.permadeathService.calculateCurrentDangerLevel(sessionId);

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

        // Update game state flags if gameSession and gameState exist
        if (gameSession && gameSession.gameState) {
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
        } else if (!gameSession) {
          throw new InternalServerErrorException(
            'Game session is null when updating game state',
          );
        } else if (!gameSession.gameState) {
          // Initialize gameState if it doesn't exist
          gameSession.gameState = {
            flags: {},
            currentLocation: 'Unknown',
            visitedLocations: ['Unknown'],
            discoveredLocations: ['Unknown'],
            completedQuests: [],
            questLog: [],
            acquiredItems: [],
            npcRelations: {},
            dangerLevel: 0,
            survivalChance: 100,
            dangerWarnings: [],
            nearDeathExperiences: 0,
            pendingConsequences: [],
          };
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
          gameState:
            gameSession && gameSession.gameState
              ? gameSession.gameState
              : {
                  flags: {},
                  currentLocation: 'Unknown',
                  discoveredLocations: ['Unknown'],
                },
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
        gameState:
          gameSession && gameSession.gameState
            ? gameSession.gameState
            : {
                flags: {},
                currentLocation: 'Unknown',
                discoveredLocations: ['Unknown'],
              },
        isCombatScene,
      });

      // Create all choice entities with proper relationships
      const choiceEntities = choices.map((choiceData) => {
        return this.choiceRepository.create({
          ...choiceData,
          storyNode: savedStoryNode,
          storyNodeId: savedStoryNode.id,
          metadata: choiceData.metadata || {}, // Ensure metadata is always initialized
        });
      });

      // Use transaction to ensure data consistency
      await this.choiceRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Save all choices in a single batch operation
          const savedChoices =
            await transactionalEntityManager.save(choiceEntities);

          // Update the story node with the saved choices
          // Ensure savedChoices is treated as Choice[] to match the entity type
          if (
            Array.isArray(savedChoices) &&
            savedChoices.length > 0 &&
            Array.isArray(savedChoices[0])
          ) {
            // If it's a nested array, create a properly typed flattened array
            const flattenedChoices: Choice[] = [];
            (savedChoices as unknown as any[][]).forEach((choiceArray) => {
              choiceArray.forEach((choice) => {
                flattenedChoices.push(choice as Choice);
              });
            });
            savedStoryNode.choices = flattenedChoices;
          } else {
            // Otherwise use as is, but ensure proper typing
            // Check if savedChoices is actually an array of Choice objects
            if (
              Array.isArray(savedChoices) &&
              savedChoices.length > 0 &&
              typeof savedChoices[0] === 'object' &&
              'id' in savedChoices[0]
            ) {
              // It's already a properly typed Choice array
              savedStoryNode.choices = savedChoices as unknown as Choice[];
            } else {
              // Handle unexpected type by creating an empty array
              this.logger.warn(
                'Unexpected type for savedChoices, using empty array',
              );
              savedStoryNode.choices = [];
            }
          }

          await transactionalEntityManager.save(savedStoryNode);

          // Update the game session with the current story node
          if (gameSession) {
            gameSession.currentStoryNode = savedStoryNode;
            gameSession.currentStoryNodeId = savedStoryNode.id;
            gameSession.lastSavedAt = new Date();
            await transactionalEntityManager.save(gameSession);
          } else {
            throw new InternalServerErrorException(
              'Game session is null during transaction',
            );
          }
        },
      );

      // Return the updated game session with all details
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

  /**
   * Lấy tất cả các phiên game của một người dùng
   * @param userId ID của người dùng
   * @returns Danh sách các phiên game
   */
  async getGameSessionsByUserId(userId: string): Promise<GameSession[]> {
    // Lấy tất cả các nhân vật của người dùng
    const characters = await this.characterRepository.find({
      where: { user: { id: userId } },
      select: ['id'],
    });

    if (characters.length === 0) {
      return [];
    }

    // Lấy tất cả các ID của nhân vật
    const characterIds = characters.map((char) => char.id);

    // Lấy tất cả các phiên game của các nhân vật này
    return this.gameSessionRepository.find({
      where: { character: { id: In(characterIds) } },
      relations: ['character'],
      order: { startedAt: 'DESC' },
    });
  }

  async processUserInput(
    gameSessionId: string,
    inputType: string,
    content: string,
    target?: string,
  ): Promise<GameSession> {
    // Get the game session with details
    let gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
      relations: ['character', 'currentStoryNode'],
    });

    if (!gameSession) {
      throw new NotFoundException(
        `Game session with ID ${gameSessionId} not found`,
      );
    }

    if (!gameSession.isActive) {
      throw new BadRequestException('This game session is no longer active');
    }

    const character = gameSession.character;

    // Check if character is dead
    if (character.isDead) {
      throw new BadRequestException(
        'This character is dead and cannot perform actions',
      );
    }

    // Format input based on type
    let formattedInput = '';
    switch (inputType) {
      case 'action':
        formattedInput = `${character.name} decides to ${content}.`;
        break;
      case 'thought':
        formattedInput = `${character.name} thinks to themself: "${content}"`;
        break;
      case 'speech':
        if (target) {
          formattedInput = `${character.name} says to ${target}: "${content}"`;
        } else {
          formattedInput = `${character.name} says: "${content}"`;
        }
        break;
      default:
        formattedInput = content;
    }

    // Generate response from AI
    const currentNode = gameSession.currentStoryNode;

    // Create context for the AI
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

    const aiResponse =
      await this.geminiAiService.generateContent(contextPrompt);

    // Extract narrative and choices
    const narrativeMatch = aiResponse.match(
      /\[NARRATIVE\]([\s\S]*?)\[\/NARRATIVE\]/,
    );
    const choicesMatch = aiResponse.match(/\[CHOICES\]([\s\S]*?)\[\/CHOICES\]/);

    const narrative = narrativeMatch ? narrativeMatch[1].trim() : aiResponse;
    let choicesText = choicesMatch ? choicesMatch[1].trim() : '';

    // If no choices format found, generate default choices
    if (!choicesText) {
      choicesText =
        '1. Continue\n2. Investigate further\n3. Talk to someone\n4. Custom action...';
    }

    // Create new story node
    const storyNode = new StoryNode();
    storyNode.gameSessionId = gameSession.id;
    storyNode.content = narrative;
    storyNode.isRoot = false;
    storyNode.parentNodeId = currentNode.id;
    storyNode.metadata = {
      inputType,
      userInput: formattedInput,
    };
    storyNode.createdAt = new Date();

    // Save the story node first to get its ID
    const savedNode = await this.storyNodeRepository.save(storyNode);

    // Create choices
    const choiceLines = choicesText
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());

    // Ensure we have at least one choice
    if (choiceLines.length === 0) {
      choiceLines.push('Continue');
      choiceLines.push('Do something else');
      choiceLines.push('Talk to someone');
      choiceLines.push('Custom action...');
    }

    // Create choice entities with proper bidirectional relationships
    const choices = choiceLines.map((choiceText, index) => {
      const choice = new Choice();
      // Establish proper bidirectional relationship
      choice.storyNode = savedNode;
      choice.storyNodeId = savedNode.id;
      choice.text = choiceText;
      choice.order = index;

      // If it's the "Custom action" choice, mark it
      if (choiceText.toLowerCase().includes('custom action')) {
        choice.metadata = { isCustomAction: true };
      } else {
        // Ensure metadata is always initialized to prevent null reference errors
        choice.metadata = {};
      }

      return choice;
    });

    try {
      // Use transaction to ensure data consistency across tables
      await this.choiceRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Save choices within the transaction
          const savedChoices = await transactionalEntityManager.save(choices);

          // Update the story node with saved choices to ensure IDs are properly set
          // Ensure savedChoices is treated as Choice[] to match the entity type
          if (
            Array.isArray(savedChoices) &&
            savedChoices.length > 0 &&
            Array.isArray(savedChoices[0])
          ) {
            // If it's a nested array, flatten it with proper type casting
            savedNode.choices = (savedChoices as unknown as Choice[][]).flat();
          } else {
            // Otherwise use as is
            savedNode.choices = savedChoices as unknown as Choice[];
          }

          // Save the updated story node within the same transaction
          await transactionalEntityManager.save(savedNode);

          // Update game session with the new story node
          if (gameSession) {
            gameSession.currentStoryNodeId = savedNode.id;
            gameSession.currentStoryNode = savedNode;
            gameSession.lastSavedAt = new Date();

            // Save the game session within the same transaction
            await transactionalEntityManager.save(gameSession);
          } else {
            throw new InternalServerErrorException(
              'Game session is null during transaction',
            );
          }
        },
      );

      // Reload the game session to ensure we have the latest data with all relationships
      const updatedGameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSession.id },
        relations: [
          'currentStoryNode',
          'currentStoryNode.choices',
          'character',
        ],
      });

      if (updatedGameSession) {
        // Use the updated game session for further processing
        gameSession = updatedGameSession;
      } else {
        this.logger.warn(
          `Could not reload game session ${gameSession.id} after saving choices`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error saving choices and updating story node: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to process user input: ${error.message}`,
      );
    }

    // No need to save gameSession again as it was already saved in the transaction

    // Calculate current danger level for permadeath evaluation
    const dangerLevel =
      await this.permadeathService.calculateCurrentDangerLevel(gameSessionId);

    // Evaluate for permadeath if it's an action
    if (inputType === 'action' && gameSession.permadeathEnabled) {
      const deathEvaluation =
        await this.permadeathService.evaluateLethalSituation(
          gameSessionId,
          content,
          dangerLevel,
        );

      // If character died, update gameSession to reflect that
      if (deathEvaluation.died) {
        // Refresh gameSession to get latest state after death processing
        const updatedSession = await this.gameSessionRepository.findOne({
          where: { id: gameSessionId },
          relations: ['character', 'currentStoryNode'],
        });

        if (!updatedSession) {
          throw new NotFoundException(
            `Game session with ID ${gameSessionId} not found`,
          );
        }

        return updatedSession;
      }
    }

    // Evaluate consequences if it's an action or speech
    if (inputType === 'action' || inputType === 'speech') {
      const gameContext = {
        gameSessionId,
        characterId: character.id,
        currentSituation: savedNode.content,
        characterDescription: `${character.name}, a level ${character.level} ${character.characterClass}`,
      };

      await this.consequenceService.evaluateActionConsequences(
        content,
        gameContext,
      );

      // Update character's survival stats for actions
      if (inputType === 'action') {
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

  /**
   * Lưu phiên game vào cơ sở dữ liệu
   * @param gameSession Phiên game cần lưu
   * @returns Phiên game đã lưu
   */
  async saveGameSession(gameSession: GameSession): Promise<GameSession> {
    try {
      return await this.gameSessionRepository.save(gameSession);
    } catch (error) {
      this.logger.error(
        `Error saving game session: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to save game session: ${error.message}`,
      );
    }
  }

  /**
   * Xóa phiên game và tất cả dữ liệu liên quan
   * @param gameSessionId ID của phiên game cần xóa
   * @returns Thông báo kết quả
   */
  async deleteGameSession(
    gameSessionId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Lấy phiên game với các mối quan hệ
      const gameSession = await this.gameSessionRepository.findOne({
        where: { id: gameSessionId },
        relations: [
          'character',
          'currentStoryNode',
          'storyNodes',
          'storyNodes.choices',
        ],
      });

      if (!gameSession) {
        throw new NotFoundException(
          `Game session with ID ${gameSessionId} not found`,
        );
      }

      // Lưu thông tin nhân vật để xóa sau
      const character = gameSession.character;

      // Lấy tất cả các storyNode của phiên game
      const storyNodes = gameSession.storyNodes || [];

      // Xóa tất cả các lựa chọn (choices) của mỗi storyNode
      for (const node of storyNodes) {
        if (node.choices && node.choices.length > 0) {
          await this.choiceRepository.remove(node.choices);
        }
      }

      // Xóa tất cả các storyNode
      if (storyNodes.length > 0) {
        await this.storyNodeRepository.remove(storyNodes);
      }

      // Xóa phiên game
      await this.gameSessionRepository.remove(gameSession);

      // Xóa nhân vật nếu có
      if (character) {
        // Kiểm tra xem nhân vật có phiên game khác không
        const otherSessions = await this.gameSessionRepository.count({
          where: { character: { id: character.id } },
        });

        // Nếu không có phiên game nào khác, xóa nhân vật
        if (otherSessions === 0) {
          await this.characterRepository.remove(character);
          return {
            success: true,
            message: `Game session and character have been successfully deleted`,
          };
        }
      }

      return {
        success: true,
        message: `Game session has been successfully deleted`,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting game session: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to delete game session: ${error.message}`,
      );
    }
  }

  /**
   * Xóa nhân vật và tất cả phiên game liên quan
   * @param id ID của nhân vật cần xóa
   * @returns Thông báo kết quả
   */
  async deleteCharacter(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Lấy nhân vật với các phiên game
      const character = await this.characterRepository.findOne({
        where: { id },
        relations: ['gameSessions'],
      });

      if (!character) {
        throw new NotFoundException(`Character with ID ${id} not found`);
      }

      // Lấy tất cả các phiên game của nhân vật
      const gameSessions = character.gameSessions || [];
      const gameSessionIds = gameSessions.map((session) => session.id);

      this.logger.log(
        `Deleting character ${id} with ${gameSessionIds.length} game sessions`,
      );

      if (gameSessionIds.length > 0) {
        // 1. Lấy tất cả các storyNode của tất cả phiên game
        const storyNodes = await this.storyNodeRepository.find({
          where: { gameSession: { id: In(gameSessionIds) } },
          relations: ['choices'],
        });

        this.logger.log(`Found ${storyNodes.length} story nodes to delete`);

        // 2. Xóa tất cả các lựa chọn (choices) của tất cả storyNode
        for (const node of storyNodes) {
          if (node.choices && node.choices.length > 0) {
            this.logger.log(
              `Deleting ${node.choices.length} choices for story node ${node.id}`,
            );
            await this.choiceRepository.remove(node.choices);
          }
        }

        // 3. Xóa tất cả các storyNode
        if (storyNodes.length > 0) {
          this.logger.log(`Deleting ${storyNodes.length} story nodes`);
          await this.storyNodeRepository.remove(storyNodes);
        }

        // 4. Xóa tất cả các phiên game
        this.logger.log(`Deleting ${gameSessions.length} game sessions`);
        await this.gameSessionRepository.remove(gameSessions);
      }

      // 5. Cuối cùng, xóa nhân vật
      this.logger.log(`Deleting character ${character.id} (${character.name})`);
      await this.characterRepository.remove(character);

      return {
        success: true,
        message: `Character and all related game sessions have been successfully deleted`,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting character: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to delete character: ${error.message}`,
      );
    }
  }
}
