import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { CreateGameDto, GameSettingsDto } from './dto/create-game.dto';
import { UpdateWorldStateDto } from './dto/update-world-state.dto';
import { UpdateNpcRelationshipDto } from './dto/update-npc-relationship.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { UpdateStatusEffectsDto } from './dto/update-status-effect.dto';
import {
  UpdateGameEventDto,
  GameEventConsequenceDto,
} from './dto/update-game-event.dto';
import { GeminiService } from './gemini.service';
import {
  ParsedGameContent,
  GameStats,
  InventoryItem,
  CharacterSkill,
  LoreFragment,
  GameChoice,
  LifeSummary,
  Skill,
} from './interfaces/game-content.interface';
import { CharacterAttributes } from '../common/types/game-engine.types';
import {
  InteractionType,
  InteractionAttributes,
  StoryHistoryEntry,
  WorldState,
  NpcRelationship,
  ContentSegment,
} from '../common/types/game-engine.types';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
    private geminiService: GeminiService,
  ) {}

  async create(userId: string, createGameDto: CreateGameDto): Promise<Game> {
    try {
      const { gameSettings } = createGameDto;

      // Generate initial prompt for Gemini
      const initialPrompt = await this.buildInitialPrompt(gameSettings);

      // Get response from Gemini API
      this.logger.log('Generating initial game content with Gemini...');
      const aiResponse =
        await this.geminiService.generateGameContent(initialPrompt);

      this.logger.log(`AI Response length: ${aiResponse.length} characters`);

      // Parse AI response
      const parsedContent = this.parseAiResponse(aiResponse);

      this.logger.log(
        `Parsed content - Choices found: ${parsedContent.choices.length}`,
      );

      // Ensure proper character stats structure
      const statsWithHealth = this.ensureProperStatsStructure(
        parsedContent.stats,
        gameSettings.characterBackstory,
        gameSettings.setting,
      );

      // Create new game record
      const newGame = this.gamesRepository.create();
      newGame.userId = userId;
      newGame.settings = gameSettings;

      // Tạo entry lịch sử với định dạng mới
      let initialStoryEntry: StoryHistoryEntry = {
        type: InteractionType.STORY,
        content: parsedContent.storyText,
        timestamp: new Date(),
      };

      // Nếu có phân đoạn nội dung có cấu trúc, thêm vào attributes
      if (
        parsedContent.storySegments &&
        parsedContent.storySegments.length > 0
      ) {
        // Create a new StoryHistoryEntry with attributes
        initialStoryEntry = {
          ...initialStoryEntry,
          attributes: {
            segments: parsedContent.storySegments,
          },
        };
      }

      newGame.storyHistory = [initialStoryEntry];
      newGame.characterStats = statsWithHealth;
      newGame.inventoryItems = parsedContent.inventory;
      newGame.characterSkills = parsedContent.skills;
      newGame.loreFragments = parsedContent.lore;
      newGame.currentPrompt = parsedContent.storyText;
      newGame.currentChoices = parsedContent.choices;
      newGame.currentGenericChoices = parsedContent.genericChoices || [];
      newGame.chatHistoryForGemini = [];
      newGame.knowledgeBase = [];
      newGame.currentObjective = null;
      newGame.npcsMet = [];
      newGame.itemsUsed = [];
      newGame.importantEvents = [];
      newGame.achievements = [];
      newGame.karmaScore = parsedContent.karmaChange || 0;
      newGame.reputation = parsedContent.reputationChanges || {};

      // Khởi tạo các trường mới
      newGame.worldState = {
        gameTime: {
          day: 1,
          hour: 12,
          minute: 0,
          season: 'spring',
          year: 1,
        },
        environment: {
          weather: 'clear',
          temperature: 20,
          conditions: ['normal'],
        },
        society: {
          politicalState: 'stable',
          economicState: 'normal',
        },
        discoveredRegions: [],
        activeEvents: [],
      };

      newGame.npcRelationships = [];
      newGame.questLog = [];
      newGame.playerChoiceHistory = [];
      newGame.worldEvolution = [];
      newGame.active = true;
      newGame.deathDate = null;
      newGame.deathCause = null;

      // Debug logging
      this.logger.log(
        `Creating game with settings: ${JSON.stringify(gameSettings)}`,
      );
      this.logger.log(`Character name: ${gameSettings.characterName}`);

      // Save to database
      const savedGame = await this.gamesRepository.save(newGame);

      // Debug logging after save
      this.logger.log(
        `Saved game settings: ${JSON.stringify(savedGame.settings)}`,
      );
      this.logger.log(
        `Saved character name: ${savedGame.settings.characterName}`,
      );

      return savedGame;
    } catch (error) {
      this.logger.error('Error creating game:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create game');
    }
  }

  /**
   * Find all games for a specific user
   */
  async findAllByUser(userId: string): Promise<Game[]> {
    try {
      return this.gamesRepository.find({
        where: { userId },
        order: { updatedAt: 'DESC' }, // Show newest games first
      });
    } catch (error) {
      this.logger.error(`Error fetching games for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to fetch games');
    }
  }

  /**
   * Find a specific game by ID
   */
  async findOne(id: string, userId: string): Promise<Game> {
    try {
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // Debug logging
      this.logger.log(
        `Retrieved game settings: ${JSON.stringify(game.settings)}`,
      );
      this.logger.log(
        `Retrieved character name: ${game.settings.characterName}`,
      );

      return game;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error fetching game ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch game');
    }
  }

  /**
   * Remove a game by ID
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      // First check if the game exists and belongs to the user
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // Delete the game
      await this.gamesRepository.delete({ id, userId });
      this.logger.log(`Game ${id} successfully deleted`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error deleting game ${id}:`, error);
      throw new InternalServerErrorException('Failed to delete game');
    }
  }

  /**
   * Process a player action in the game (choice or custom action)
   */
  async processAction(
    id: string,
    userId: string,
    choiceNumber?: number,
    action?: string,
    think?: string,
    communication?: string,
    // Thêm các tham số mới
    actionType?: string,
    actionTarget?: string,
    actionContext?: string,
    actionIntensity?: number,
    actionIntent?: string,
    actionMetadata?: Record<string, unknown>,
  ): Promise<Game> {
    try {
      // Process status effects before action
      await this.processStatusEffects(id, userId);
      // 1. Check if game exists and belongs to the user
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // 2. Validate input - kiểm tra xem có ít nhất một loại hành động được cung cấp
      const hasAction =
        choiceNumber !== undefined ||
        action !== undefined ||
        think !== undefined ||
        communication !== undefined ||
        actionType !== undefined;

      if (!hasAction) {
        throw new BadRequestException(
          'Must provide at least one type of action (choice, custom action, thought, communication, or action type)',
        );
      }

      // Xác định loại hành động dựa trên các tham số được cung cấp
      let determinedActionType = actionType;
      let actionContent = '';

      if (!determinedActionType) {
        if (choiceNumber !== undefined) {
          determinedActionType = InteractionType.USER_CHOICE;
        } else if (action) {
          determinedActionType = InteractionType.USER_CUSTOM_ACTION;
        } else if (think) {
          determinedActionType = InteractionType.USER_THINKING;
        } else if (communication) {
          determinedActionType = InteractionType.USER_COMMUNICATION;
        }
      }

      // Lấy nội dung hành động
      if (choiceNumber !== undefined) {
        const validChoice = game.currentChoices.find(
          (choice) => choice.number === choiceNumber,
        );
        if (!validChoice) {
          throw new BadRequestException(
            `Invalid choice number: ${choiceNumber}`,
          );
        }
        actionContent = validChoice.text;

        // Handle special resurrection choices
        if (
          !game.active &&
          (validChoice.text.includes('Hồi Quy') ||
            validChoice.text.includes('hồi sinh'))
        ) {
          // User chose to use regression/resurrection ability
          return await this.resurrectCharacter(id, userId);
        } else if (
          !game.active &&
          (validChoice.text.includes('Chấp nhận cái chết') ||
            validChoice.text.includes('kết thúc cuộc phiêu lưu'))
        ) {
          // User chose to accept death - just return current game state
          return game;
        }
      } else if (action) {
        actionContent = action;
      } else if (think) {
        actionContent = think;
      } else if (communication) {
        actionContent = communication;
      }

      // Tạo metadata cho hành động
      // Since InteractionAttributes has readonly properties, we need to build it all at once
      const attributesEntries: Record<
        string,
        string | number | boolean | object | null
      > = {};

      // Add basic attributes
      if (actionTarget) attributesEntries['target'] = actionTarget;
      if (actionContext) attributesEntries['context'] = actionContext;
      if (actionIntensity !== undefined)
        attributesEntries['intensity'] = actionIntensity;
      if (actionIntent) attributesEntries['intent'] = actionIntent;

      // Thêm các metadata tùy chỉnh
      if (actionMetadata) {
        Object.entries(actionMetadata).forEach(([key, value]) => {
          if (value !== undefined) {
            attributesEntries[key] = value as
              | string
              | number
              | boolean
              | object
              | null;
          }
        });
      }

      // Create the InteractionAttributes object
      const interactionAttributes: InteractionAttributes = attributesEntries;

      // 3. Build prompt for Gemini based on the action
      const prompt = await this.buildActionPrompt(
        game,
        choiceNumber,
        action,
        think,
        communication,
      );

      // 4. Send to Gemini and get response
      const aiResponse = await this.geminiService.generateGameContent(prompt);

      // 5. Parse the response
      const parsedContent = this.parseAiResponse(aiResponse);

      // 6. Update game state
      // First, add user action to history with enhanced metadata
      const now = new Date();

      // Tạo entry lịch sử với thông tin phong phú hơn
      let historyEntry: StoryHistoryEntry = {
        type: determinedActionType || 'unknown',
        content: actionContent,
        timestamp: now,
        attributes:
          Object.keys(interactionAttributes).length > 0
            ? interactionAttributes
            : undefined,
      };

      if (actionIntensity && actionIntensity > 70) {
        const worldImpactData = {
          environmentalChanges: {},
          socialChanges: {},
          affectedRelationships: [] as Array<{
            entityId: string;
            entityName: string;
            relationshipChange: number;
            newStatus?: string;
          }>,
        };

        // Thêm thông tin về các mối quan hệ bị ảnh hưởng nếu có target
        if (actionTarget) {
          worldImpactData.affectedRelationships = [
            {
              entityId: 'unknown',
              entityName: actionTarget,
              relationshipChange: actionIntensity > 80 ? 10 : 5,
            },
          ];
        }

        // Create a new historyEntry with the worldImpact
        historyEntry = {
          ...historyEntry,
          worldImpact: worldImpactData,
        };
      }

      // Thêm vào lịch sử
      game.storyHistory.push(historyEntry);

      // Then add AI response with enhanced content
      let storyEntry: StoryHistoryEntry = {
        type: InteractionType.STORY,
        content: parsedContent.storyText,
        timestamp: new Date(),
      };

      // Nếu có phân đoạn nội dung có cấu trúc, thêm vào attributes
      if (
        parsedContent.storySegments &&
        parsedContent.storySegments.length > 0
      ) {
        // Create a new StoryHistoryEntry with attributes
        storyEntry = {
          ...storyEntry,
          attributes: {
            segments: parsedContent.storySegments,
          },
        };
      }

      // Nếu có thay đổi trạng thái thế giới, thêm vào worldImpact
      if (parsedContent.worldStateChanges) {
        // Create a new StoryHistoryEntry with the worldImpact
        const updatedStoryEntry: StoryHistoryEntry = {
          ...storyEntry,
          worldImpact: {
            environmentalChanges: {},
            socialChanges: {},
            affectedRelationships: [],
          },
        };
        // Replace the storyEntry with the updated one
        storyEntry = updatedStoryEntry;

        // Xử lý thay đổi môi trường
        if (parsedContent.worldStateChanges.environment) {
          const envChanges = parsedContent.worldStateChanges.environment;
          // Create a new environmentalChanges object with all entries
          if (storyEntry.worldImpact?.environmentalChanges) {
            const newEnvironmentalChanges: Record<
              string,
              { after: string | number }
            > = {};

            Object.entries(envChanges).forEach(([aspect, value]) => {
              newEnvironmentalChanges[aspect] = {
                after: value as string | number,
              };
            });

            // Create a new StoryHistoryEntry with updated worldImpact
            const updatedStoryEntry: StoryHistoryEntry = {
              ...storyEntry,
              worldImpact: {
                ...storyEntry.worldImpact,
                environmentalChanges: newEnvironmentalChanges,
              },
            };

            // Replace the storyEntry with the updated one
            storyEntry = updatedStoryEntry;
          }
        }

        // Xử lý thay đổi xã hội
        if (parsedContent.worldStateChanges.society) {
          const socChanges = parsedContent.worldStateChanges.society;
          // Create a new socialChanges object with all entries
          if (storyEntry.worldImpact?.socialChanges) {
            const newSocialChanges: Record<string, { after: string | number }> =
              {};

            Object.entries(socChanges).forEach(([aspect, value]) => {
              newSocialChanges[aspect] = {
                after: value as string | number,
              };
            });

            // Create a new StoryHistoryEntry with updated worldImpact
            const updatedStoryEntry: StoryHistoryEntry = {
              ...storyEntry,
              worldImpact: {
                ...storyEntry.worldImpact,
                socialChanges: newSocialChanges,
              },
            };

            // Replace the storyEntry with the updated one
            storyEntry = updatedStoryEntry;
          }
        }
      }

      // Thêm vào lịch sử
      game.storyHistory.push(storyEntry);

      // Update game properties
      game.currentPrompt = parsedContent.storyText;
      game.currentChoices = parsedContent.choices;
      game.currentGenericChoices = parsedContent.genericChoices || [];

      // Nếu có sự kiện được kích hoạt, lưu vào lịch sử
      if (
        parsedContent.triggeredEvents &&
        parsedContent.triggeredEvents.length > 0
      ) {
        parsedContent.triggeredEvents.forEach((event) => {
          game.storyHistory.push({
            type: 'event',
            content: `${event.name}: ${event.description}`,
            timestamp: new Date(),
            attributes: {
              eventId: event.id,
              eventType: event.type,
              probability: event.probability ?? 0, // Use 0 as default if undefined
            },
          });
        });
      }
      // Ensure proper stats structure before updating
      const properStats = this.ensureProperStatsStructure(parsedContent.stats);
      game.characterStats = { ...game.characterStats, ...properStats };

      // Check for death condition
      const isDead = this.checkIfCharacterIsDead(
        this.convertGameStats(game.characterStats),
      );
      if (isDead && game.active) {
        // Check for resurrection items/skills
        const hasResurrectionItem = this.checkForResurrectionItems(
          this.convertInventoryItems(game.inventoryItems),
          game.characterSkills,
        );

        if (hasResurrectionItem) {
          // Find the specific resurrection skill to customize the choice text
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

            return (
              resurrectionKeywords.some(
                (keyword) =>
                  skillName.includes(keyword) || skillDesc.includes(keyword),
              ) ||
              skillDesc.includes('quay trở về') ||
              skillDesc.includes('sau khi chết')
            );
          });

          let resurrectionChoiceText: string =
            'Kích hoạt khả năng đặc biệt để tránh cái chết';

          if (resurrectionSkill) {
            const skillName = resurrectionSkill.name.toLowerCase();
            if (
              skillName.includes('hồi quy') ||
              skillName.includes('bản thể')
            ) {
              resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - quay về thời điểm trước khi chết`;
            } else if (
              skillName.includes('trọng sinh') ||
              skillName.includes('tái sinh')
            ) {
              resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - tái sinh với ký ức`;
            } else if (
              skillName.includes('phục sinh') ||
              skillName.includes('hồi sinh')
            ) {
              resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - hồi sinh từ cõi chết`;
            } else if (
              skillName.includes('bất tử') ||
              skillName.includes('bất diệt')
            ) {
              resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - sử dụng sức mạnh bất tử`;
            } else {
              resurrectionChoiceText = `Kích hoạt "${resurrectionSkill.name}" - tránh cái chết`;
            }
          }

          // Character has resurrection ability - add special choices
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
        } else {
          // Character is dead - end game
          game.active = false;
          game.deathDate = new Date();
          game.deathCause = this.extractDeathCause(parsedContent.storyText);
          game.currentChoices = [];
          game.currentPrompt = `${parsedContent.storyText}\n\n**GAME OVER: Nhân vật của bạn đã chết!**`;
        }
      }

      // Handle inventory changes (merge with existing inventory)
      // Update quantities for existing items or add new ones
      parsedContent.inventory.forEach((newItem) => {
        const existingItem = game.inventoryItems.find(
          (item) => item.name === newItem.name,
        );
        if (existingItem) {
          existingItem.quantity += newItem.quantity;
          if (
            newItem.description &&
            newItem.description !== existingItem.description
          ) {
            existingItem.description = newItem.description; // Update description if changed
          }
        } else {
          game.inventoryItems.push(newItem); // Add new item
        }
      });

      // Handle new skills
      parsedContent.skills.forEach((newSkill) => {
        const existingSkill = game.characterSkills.find(
          (skill) => skill.name === newSkill.name,
        );
        if (existingSkill) {
          // Create a new skill object with updated properties
          const updatedSkill: CharacterSkill = {
            ...existingSkill,
            level: newSkill.level ?? existingSkill.level,
            mastery: newSkill.mastery ?? existingSkill.mastery,
            description: newSkill.description ?? existingSkill.description,
          };

          // Replace the existing skill with the updated one
          const skillIndex = game.characterSkills.findIndex(
            (s) => s.name === existingSkill.name,
          );
          if (skillIndex !== -1) {
            game.characterSkills[skillIndex] = updatedSkill;
          }
        } else {
          // Add new skill
          game.characterSkills.push(newSkill);
        }
      });

      // Add new lore fragments
      game.loreFragments = [...game.loreFragments, ...parsedContent.lore];

      // Handle karma changes
      if (parsedContent.karmaChange && parsedContent.karmaChange !== 0) {
        game.karmaScore = (game.karmaScore || 0) + parsedContent.karmaChange;
        this.logger.log(
          `Karma changed by ${parsedContent.karmaChange} (${parsedContent.karmaReason}). New score: ${game.karmaScore}`,
        );
      }

      // Handle reputation changes
      if (
        parsedContent.reputationChanges &&
        Object.keys(parsedContent.reputationChanges).length > 0
      ) {
        if (!game.reputation) {
          game.reputation = {};
        }

        Object.entries(parsedContent.reputationChanges).forEach(
          ([group, change]) => {
            game.reputation[group] = (game.reputation[group] || 0) + change;
            this.logger.log(
              `Reputation with ${group} changed by ${change}. New score: ${game.reputation[group]}`,
            );
          },
        );
      }

      // 7. Save updated game to database
      const updatedGame = await this.gamesRepository.save(game);
      this.logger.log(`Game ${id} action processed successfully`);

      return updatedGame;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error processing action for game ${id}:`, error);
      throw new InternalServerErrorException('Failed to process game action');
    }
  }

  /**
   * Build a prompt for the AI based on player action
   */
  private async buildActionPrompt(
    game: Game,
    choiceNumber?: number,
    action?: string,
    think?: string,
    communication?: string,
    actionType?: string,
    actionTarget?: string,
    actionContext?: string,
    actionIntensity?: number,
    actionIntent?: string,
    actionMetadata?: Record<string, unknown>,
  ): Promise<string> {
    try {
      // Import the enhanced action prompt
      const { buildEnhancedActionPrompt } = await import(
        './prompts/enhanced-world-building.prompt'
      );

      // Tạo thông tin bổ sung về hành động
      const enhancedActionInfo = {
        type: actionType,
        target: actionTarget,
        context: actionContext,
        intensity: actionIntensity,
        intent: actionIntent,
        metadata: actionMetadata,
        worldState: game.worldState,
        npcRelationships: game.npcRelationships,
        questLog: game.questLog,
        worldEvolution: game.worldEvolution,
      };

      // The buildEnhancedActionPrompt function only accepts 5 parameters
      // We'll need to modify the game object to include the enhancedActionInfo
      const gameWithEnhancedInfo = {
        ...game,
        enhancedActionInfo, // Add the enhancedActionInfo to the game object
      };

      // Import Vietnamese language enforcer
      const { enforceVietnameseLanguage } = await import(
        './prompts/vietnamese-language-enforcer'
      );

      const basePrompt = buildEnhancedActionPrompt(
        gameWithEnhancedInfo,
        choiceNumber ?? 0, // Provide default value if undefined
        action ?? '',
        think ?? '',
        communication ?? '',
      );

      // Enforce Vietnamese language requirement
      return enforceVietnameseLanguage(basePrompt);
    } catch (error) {
      this.logger.error('Error building action prompt:', error);
      throw new BadRequestException('Failed to build action prompt');
    }
  }

  /**
   * Generate character attributes based on background and world
   */
  private generateCharacterAttributes(
    background: string,
    world: string,
  ): CharacterAttributes {
    // Base stats với random từ 8-12
    const baseStats = {
      strength: 8 + Math.floor(Math.random() * 5),
      agility: 8 + Math.floor(Math.random() * 5),
      intelligence: 8 + Math.floor(Math.random() * 5),
      wisdom: 8 + Math.floor(Math.random() * 5),
      charisma: 8 + Math.floor(Math.random() * 5),
      constitution: 8 + Math.floor(Math.random() * 5),
      luck: 8 + Math.floor(Math.random() * 5),
      level: 1,
      experience: 0,
      nextLevelExp: 100,
    };

    // Điều chỉnh chỉ số dựa trên tiểu sử
    const backgroundBonus = this.getBackgroundBonus(background);
    const worldBonus = this.getWorldBonus(world);

    // Áp dụng bonus
    Object.keys(backgroundBonus).forEach((key) => {
      if (key in baseStats) {
        (baseStats as any)[key] += backgroundBonus[key];
      }
    });

    Object.keys(worldBonus).forEach((key) => {
      if (key in baseStats) {
        (baseStats as any)[key] += worldBonus[key];
      }
    });

    // Tính toán HP, MP, Stamina dựa trên chỉ số
    const healthMax = Math.floor(
      baseStats.constitution * 8 + baseStats.level * 12 + 50,
    );
    const manaMax = Math.floor(
      baseStats.intelligence * 6 +
        baseStats.wisdom * 4 +
        baseStats.level * 8 +
        30,
    );
    const staminaMax = Math.floor(
      baseStats.constitution * 4 +
        baseStats.agility * 6 +
        baseStats.level * 10 +
        40,
    );

    return {
      ...baseStats,
      health: {
        current: healthMax,
        max: healthMax,
      },
      mana: {
        current: manaMax,
        max: manaMax,
      },
      stamina: {
        current: staminaMax,
        max: staminaMax,
      },
    };
  }

  /**
   * Get stat bonus based on character background
   */
  private getBackgroundBonus(background: string): Record<string, number> {
    const backgroundLower = background.toLowerCase();
    const bonus: Record<string, number> = {};

    // Warrior/Fighter backgrounds
    if (
      backgroundLower.includes('chiến binh') ||
      backgroundLower.includes('warrior') ||
      backgroundLower.includes('fighter') ||
      backgroundLower.includes('võ sĩ')
    ) {
      bonus.strength = 2;
      bonus.constitution = 2;
      bonus.agility = 1;
    }
    // Mage/Scholar backgrounds
    else if (
      backgroundLower.includes('pháp sư') ||
      backgroundLower.includes('mage') ||
      backgroundLower.includes('học giả') ||
      backgroundLower.includes('scholar')
    ) {
      bonus.intelligence = 3;
      bonus.wisdom = 2;
      bonus.constitution = -1;
    }
    // Thief/Assassin backgrounds
    else if (
      backgroundLower.includes('sát thủ') ||
      backgroundLower.includes('assassin') ||
      backgroundLower.includes('trộm') ||
      backgroundLower.includes('thief')
    ) {
      bonus.agility = 3;
      bonus.intelligence = 1;
      bonus.luck = 1;
      bonus.strength = -1;
    }
    // Noble/Diplomat backgrounds
    else if (
      backgroundLower.includes('quý tộc') ||
      backgroundLower.includes('noble') ||
      backgroundLower.includes('ngoại giao') ||
      backgroundLower.includes('diplomat')
    ) {
      bonus.charisma = 3;
      bonus.intelligence = 1;
      bonus.wisdom = 1;
      bonus.constitution = -1;
    }
    // Merchant/Trader backgrounds
    else if (
      backgroundLower.includes('thương gia') ||
      backgroundLower.includes('merchant') ||
      backgroundLower.includes('trader')
    ) {
      bonus.charisma = 2;
      bonus.intelligence = 1;
      bonus.luck = 2;
    }
    // Farmer/Commoner backgrounds
    else if (
      backgroundLower.includes('nông dân') ||
      backgroundLower.includes('farmer') ||
      backgroundLower.includes('thường dân') ||
      backgroundLower.includes('commoner')
    ) {
      bonus.constitution = 2;
      bonus.strength = 1;
      bonus.wisdom = 1;
    }

    return bonus;
  }

  /**
   * Get stat bonus based on world setting
   */
  private getWorldBonus(world: string): Record<string, number> {
    const worldLower = world.toLowerCase();
    const bonus: Record<string, number> = {};

    // Cultivation/Xianxia worlds
    if (
      worldLower.includes('tu tiên') ||
      worldLower.includes('xianxia') ||
      worldLower.includes('cultivation')
    ) {
      bonus.wisdom = 2;
      bonus.intelligence = 1;
      bonus.constitution = 1;
    }
    // Fantasy/Magic worlds
    else if (
      worldLower.includes('fantasy') ||
      worldLower.includes('magic') ||
      worldLower.includes('phép thuật')
    ) {
      bonus.intelligence = 2;
      bonus.wisdom = 1;
      bonus.luck = 1;
    }
    // Sci-fi/Futuristic worlds
    else if (
      worldLower.includes('sci-fi') ||
      worldLower.includes('tương lai') ||
      worldLower.includes('futuristic')
    ) {
      bonus.intelligence = 2;
      bonus.agility = 1;
      bonus.constitution = 1;
    }
    // Medieval/Historical worlds
    else if (
      worldLower.includes('medieval') ||
      worldLower.includes('lịch sử') ||
      worldLower.includes('historical')
    ) {
      bonus.strength = 1;
      bonus.constitution = 1;
      bonus.wisdom = 1;
    }

    return bonus;
  }

  /**
   * Calculate stats increase when leveling up
   */
  private calculateLevelUpStats(
    currentAttributes: CharacterAttributes,
    newLevel: number,
  ): CharacterAttributes {
    const levelDifference = newLevel - currentAttributes.level;

    if (levelDifference <= 0) {
      return currentAttributes;
    }

    // Random stat increases per level (1-3 points distributed)
    const updatedAttributes = { ...currentAttributes };

    for (let i = 0; i < levelDifference; i++) {
      // Random 1-3 stat points per level
      const pointsToDistribute = 1 + Math.floor(Math.random() * 3);

      for (let j = 0; j < pointsToDistribute; j++) {
        // Random stat to increase
        const stats = [
          'strength',
          'agility',
          'intelligence',
          'wisdom',
          'charisma',
          'constitution',
          'luck',
        ];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        (updatedAttributes as any)[randomStat] += 1;
      }
    }

    // Update level
    updatedAttributes.level = newLevel;

    // Recalculate HP, MP, Stamina based on new stats
    const healthMax = Math.floor(
      updatedAttributes.constitution * 8 + updatedAttributes.level * 12 + 50,
    );
    const manaMax = Math.floor(
      updatedAttributes.intelligence * 6 +
        updatedAttributes.wisdom * 4 +
        updatedAttributes.level * 8 +
        30,
    );
    const staminaMax = Math.floor(
      updatedAttributes.constitution * 4 +
        updatedAttributes.agility * 6 +
        updatedAttributes.level * 10 +
        40,
    );

    // Keep current values proportional to the increase
    const healthRatio =
      updatedAttributes.health.current / updatedAttributes.health.max;
    const manaRatio =
      (updatedAttributes.mana?.current || 0) /
      (updatedAttributes.mana?.max || 1);
    const staminaRatio =
      (updatedAttributes.stamina?.current || 0) /
      (updatedAttributes.stamina?.max || 1);

    updatedAttributes.health = {
      current: Math.floor(healthMax * healthRatio),
      max: healthMax,
    };

    updatedAttributes.mana = {
      current: Math.floor(manaMax * manaRatio),
      max: manaMax,
    };

    updatedAttributes.stamina = {
      current: Math.floor(staminaMax * staminaRatio),
      max: staminaMax,
    };

    // Calculate next level experience requirement
    updatedAttributes.nextLevelExp = Math.floor(
      100 * Math.pow(1.5, updatedAttributes.level - 1),
    );

    return updatedAttributes;
  }

  /**
   * Public method to level up character
   */
  public levelUpCharacter(
    currentAttributes: CharacterAttributes,
    newLevel: number,
  ): CharacterAttributes {
    return this.calculateLevelUpStats(currentAttributes, newLevel);
  }

  /**
   * Calculate dynamic HP/MP/Stamina based on current stats
   */
  public recalculateSecondaryStats(
    attributes: CharacterAttributes,
  ): CharacterAttributes {
    const healthMax = Math.floor(
      attributes.constitution * 8 + attributes.level * 12 + 50,
    );
    const manaMax = Math.floor(
      attributes.intelligence * 6 +
        attributes.wisdom * 4 +
        attributes.level * 8 +
        30,
    );
    const staminaMax = Math.floor(
      attributes.constitution * 4 +
        attributes.agility * 6 +
        attributes.level * 10 +
        40,
    );

    // Keep current values proportional if they exist
    const healthRatio = attributes.health.current / attributes.health.max;
    const manaRatio =
      (attributes.mana?.current || 0) / (attributes.mana?.max || 1);
    const staminaRatio =
      (attributes.stamina?.current || 0) / (attributes.stamina?.max || 1);

    return {
      ...attributes,
      health: {
        current: Math.floor(healthMax * healthRatio),
        max: healthMax,
      },
      mana: {
        current: Math.floor(manaMax * manaRatio),
        max: manaMax,
      },
      stamina: {
        current: Math.floor(staminaMax * staminaRatio),
        max: staminaMax,
      },
      nextLevelExp: Math.floor(100 * Math.pow(1.5, attributes.level - 1)),
    };
  }

  /**
   * Ensure proper stats structure with CharacterAttributes
   */
  private ensureProperStatsStructure(
    stats: any,
    background?: string,
    world?: string,
  ): any {
    // If stats already has proper attributes structure, return as is
    if (stats.attributes && typeof stats.attributes === 'object') {
      return stats;
    }

    // Generate attributes based on background and world if provided
    const defaultAttributes =
      background && world
        ? this.generateCharacterAttributes(background, world)
        : this.generateCharacterAttributes('thường dân', 'fantasy');

    // Try to extract any existing attributes from stats
    const extractedAttributes: CharacterAttributes = { ...defaultAttributes };

    // Map common stat names to attributes
    const statMapping: Record<string, keyof CharacterAttributes> = {
      'Sức Mạnh': 'strength',
      Strength: 'strength',
      'Nhanh Nhẹn': 'agility',
      Agility: 'agility',
      'Trí Tuệ': 'intelligence',
      Intelligence: 'intelligence',
      'Khôn Ngoan': 'wisdom',
      Wisdom: 'wisdom',
      'Quyến Rũ': 'charisma',
      Charisma: 'charisma',
      'Thể Chất': 'constitution',
      Constitution: 'constitution',
      'May Mắn': 'luck',
      Luck: 'luck',
      Level: 'level',
      Experience: 'experience',
      'Kinh Nghiệm': 'experience',
      Health: 'health',
      Máu: 'health',
      'Sinh Lực': 'health',
      Mana: 'mana',
      'Năng Lượng': 'mana',
      Stamina: 'stamina',
      'Thể Lực': 'stamina',
    };

    // Extract values from existing stats
    Object.entries(stats).forEach(([key, value]) => {
      const mappedKey = statMapping[key];
      if (mappedKey && value !== undefined) {
        if (
          mappedKey === 'health' ||
          mappedKey === 'mana' ||
          mappedKey === 'stamina'
        ) {
          // Handle health/mana/stamina format
          if (typeof value === 'string' && value.includes('/')) {
            const [current, max] = value.split('/').map(Number);
            (extractedAttributes as any)[mappedKey] = { current, max };
          } else if (typeof value === 'number') {
            (extractedAttributes as any)[mappedKey] = {
              current: value,
              max: value,
            };
          }
        } else {
          // Handle regular numeric attributes
          if (typeof value === 'number') {
            (extractedAttributes as any)[mappedKey] = value;
          } else if (typeof value === 'string') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
              (extractedAttributes as any)[mappedKey] = numValue;
            }
          }
        }
      }
    });

    // Check if level has increased and apply level up bonuses
    const currentLevel = extractedAttributes.level;
    const originalLevel = defaultAttributes.level;

    if (currentLevel > originalLevel) {
      const leveledUpAttributes = this.calculateLevelUpStats(
        extractedAttributes,
        currentLevel,
      );
      return {
        ...stats,
        attributes: leveledUpAttributes,
      };
    }

    // Return stats with proper attributes structure
    return {
      ...stats,
      attributes: extractedAttributes,
    };
  }

  private async buildInitialPrompt(
    gameSettings: GameSettingsDto,
  ): Promise<string> {
    try {
      // Import the enhanced world-building prompt
      const { buildEnhancedWorldPrompt } = await import(
        './prompts/enhanced-world-building.prompt'
      );
      return buildEnhancedWorldPrompt(gameSettings);
    } catch (error) {
      this.logger.error('Error building initial prompt:', error);
      throw new InternalServerErrorException('Failed to build game prompt');
    }
  }

  private parseAiResponse(response: string): ParsedGameContent {
    try {
      // Safety check for undefined or null response
      if (!response) {
        throw new Error('AI response is empty or undefined');
      }

      // Debug logging
      this.logger.log('=== AI Response Debug ===');
      this.logger.log(`Response length: ${response.length}`);
      this.logger.log(`Response preview: ${response.substring(0, 500)}...`);

      // Check for tags
      const hasStatsTag = response.includes('[STATS:');
      const hasInventoryTag =
        response.includes('[INVENTORY_ADD:') ||
        response.includes('[INVENTORY_INIT:');
      const hasSkillTag =
        response.includes('[SKILL:') || response.includes('[SKILLS:');
      const hasWorldStateTag = response.includes('[WORLD_STATE:');
      const hasEventTag = response.includes('[EVENT:');
      const hasNpcTag = response.includes('[NPC_UPDATE:');

      this.logger.log(
        `Tags found - STATS: ${hasStatsTag}, INVENTORY: ${hasInventoryTag}, SKILL: ${hasSkillTag}, WORLD: ${hasWorldStateTag}, EVENT: ${hasEventTag}, NPC: ${hasNpcTag}`,
      );

      // ========== EXTRACT CHOICES FIRST (before cleaning) ==========
      let choices: GameChoice[] = [];

      // Extract AI choices from JSON format first
      if (response.trim().startsWith('```json')) {
        try {
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.choices && Array.isArray(parsedJson.choices)) {
              choices = parsedJson.choices.map((choice: any) => ({
                text: choice.text || '',
                number: choice.number || 0,
                consequences: choice.consequences || [],
              }));
              this.logger.log(
                `Extracted ${choices.length} AI choices from JSON format`,
              );
            }
          }
        } catch (e) {
          this.logger.error('Error parsing JSON choices:', e);
          // Fallback to regex extraction if JSON parsing fails
          const jsonChoicesMatch = response.match(/"choices":\s*\[[\s\S]*?\]/);
          if (jsonChoicesMatch) {
            try {
              const choicesArrayMatch =
                jsonChoicesMatch[0].match(/\[[\s\S]*?\]/);
              if (choicesArrayMatch) {
                const parsedChoices = JSON.parse(choicesArrayMatch[0]);
                if (Array.isArray(parsedChoices)) {
                  choices = parsedChoices.map((choice: any) => ({
                    text: choice.text || '',
                    number: choice.number || 0,
                    consequences: choice.consequences || [],
                  }));
                  this.logger.log(
                    `Extracted ${choices.length} AI choices using regex fallback`,
                  );
                }
              }
            } catch (regexError) {
              this.logger.error(
                'Error parsing JSON choices with regex fallback:',
                regexError,
              );
            }
          }
        }
      } else {
        // For non-JSON format, try regex extraction
        const jsonChoicesMatch = response.match(/"choices":\s*\[[\s\S]*?\]/);
        if (jsonChoicesMatch) {
          try {
            const choicesArrayMatch = jsonChoicesMatch[0].match(/\[[\s\S]*?\]/);
            if (choicesArrayMatch) {
              const parsedChoices = JSON.parse(choicesArrayMatch[0]);
              if (Array.isArray(parsedChoices)) {
                choices = parsedChoices.map((choice: any) => ({
                  text: choice.text || '',
                  number: choice.number || 0,
                  consequences: choice.consequences || [],
                }));
                this.logger.log(
                  `Extracted ${choices.length} AI choices using regex`,
                );
              }
            }
          } catch (e) {
            this.logger.error('Error parsing JSON choices:', e);
          }
        }
      }

      // DEBUG: Log original response
      this.logger.debug('=== DEBUG ORIGINAL RESPONSE ===');
      this.logger.debug(`Response length: ${response.length}`);
      this.logger.debug(`Response preview: ${response.substring(0, 500)}...`);
      this.logger.debug('=== END ORIGINAL RESPONSE ===');

      // Extract story text - Check if response is JSON format first
      let storyText: string = response;

      // If response is JSON format, extract storyText field
      if (response.trim().startsWith('```json')) {
        try {
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.storyText) {
              storyText = parsedJson.storyText;
              this.logger.debug(
                'Successfully extracted storyText from JSON format',
              );
            }
          }
        } catch (e) {
          this.logger.warn(
            'Failed to parse JSON format response, falling back to text extraction',
          );
        }
      } else {
        // For non-JSON format, extract everything before the first tag
        const firstTagMatch = response.match(
          /\[(STATS|INVENTORY_ADD|INVENTORY_REMOVE|SKILL|LORE_NPC|LORE_ITEM|LORE_LOCATION|KARMA_SCORE|REPUTATION|WORLD_STATE|EVENT|NPC_UPDATE):/,
        );
        if (firstTagMatch && firstTagMatch.index !== undefined) {
          storyText = response.substring(0, firstTagMatch.index).trim();
        }
      }

      // DEBUG: Log after extracting story text
      this.logger.debug('=== DEBUG AFTER STORY TEXT EXTRACTION ===');
      this.logger.debug(`Story text length: ${storyText.length}`);
      this.logger.debug(
        `Story text preview: ${storyText.substring(0, 300)}...`,
      );
      this.logger.debug('=== END STORY TEXT EXTRACTION ===');

      // Clean ALL JSON metadata from story text với regex mạnh hơn
      storyText = storyText.replace(/"choices":\s*\[[\s\S]*?\]/g, '');
      storyText = storyText.replace(/"stats":\s*\{[\s\S]*?\}/g, '');
      storyText = storyText.replace(/"inventory":\s*\[[\s\S]*?\]/g, '');
      storyText = storyText.replace(/"skills":\s*\[[\s\S]*?\]/g, '');
      storyText = storyText.replace(/"lore":\s*\[[\s\S]*?\]/g, '');
      storyText = storyText.replace(/"mana":\s*\{[\s\S]*?\}/g, '');
      storyText = storyText.replace(/"stamina":\s*\{[\s\S]*?\}/g, '');
      storyText = storyText.replace(/"experience":\s*\d+/g, '');
      storyText = storyText.replace(/"level":\s*\d+/g, '');
      storyText = storyText.replace(/"nextLevelExp":\s*\d+/g, '');

      // Xóa các object JSON hoàn chỉnh
      storyText = storyText.replace(/\{[\s\S]*?"choices"[\s\S]*?\}/g, '');
      storyText = storyText.replace(/\{[\s\S]*?"stats"[\s\S]*?\}/g, '');
      storyText = storyText.replace(/\{[\s\S]*?"inventory"[\s\S]*?\}/g, '');
      storyText = storyText.replace(/\{[\s\S]*?"skills"[\s\S]*?\}/g, '');
      storyText = storyText.replace(/\{[\s\S]*?"lore"[\s\S]*?\}/g, '');
      storyText = storyText.replace(/\{[\s\S]*?"mana"[\s\S]*?\}/g, '');
      storyText = storyText.replace(/\{[\s\S]*?"stamina"[\s\S]*?\}/g, '');

      // Xóa các đoạn JSON còn sót lại - CHỈ XÓA CÁC PATTERN AN TOÀN
      storyText = storyText.replace(/```json[\s\S]*?```/g, '');
      storyText = storyText.replace(/```[\s\S]*?```/g, '');

      // Xóa các dòng JSON properties riêng lẻ
      storyText = storyText.replace(/^\s*"number":\s*\d+,?\s*$/gm, '');
      storyText = storyText.replace(/^\s*"text":\s*"[^"]*",?\s*$/gm, '');
      storyText = storyText.replace(
        /^\s*"consequences":\s*\[[\s\S]*?\],?\s*$/gm,
        '',
      );
      storyText = storyText.replace(/^\s*"current":\s*\d+,?\s*$/gm, '');
      storyText = storyText.replace(/^\s*"max":\s*\d+,?\s*$/gm, '');
      storyText = storyText.replace(/^\s*"experience":\s*\d+,?\s*$/gm, '');
      storyText = storyText.replace(/^\s*"level":\s*\d+,?\s*$/gm, '');
      storyText = storyText.replace(/^\s*"nextLevelExp":\s*\d+,?\s*$/gm, '');

      // Xóa những dòng JSON rời rạc (bắt đầu bằng dấu phẩy hoặc dấu ngoặc)
      storyText = storyText.replace(/^\s*[,\{\[\]\}]\s*$/gm, '');
      storyText = storyText.replace(/^\s*"[^"]*":\s*$/gm, '');
      storyText = storyText.replace(/^\s*},?\s*$/gm, '');
      storyText = storyText.replace(/^\s*\],?\s*$/gm, '');

      // Xóa dấu phẩy thừa và malformed JSON
      storyText = storyText.replace(/,\s*,/g, ',');
      storyText = storyText.replace(/,\s*}/g, '}');
      storyText = storyText.replace(/,\s*\]/g, ']');
      storyText = storyText.replace(/^\s*,|,\s*$/gm, '');

      // Xóa dòng trống thừa
      storyText = storyText.replace(/\n\s*\n\s*\n/g, '\n\n');

      storyText = storyText.trim();

      // DEBUG: Log after JSON cleanup
      this.logger.debug('=== DEBUG AFTER JSON CLEANUP ===');
      this.logger.debug(`Story text length: ${storyText.length}`);
      this.logger.debug(
        `Story text preview: ${storyText.substring(0, 300)}...`,
      );
      this.logger.debug('=== END JSON CLEANUP ===');

      // Phân tích nội dung thành các phân đoạn
      // We're not using storySegments directly, but we'll keep the parsing for future use
      this.parseContentSegments(storyText);

      // Extract stats - Try JSON format first
      let stats: Record<string, string | number> = {};

      // If response is JSON format, extract stats from the full JSON
      if (response.trim().startsWith('```json')) {
        try {
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.stats && typeof parsedJson.stats === 'object') {
              stats = parsedJson.stats;
              this.logger.log(
                `Extracted stats from full JSON: ${Object.keys(stats).length} properties`,
              );
            }
          }
        } catch (e) {
          this.logger.warn(
            'Failed to parse full JSON for stats, falling back to regex extraction',
          );
        }
      }

      // Fallback to regex extraction if full JSON parsing failed
      if (Object.keys(stats).length === 0) {
        const jsonStatsMatch = response.match(/"stats":\s*\{[\s\S]*?\}/);
        if (jsonStatsMatch) {
          try {
            const statsObjectMatch = jsonStatsMatch[0].match(/\{[\s\S]*?\}/);
            if (statsObjectMatch) {
              const parsedStats = JSON.parse(statsObjectMatch[0]);
              stats = parsedStats;
              this.logger.log(
                `Extracted stats from regex: ${Object.keys(stats).length} properties`,
              );
            }
          } catch (e) {
            this.logger.error('Error parsing JSON stats:', e);
          }
        }
      }

      // Fallback to tag format if JSON parsing failed
      if (Object.keys(stats).length === 0) {
        const statsMatches = [...response.matchAll(/\[STATS:\s*(.*?)\]/g)];
        if (statsMatches.length > 0) {
          const statsString = statsMatches[0][1];
          // Parse key-value pairs from format like: Tu Vi="Luyện Khí tầng ba", Chân Khí=500/500
          const keyValuePairs = statsString
            .split(',')
            .map((pair) => pair.trim());
          keyValuePairs.forEach((pair) => {
            if (!pair.includes('=')) {
              console.warn(`Invalid stats pair format: ${pair}`);
              return; // Skip this pair
            }

            const [key, ...valueParts] = pair
              .split('=')
              .map((item) => item.trim());
            // Join value parts in case the value itself contains '=' characters
            const value = valueParts.join('=');

            if (!key || value === undefined) {
              console.warn(`Invalid key-value pair: ${pair}`);
              return; // Skip this pair
            }

            // Remove quotes if they exist
            const cleanValue =
              value &&
              typeof value === 'string' &&
              value.startsWith('"') &&
              value.endsWith('"')
                ? value.substring(1, value.length - 1)
                : value;

            stats[key] = cleanValue;
          });
        }
      }

      // Extract inventory items - Try JSON format first
      let inventory: InventoryItem[] = [];

      // If response is JSON format, extract inventory from the full JSON
      if (response.trim().startsWith('```json')) {
        try {
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.inventory && Array.isArray(parsedJson.inventory)) {
              inventory = parsedJson.inventory.map((item: any) => ({
                name: item.name || item,
                description: item.description || '',
                quantity: item.quantity || 1,
              }));
              this.logger.log(
                `Extracted ${inventory.length} items from JSON inventory`,
              );
            }
          }
        } catch (e) {
          this.logger.warn(
            'Failed to parse full JSON for inventory, falling back to regex extraction',
          );
        }
      }

      // Fallback to regex extraction if full JSON parsing failed
      if (inventory.length === 0) {
        const jsonInventoryMatch = response.match(
          /"inventory":\s*\[[\s\S]*?\]/,
        );
        if (jsonInventoryMatch) {
          try {
            const inventoryArrayMatch =
              jsonInventoryMatch[0].match(/\[[\s\S]*?\]/);
            if (inventoryArrayMatch) {
              const parsedInventory = JSON.parse(inventoryArrayMatch[0]);
              if (Array.isArray(parsedInventory)) {
                inventory = parsedInventory.map((item: any) => ({
                  name: item.name || item,
                  description: item.description || '',
                  quantity: item.quantity || 1,
                }));
                this.logger.log(
                  `Extracted ${inventory.length} items from JSON inventory using regex`,
                );
              }
            }
          } catch (e) {
            this.logger.error('Error parsing JSON inventory:', e);
          }
        }
      }

      // Fallback to tag format if JSON parsing failed
      if (inventory.length === 0) {
        const inventoryAddMatches = [
          ...response.matchAll(/\[INVENTORY_ADD:\s*(.*?)\]/g),
        ];

        this.logger.log(
          `Found ${inventoryAddMatches.length} INVENTORY_ADD matches`,
        );

        inventoryAddMatches.forEach((match) => {
          const itemString = match[1];

          // Parse name, description, etc
          if (itemString) {
            const nameMatch = itemString.match(/Name="([^"]+)"/);
            const descMatch = itemString.match(/Description="([^"]+)"/);
            const quantityMatch = itemString.match(/Quantity=(\d+)/);

            const name = nameMatch?.[1] || '';
            const description = descMatch?.[1] || '';
            const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

            if (name) {
              const itemProps: InventoryItem = {
                name,
                description,
                quantity,
              };
              inventory.push(itemProps);
            }
          }
        });

        // If there are no INVENTORY_ADD tags, try looking for INVENTORY_INIT
        if (inventory.length === 0) {
          const inventoryInitMatch = response.match(
            /\[INVENTORY_INIT:\s*({[\s\S]*?})\]/,
          );
          if (inventoryInitMatch) {
            try {
              const initInventory = JSON.parse(inventoryInitMatch[1]);
              if (initInventory.items && Array.isArray(initInventory.items)) {
                const items = initInventory.items as Array<{
                  name?: string;
                  description?: string;
                  quantity?: number;
                }>;

                items.forEach((item) => {
                  if (item.name) {
                    const inventoryItem: InventoryItem = {
                      name: item.name,
                      description: item.description || '',
                      quantity: item.quantity || 1,
                    };
                    inventory.push(inventoryItem);
                  }
                });
              }
            } catch (e) {
              this.logger.error('Error parsing INVENTORY_INIT:', e);
            }
          }
        }
      } // End of inventory fallback parsing

      // Extract skills - Try JSON format first
      let skills: CharacterSkill[] = [];

      // If response is JSON format, extract skills from the full JSON
      if (response.trim().startsWith('```json')) {
        try {
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.skills && Array.isArray(parsedJson.skills)) {
              skills = parsedJson.skills.map((skill: any) => ({
                name: skill.name || skill,
                description: skill.description || '',
                level: skill.level || 1,
                thanhThuc: skill.thanhThuc || skill.mastery || '',
              }));
              this.logger.log(
                `Extracted ${skills.length} skills from JSON format`,
              );
            }
          }
        } catch (e) {
          this.logger.warn(
            'Failed to parse full JSON for skills, falling back to regex extraction',
          );
        }
      }

      // Fallback to regex extraction if full JSON parsing failed
      if (skills.length === 0) {
        const jsonSkillsMatch = response.match(/"skills":\s*\[[\s\S]*?\]/);
        if (jsonSkillsMatch) {
          try {
            const skillsArrayMatch = jsonSkillsMatch[0].match(/\[[\s\S]*?\]/);
            if (skillsArrayMatch) {
              const parsedSkills = JSON.parse(skillsArrayMatch[0]);
              if (Array.isArray(parsedSkills)) {
                skills = parsedSkills.map((skill: any) => ({
                  name: skill.name || skill,
                  description: skill.description || '',
                  level: skill.level || 1,
                  thanhThuc: skill.thanhThuc || skill.mastery || '',
                }));
                this.logger.log(
                  `Extracted ${skills.length} skills from JSON format using regex`,
                );
              }
            }
          } catch (e) {
            this.logger.error('Error parsing JSON skills:', e);
          }
        }
      }

      // Fallback to tag format if JSON parsing failed
      if (skills.length === 0) {
        const skillMatches = [...response.matchAll(/\[SKILL:\s*(.*?)\]/g)];

        this.logger.log(`Found ${skillMatches.length} SKILL matches`);

        skillMatches.forEach((match) => {
          const skillString = match[1];

          // Parse name, level, description, etc
          const nameMatch = skillString.match(/Name="([^"]+)"/);
          const descMatch = skillString.match(/Description="([^"]+)"/);
          const levelMatch = skillString.match(/Level=(\d+)/);
          const thanhThucMatch = skillString.match(/ThanhThuc="([^"]+)"/);

          const name = nameMatch?.[1];
          if (name) {
            const skillProps: CharacterSkill = {
              name,
              description: descMatch?.[1] || '',
              ...(levelMatch && { level: parseInt(levelMatch[1]) }),
              ...(thanhThucMatch && { mastery: thanhThucMatch[1] }),
            };
            skills.push(skillProps);
          }
        });

        // If there are no SKILL tags, try looking for SKILLS
        if (skills.length === 0) {
          const skillsMatch = response.match(/\[SKILLS:\s*({[\s\S]*?})\]/);
          if (skillsMatch) {
            try {
              const parsedSkills = JSON.parse(skillsMatch[1]);
              if (
                parsedSkills.abilities &&
                Array.isArray(parsedSkills.abilities)
              ) {
                const abilities = parsedSkills.abilities as Array<{
                  name?: string;
                  description?: string;
                  level?: number;
                  mastery?: number;
                }>;

                abilities.forEach((ability) => {
                  if (ability.name) {
                    const skill: CharacterSkill = {
                      name: ability.name,
                      description: ability.description || '',
                      ...(ability.level !== undefined && {
                        level: ability.level,
                      }),
                      ...(ability.mastery !== undefined && {
                        mastery: ability.mastery.toString(),
                      }),
                    };
                    skills.push(skill);
                  }
                });
              }
            } catch (e) {
              this.logger.error('Error parsing SKILLS:', e);
            }
          }
        }
      } // End of skills fallback parsing

      // Extract karma score changes
      let karmaChange: number = 0;
      let karmaReason: string = '';
      const karmaMatches = [
        ...response.matchAll(
          /\[KARMA_SCORE:\s*([+-]?\d+)(?:,\s*"([^"]+)")?\]/g,
        ),
      ];
      if (karmaMatches.length > 0) {
        karmaChange = parseInt(karmaMatches[0][1]) || 0;
        karmaReason = karmaMatches[0][2] || '';
      }

      // Extract reputation changes
      const reputationChanges: Record<string, number> = {};
      const reputationMatches = [
        ...response.matchAll(/\[REPUTATION:\s*([^\]]+)\]/g),
      ];
      if (reputationMatches.length > 0) {
        const reputationString = reputationMatches[0][1];
        // Parse format like: Dân_thường=+1, Thương_gia=-2
        const repPairs = reputationString.split(',').map((pair) => pair.trim());
        repPairs.forEach((pair) => {
          const [key, value] = pair.split('=').map((item) => item.trim());
          if (key && value) {
            const numValue =
              parseInt(value.replace(/[+-]/, '')) *
              (value.startsWith('-') ? -1 : 1);
            if (!isNaN(numValue)) {
              reputationChanges[key] = numValue;
            }
          }
        });
      }

      // Extract lore - Try JSON format first
      let lore: LoreFragment[] = [];

      // If response is JSON format, extract lore from the full JSON
      if (response.trim().startsWith('```json')) {
        try {
          const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1];
            const parsedJson = JSON.parse(jsonStr);
            if (parsedJson.lore && Array.isArray(parsedJson.lore)) {
              lore = parsedJson.lore.map((loreItem: any, index: number) => ({
                id: `lore_${Date.now()}_${index}`,
                title:
                  loreItem.title || loreItem.name || `Lore Entry ${index + 1}`,
                content: loreItem.content || loreItem.description || loreItem,
                type: loreItem.type || 'world',
                category: loreItem.category || 'world',
                importance: loreItem.importance || 'medium',
                timestamp: new Date(),
              }));
              this.logger.log(
                `Extracted ${lore.length} lore entries from JSON format`,
              );
            }
          }
        } catch (e) {
          this.logger.warn(
            'Failed to parse full JSON for lore, falling back to regex extraction',
          );
        }
      }

      // Fallback to regex extraction if full JSON parsing failed
      if (lore.length === 0) {
        const jsonLoreMatch = response.match(/"lore":\s*\[[\s\S]*?\]/);
        if (jsonLoreMatch) {
          try {
            const loreArrayMatch = jsonLoreMatch[0].match(/\[[\s\S]*?\]/);
            if (loreArrayMatch) {
              const parsedLore = JSON.parse(loreArrayMatch[0]);
              if (Array.isArray(parsedLore)) {
                lore = parsedLore.map((loreItem: any, index: number) => ({
                  id: `lore_${Date.now()}_${index}`,
                  title:
                    loreItem.title ||
                    loreItem.name ||
                    `Lore Entry ${index + 1}`,
                  content: loreItem.content || loreItem.description || loreItem,
                  type: loreItem.type || 'world',
                  category: loreItem.category || 'world',
                  importance: loreItem.importance || 'medium',
                  timestamp: new Date(),
                }));
                this.logger.log(
                  `Extracted ${lore.length} lore entries from JSON format using regex`,
                );
              }
            }
          } catch (e) {
            this.logger.error('Error parsing JSON lore:', e);
          }
        }
      }

      // Fallback to tag format if JSON parsing failed
      if (lore.length === 0) {
        const loreNpcMatches = [...response.matchAll(/\[LORE_NPC:\s*(.*?)\]/g)];
        const loreItemMatches = [
          ...response.matchAll(/\[LORE_ITEM:\s*(.*?)\]/g),
        ];
        const loreLocationMatches = [
          ...response.matchAll(/\[LORE_LOCATION:\s*(.*?)\]/g),
        ];

        const processLoreMatch = (
          match: RegExpMatchArray,
          category: 'npc' | 'item' | 'location' | 'event' | 'world',
        ): void => {
          const loreString = match[1];
          const nameMatch = loreString.match(/Name="([^"]+)"/);
          const descMatch = loreString.match(/Description="([^"]+)"/);
          const titleMatch = loreString.match(/Title="([^"]+)"/);
          const contentMatch = loreString.match(/Content="([^"]+)"/);

          const title = titleMatch?.[1] || nameMatch?.[1] || 'Unknown';
          const content =
            contentMatch?.[1] || descMatch?.[1] || 'No description';

          const loreFragment: LoreFragment = {
            id: `lore_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
            title,
            content,
            type: category,
            category,
            importance: 'medium',
            timestamp: new Date(),
          };

          lore.push(loreFragment);
        };

        loreNpcMatches.forEach((match) => processLoreMatch(match, 'npc'));
        loreItemMatches.forEach((match) => processLoreMatch(match, 'item'));
        loreLocationMatches.forEach((match) =>
          processLoreMatch(match, 'location'),
        );

        // If there are no LORE_X tags, try looking for LORE
        if (lore.length === 0) {
          const loreMatch = response.match(/\[LORE:\s*({[\s\S]*?})\]/);
          if (loreMatch) {
            try {
              const parsedLore = JSON.parse(loreMatch[1]);
              if (parsedLore.fragments && Array.isArray(parsedLore.fragments)) {
                const fragments = parsedLore.fragments as Array<{
                  title?: string;
                  content?: string;
                  category?: string;
                }>;

                fragments.forEach((fragment) => {
                  const loreFragment: LoreFragment = {
                    id: `lore_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Generate a unique ID
                    title: fragment.title || 'Unknown',
                    content: fragment.content || 'No description',
                    type: fragment.category || 'world',
                    category:
                      (fragment.category as LoreFragment['category']) ||
                      'world',
                    importance: 'medium',
                    timestamp: new Date(),
                  };
                  lore.push(loreFragment);
                });
              }
            } catch (e) {
              this.logger.error('Error parsing LORE:', e);
            }
          }
        }
      } // End of lore fallback parsing

      // Extract choices - improved logic to handle various formats
      // Fallback: Try other methods if JSON parsing failed
      if (choices.length === 0) {
        // Method 1: Look for numbered choices at the end of the response
        const choiceLines: string[] = [];
        const lines = response.split('\n');
        let foundChoicesSection = false;

        // Start from the end and work backwards
        for (let i: number = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (/^\d+\.\s+/.test(line)) {
            choiceLines.unshift(line);
            foundChoicesSection = true;
          } else if (foundChoicesSection && line === '') {
            // Empty line after choices is OK
            continue;
          } else if (foundChoicesSection) {
            // Non-choice line found, stop looking
            break;
          }
        }

        if (choiceLines.length >= 2) {
          choices = choiceLines.map((line, index) => {
            const choiceText = line.replace(/^\d+\.\s*/, '').trim();
            const number = index + 1;
            return { text: choiceText, number };
          });

          // Clean up story text by removing the numbered choices
          choiceLines.forEach((line) => {
            storyText = storyText.replace(line, '');
          });
          storyText = storyText.trim();
        } else {
          // Method 2: Try the CHOICES tag format
          const choicesMatch = response.match(/\[CHOICES:\s*({[\s\S]*?})\]/);
          if (choicesMatch) {
            try {
              const parsedChoices = JSON.parse(choicesMatch[1]);
              if (
                parsedChoices.options &&
                Array.isArray(parsedChoices.options)
              ) {
                choices = parsedChoices.options.map(
                  (
                    option: string | { text: string; number?: number },
                    index: number,
                  ) => ({
                    text: typeof option === 'string' ? option : option.text,
                    number:
                      typeof option === 'string'
                        ? index + 1
                        : option.number || index + 1,
                  }),
                );
              }
            } catch (e) {
              this.logger.error('Error parsing CHOICES tag:', e);
            }
          }
        }
      }

      // Always provide generic support choices (separate from AI choices)
      const genericChoices = [
        { text: 'Tiếp tục quan sát tình hình', number: 1 },
        { text: 'Hành động ngay lập tức', number: 2 },
        { text: 'Tìm cách khác để giải quyết', number: 3 },
        { text: 'Tương tác với người xung quanh', number: 4 },
        { text: 'Nghỉ ngơi và suy nghĩ', number: 5 },
      ];

      // Log if no AI choices found, but don't merge with generic choices
      if (choices.length === 0) {
        this.logger.warn(
          'No choices found in AI response, generic choices will be available separately',
        );
      }

      // Extract world state changes
      const worldStateMatches = [
        ...response.matchAll(/\[WORLD_STATE:\s*(.*?)\]/gs),
      ];
      let worldStateChanges: Partial<WorldState> | undefined;

      if (worldStateMatches.length > 0) {
        try {
          const worldStateString = worldStateMatches[0][1];
          // Parse JSON format
          if (worldStateString.trim().startsWith('{')) {
            worldStateChanges = JSON.parse(worldStateString);
          } else {
            // Parse key-value format
            worldStateChanges = {
              environment: {
                weather: 'clear',
                temperature: 20,
                conditions: ['normal'],
              },
              society: {
                politicalState: 'stable',
                economicState: 'normal',
              },
            };

            const keyValuePairs = worldStateString
              .split(',')
              .map((pair) => pair.trim());
            keyValuePairs.forEach((pair) => {
              if (pair.includes('=')) {
                const [key, value] = pair.split('=').map((s) => s.trim());
                if (
                  key.startsWith('weather') ||
                  key.startsWith('temperature') ||
                  key.includes('environment')
                ) {
                  // Handle environment properties safely
                  if (key === 'weather') {
                    worldStateChanges!.environment!.weather = value.replace(
                      /"/g,
                      '',
                    );
                  } else if (key === 'temperature') {
                    worldStateChanges!.environment!.temperature =
                      Number(value.replace(/"/g, '')) || 20;
                  } else if (key === 'conditions') {
                    try {
                      const conditions = JSON.parse(value.replace(/'/g, '"'));
                      worldStateChanges!.environment!.conditions =
                        Array.isArray(conditions) ? conditions : ['normal'];
                    } catch (e) {
                      worldStateChanges!.environment!.conditions = [
                        value.replace(/"/g, ''),
                      ];
                    }
                  } else if (key === 'specialEffects') {
                    try {
                      const effects = JSON.parse(value.replace(/'/g, '"'));
                      worldStateChanges!.environment!.specialEffects =
                        Array.isArray(effects)
                          ? effects
                          : [value.replace(/"/g, '')];
                    } catch (e) {
                      worldStateChanges!.environment!.specialEffects = [
                        value.replace(/"/g, ''),
                      ];
                    }
                  }
                } else {
                  // Handle society properties safely
                  if (key === 'politicalState') {
                    worldStateChanges!.society!.politicalState = value.replace(
                      /"/g,
                      '',
                    );
                  } else if (key === 'economicState') {
                    worldStateChanges!.society!.economicState = value.replace(
                      /"/g,
                      '',
                    );
                  } else if (key === 'dominantFaction') {
                    worldStateChanges!.society!.dominantFaction = value.replace(
                      /"/g,
                      '',
                    );
                  } else if (key === 'tensions') {
                    try {
                      worldStateChanges!.society!.tensions = JSON.parse(
                        value.replace(/'/g, '"'),
                      );
                    } catch (e) {
                      this.logger.error('Error parsing tensions:', e);
                    }
                  } else if (key === 'events') {
                    try {
                      const events = JSON.parse(value.replace(/'/g, '"'));
                      worldStateChanges!.society!.events = Array.isArray(events)
                        ? events
                        : [value.replace(/"/g, '')];
                    } catch (e) {
                      worldStateChanges!.society!.events = [
                        value.replace(/"/g, ''),
                      ];
                    }
                  }
                }
              }
            });
          }
        } catch (e) {
          this.logger.error('Error parsing world state:', e);
        }
      }

      // Extract triggered events
      const eventMatches = [...response.matchAll(/\[EVENT:\s*(.*?)\]/gs)];
      const triggeredEvents: Array<{
        id: string;
        name: string;
        description: string;
        type: string;
        probability?: number;
      }> = [];

      eventMatches.forEach((match) => {
        try {
          const eventString = match[1];
          // Try to parse as JSON
          if (eventString.trim().startsWith('{')) {
            const eventObj = JSON.parse(eventString);
            triggeredEvents.push(eventObj);
          } else {
            // Parse from key-value format
            const eventParts = eventString
              .split(',')
              .map((part) => part.trim());
            const event: any = {
              id: `event_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              type: 'generic',
            };

            eventParts.forEach((part) => {
              if (part.includes(':')) {
                const [key, value] = part.split(':').map((s) => s.trim());
                event[key.toLowerCase()] = value.replace(/"/g, '');
              } else if (part.includes('=')) {
                const [key, value] = part.split('=').map((s) => s.trim());
                event[key.toLowerCase()] = value.replace(/"/g, '');
              }
            });

            if (event.name && event.description) {
              triggeredEvents.push(event);
            }
          }
        } catch (e) {
          this.logger.error('Error parsing event:', e);
        }
      });

      // Extract NPC updates
      const npcUpdateMatches = [
        ...response.matchAll(/\[NPC_UPDATE:\s*(.*?)\]/gs),
      ];
      const npcUpdates: Array<{
        npcId: string;
        npcName: string;
        changes: Record<string, unknown>;
        newDialogue?: string[];
        newBehavior?: string;
        locationChange?: string;
      }> = [];

      npcUpdateMatches.forEach((match) => {
        try {
          const npcString = match[1];
          // Try to parse as JSON
          if (npcString.trim().startsWith('{')) {
            const npcObj = JSON.parse(npcString);
            npcUpdates.push(npcObj);
          } else {
            // Parse from key-value format
            const npcParts = npcString.split(',').map((part) => part.trim());
            const npc: any = {
              npcId: `npc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              changes: {},
            };

            npcParts.forEach((part) => {
              if (part.includes(':')) {
                const [key, value] = part.split(':').map((s) => s.trim());
                if (key.toLowerCase() === 'name') {
                  npc.npcName = value.replace(/"/g, '');
                } else if (key.toLowerCase() === 'dialogue') {
                  npc.newDialogue = [value.replace(/"/g, '')];
                } else if (key.toLowerCase() === 'behavior') {
                  npc.newBehavior = value.replace(/"/g, '');
                } else if (key.toLowerCase() === 'location') {
                  npc.locationChange = value.replace(/"/g, '');
                } else {
                  npc.changes[key.toLowerCase()] = value.replace(/"/g, '');
                }
              }
            });

            if (npc.npcName) {
              npcUpdates.push(npc);
            }
          }
        } catch (e) {
          this.logger.error('Error parsing NPC update:', e);
        }
      });

      // DEBUG: Log để kiểm tra storyText
      this.logger.debug('=== DEBUG STORY TEXT ===');
      this.logger.debug(`Story text length: ${storyText.length}`);
      this.logger.debug(
        `Story text preview: ${storyText.substring(0, 300)}...`,
      );
      this.logger.debug(`AI choices count: ${choices.length}`);
      this.logger.debug(`Generic choices count: ${genericChoices.length}`);
      if (choices.length > 0) {
        this.logger.debug(`First AI choice: ${JSON.stringify(choices[0])}`);
      }
      this.logger.debug('=== END DEBUG ===');

      // Phân tích nội dung thành các phân đoạn
      const parsedStorySegments = this.parseContentSegments(storyText);

      return {
        storyText,
        storySegments: parsedStorySegments,
        stats,
        inventory,
        skills,
        lore,
        choices,
        genericChoices,
        karmaChange,
        karmaReason,
        reputationChanges,
        worldStateChanges,
        triggeredEvents,
        npcUpdates,
      };
    } catch (error) {
      const logger = new Logger('GamesService');
      logger.error('Error parsing AI response:', error);
      throw new BadRequestException(
        'Failed to parse AI response: ' +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  /**
   * Parse story text into structured content segments
   */
  private parseContentSegments(text: string): ContentSegment[] {
    const segments: ContentSegment[] = [];

    // Nếu không có nội dung, trả về mảng rỗng
    if (!text || text.trim() === '') {
      return segments;
    }

    // Phân tích các đoạn văn
    const paragraphs = text.split(/\n\n+/);

    paragraphs.forEach((paragraph) => {
      const trimmedParagraph = paragraph.trim();
      if (trimmedParagraph === '') return;

      // Kiểm tra xem đây có phải là đối thoại không
      const dialogueMatch = trimmedParagraph.match(
        /^([A-Za-z\u00C0-\u1EF9 ]+):\s*["'](.+)["']$/,
      );
      if (dialogueMatch) {
        segments.push({
          type: 'dialogue',
          speaker: dialogueMatch[1].trim(),
          content: dialogueMatch[2].trim(),
        });
        return;
      }

      // Kiểm tra xem đây có phải là độc thoại không
      if (trimmedParagraph.startsWith('*') && trimmedParagraph.endsWith('*')) {
        segments.push({
          type: 'monologue',
          content: trimmedParagraph.slice(1, -1).trim(),
        });
        return;
      }

      // Kiểm tra xem đây có phải là hành động không
      if (trimmedParagraph.startsWith('[') && trimmedParagraph.endsWith(']')) {
        segments.push({
          type: 'action',
          content: trimmedParagraph.slice(1, -1).trim(),
        });
        return;
      }

      // Kiểm tra xem đây có phải là thông báo hệ thống không
      if (
        trimmedParagraph.includes('✨') ||
        trimmedParagraph.includes('📊') ||
        trimmedParagraph.includes('🎯') ||
        trimmedParagraph.includes('⚙️')
      ) {
        segments.push({
          type: 'system',
          content: trimmedParagraph,
        });
        return;
      }

      // Mặc định là mô tả
      segments.push({
        type: 'description',
        content: trimmedParagraph,
      });
    });

    return segments;
  }

  /**
   * Check if character is dead based on health stats
   */
  private checkIfCharacterIsDead(stats: GameStats): boolean {
    // Check various health stat names
    const healthKeys = ['Health', 'Máu', 'Sinh Lực', 'HP', 'Sức Khỏe'];

    for (const key of healthKeys) {
      if (stats[key]) {
        const healthValue = String(stats[key]);

        // Handle formats like "0/100", "0", "0/50"
        if (healthValue.includes('/')) {
          const currentHealth = parseInt(healthValue.split('/')[0]);
          return currentHealth <= 0;
        } else {
          const currentHealth = parseInt(healthValue);
          return currentHealth <= 0;
        }
      }
    }

    return false; // No health stat found, assume alive
  }

  /**
   * Check if character has resurrection items or skills
   */
  private checkForResurrectionItems(
    inventory: InventoryItem[],
    skills: Skill[],
  ): boolean {
    // Check inventory for resurrection items
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

    const hasResurrectionItem = inventory.some(
      (item) =>
        resurrectionItemNames.some((name) =>
          item.name.toLowerCase().includes(name.toLowerCase()),
        ) && item.quantity > 0,
    );

    // Check skills for resurrection abilities - enhanced for regression skills
    const hasResurrectionSkill = skills.some((skill) => {
      const skillName = skill.name.toLowerCase();
      const skillDesc = skill.description?.toLowerCase() || '';

      // Check traditional resurrection names
      const hasTraditionalResurrection = resurrectionItemNames.some(
        (name) =>
          skillName.includes(name.toLowerCase()) ||
          skillDesc.includes(name.toLowerCase()),
      );

      // Check specific regression/time travel abilities
      const hasRegressionAbility =
        skillName.includes('hồi quy') ||
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

    this.logger.log(
      `Checking resurrection abilities - Items: ${hasResurrectionItem}, Skills: ${hasResurrectionSkill}`,
    );
    if (hasResurrectionSkill) {
      const resurrectionSkills = skills.filter((skill) => {
        const skillName = skill.name.toLowerCase();
        const skillDesc = skill.description?.toLowerCase() || '';
        return (
          skillName.includes('hồi quy') ||
          skillName.includes('bản thể') ||
          skillDesc.includes('quay trở về') ||
          skillDesc.includes('sau khi chết')
        );
      });
      this.logger.log(
        `Found resurrection skills: ${resurrectionSkills.map((s) => s.name).join(', ')}`,
      );
    }

    return hasResurrectionItem || hasResurrectionSkill;
  }

  /**
   * Extract death cause from story text
   */
  private extractDeathCause(storyText: string): string {
    // Simple extraction - take last sentence or paragraph
    const sentences = storyText
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    return sentences[sentences.length - 1]?.trim() || 'Nguyên nhân không rõ';
  }

  /**
   * Handle resurrection with penalties
   */
  private handleResurrection(game: Game): void {
    // Restore health but apply penalties
    const healthKeys = ['Health', 'Máu', 'Sinh Lực', 'HP', 'Sức Khỏe'];

    for (const key of healthKeys) {
      if (game.characterStats[key]) {
        const healthValue = String(game.characterStats[key]);
        if (healthValue.includes('/')) {
          const maxHealth = parseInt(healthValue.split('/')[1]);
          // Restore to 50% health as penalty
          game.characterStats[key] =
            `${Math.floor(maxHealth * 0.5)}/${maxHealth}`;
        } else {
          // If no max health, set to 50
          game.characterStats[key] = '50';
        }
        break;
      }
    }

    // Apply stat penalties (reduce by 10-20%)
    Object.keys(game.characterStats).forEach((key) => {
      if (
        key !== 'Health' &&
        key !== 'Máu' &&
        key !== 'Sinh Lực' &&
        key !== 'HP' &&
        key !== 'Sức Khỏe'
      ) {
        const value = game.characterStats[key];
        if (typeof value === 'number') {
          game.characterStats[key] = Math.floor(value * 0.9); // 10% penalty
        } else if (typeof value === 'string' && !isNaN(Number(value))) {
          game.characterStats[key] = Math.floor(Number(value) * 0.9);
        }
      }
    });

    // Remove resurrection item if used
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
      if (
        resurrectionItemNames.some((name) =>
          item.name.toLowerCase().includes(name.toLowerCase()),
        ) &&
        item.quantity > 0
      ) {
        item.quantity -= 1;
      }
    });

    // Remove items with 0 quantity
    game.inventoryItems = game.inventoryItems.filter(
      (item) => item.quantity > 0,
    );
  }

  /**
   * Generate character life summary
   */
  async generateLifeSummary(gameId: string): Promise<LifeSummary> {
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Calculate play time
    const playTime = new Date().getTime() - new Date(game.createdAt).getTime();
    const playDays = Math.floor(playTime / (1000 * 60 * 60 * 24));
    // const playHours = Math.floor(
    //   (playTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    // );

    // Extract NPCs met from lore fragments
    // const npcsMet = (game.loreFragments || [])
    //   .filter((lore) => lore.type === 'npc')
    //   .map((npc) => ({ name: npc.name, description: npc.description }));

    // Extract important events from story history
    const importantEvents = (game.storyHistory || [])
      .filter((story) => story.type === 'story')
      .slice(0, 10) // First 10 major events
      .map((event) => ({
        description: event.content.substring(0, 100) + '...',
        timestamp: event.timestamp,
      }));

    return {
      totalDays: playDays,
      finalStats: this.convertGameStats(game.characterStats) || {},
      majorEvents: importantEvents.map((event) => event.description),
      achievements: (game.achievements || []).map((achievement) =>
        typeof achievement === 'string'
          ? achievement
          : achievement.name ||
            achievement.description ||
            'Unknown Achievement',
      ),
      karmaScore: game.karmaScore || 0,
      reputation: game.reputation || {},
      deathCause: game.deathCause,
      legacy: game.deathCause || 'A life well lived',
    };
  }

  /**
   * Resurrect character with penalties
   */
  async resurrectCharacter(gameId: string, userId: string): Promise<Game> {
    const game = await this.gamesRepository.findOne({
      where: { id: gameId, userId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.active) {
      throw new BadRequestException('Character is not dead');
    }

    // Check if character has resurrection items/skills
    const hasResurrectionItem = this.checkForResurrectionItems(
      this.convertInventoryItems(game.inventoryItems),
      game.characterSkills,
    );

    if (!hasResurrectionItem) {
      throw new BadRequestException(
        'No resurrection items or skills available',
      );
    }

    // Find and consume resurrection/regression skill
    const resurrectionSkill = game.characterSkills.find((skill) => {
      const skillName = skill.name.toLowerCase();
      const skillDesc = skill.description?.toLowerCase() || '';

      // Check for various resurrection/regression abilities
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

      const hasResurrectionKeyword = resurrectionKeywords.some(
        (keyword) => skillName.includes(keyword) || skillDesc.includes(keyword),
      );

      const hasResurrectionDescription =
        skillDesc.includes('quay trở về') ||
        skillDesc.includes('sau khi chết') ||
        skillDesc.includes('thời điểm trong quá khứ') ||
        skillDesc.includes('số lần sử dụng') ||
        skillDesc.includes('khi nhân vật chết') ||
        skillDesc.includes('tránh cái chết') ||
        skillDesc.includes('hồi phục sau khi chết');

      return hasResurrectionKeyword || hasResurrectionDescription;
    });

    let resurrectionMessage: string = '';
    let skillType: string = 'hồi sinh';

    if (resurrectionSkill) {
      const skillName = resurrectionSkill.name.toLowerCase();

      // Determine skill type for appropriate message
      if (skillName.includes('hồi quy') || skillName.includes('bản thể')) {
        skillType = 'hồi quy';
        resurrectionMessage =
          '🔄 **HỒI QUY THÀNH CÔNG!**\n\nBạn đã quay trở về thời điểm trước khi chết. Ký ức về cái chết vẫn còn rõ nét trong tâm trí, nhắc nhở bạn về những hậu quả của quyết định sai lầm.';
      } else if (
        skillName.includes('trọng sinh') ||
        skillName.includes('tái sinh')
      ) {
        skillType = 'trọng sinh';
        resurrectionMessage =
          '✨ **TRỌNG SINH THÀNH CÔNG!**\n\nBạn đã được tái sinh với ký ức về cuộc đời trước. Kinh nghiệm đau đớn từ cái chết trước đây sẽ giúp bạn đưa ra những quyết định khôn ngoan hơn.';
      } else if (
        skillName.includes('phục sinh') ||
        skillName.includes('hồi sinh')
      ) {
        skillType = 'phục sinh';
        resurrectionMessage =
          '⚡ **PHỤC SINH THÀNH CÔNG!**\n\nBạn đã được hồi sinh từ cõi chết. Mặc dù còn yếu ớt, nhưng bạn đã có cơ hội thứ hai để tiếp tục cuộc phiêu lưu.';
      } else if (
        skillName.includes('bất tử') ||
        skillName.includes('bất diệt')
      ) {
        skillType = 'bất tử';
        resurrectionMessage =
          '🛡️ **SỨC MẠNH BẤT TỬ KÍCH HOẠT!**\n\nKhả năng bất tử của bạn đã cứu bạn khỏi cái chết. Tuy nhiên, sức mạnh này đã bị suy yếu đáng kể sau lần sử dụng này.';
      } else {
        resurrectionMessage =
          '💫 **HỒI SINH THÀNH CÔNG!**\n\nBạn đã được cứu sống bởi một sức mạnh bí ẩn. Cơ hội thứ hai này không nên bị lãng phí.';
      }

      // Handle skill consumption based on usage count
      if (resurrectionSkill.description) {
        const usageMatch = resurrectionSkill.description.match(
          /Số lần sử dụng:\s*(\d+)/,
        );
        if (usageMatch) {
          const currentUses = parseInt(usageMatch[1]);
          if (currentUses > 1) {
            // Decrease usage count - create new skill object to avoid readonly issue
            const updatedDescription = resurrectionSkill.description.replace(
              /Số lần sử dụng:\s*\d+/,
              `Số lần sử dụng: ${currentUses - 1}`,
            );

            // Create a new skill object with updated description
            const updatedSkill: CharacterSkill = {
              name: resurrectionSkill.name,
              description: updatedDescription,
              level: resurrectionSkill.level,
              mastery: resurrectionSkill.mastery,
              type: resurrectionSkill.type,
              requirements: resurrectionSkill.requirements,
            };

            // Find and replace the skill in the character skills array
            const skillIndex = game.characterSkills.findIndex(
              (s) => s.name === resurrectionSkill.name,
            );
            if (skillIndex !== -1) {
              game.characterSkills[skillIndex] = updatedSkill;
            }
          } else {
            // Mark as used up - create new skill object to avoid readonly issue
            const updatedDescription = resurrectionSkill.description.replace(
              /Số lần sử dụng:\s*\d+/,
              'Số lần sử dụng: 0 (Đã cạn kiệt)',
            );

            // Create a new skill object with updated description
            const updatedSkill: CharacterSkill = {
              name: resurrectionSkill.name,
              description: updatedDescription,
              level: resurrectionSkill.level,
              mastery: resurrectionSkill.mastery,
              type: resurrectionSkill.type,
              requirements: resurrectionSkill.requirements,
            };

            // Find and replace the skill in the character skills array
            const skillIndex = game.characterSkills.findIndex(
              (s) => s.name === resurrectionSkill.name,
            );
            if (skillIndex !== -1) {
              // Replace with updated skill instead of removing
              game.characterSkills[skillIndex] = updatedSkill;
            }
          }
        } else {
          // If no usage count specified, assume single use and remove
          const skillIndex = game.characterSkills.findIndex(
            (s) => s.name === resurrectionSkill.name,
          );
          if (skillIndex !== -1) {
            game.characterSkills.splice(skillIndex, 1);
          }
        }
      }

      this.logger.log(
        `Used resurrection skill: ${resurrectionSkill.name} (Type: ${skillType})`,
      );
    }

    // Apply resurrection with penalties
    this.handleResurrection(game);

    // Reactivate game
    game.active = true;
    game.deathDate = null;
    game.deathCause = null;

    // Add resurrection story with appropriate message
    const storyContent =
      resurrectionMessage +
      (resurrectionSkill
        ? ` Khả năng "${resurrectionSkill.name}" đã được sử dụng.`
        : '') +
      ' Hãy cẩn thận hơn trong những quyết định tiếp theo...';

    game.storyHistory.push({
      type: 'story',
      content: storyContent,
      timestamp: new Date(),
    });

    // Reset choices to continue game with appropriate risk levels
    game.currentChoices = [
      { text: '[AN TOÀN] Quan sát kỹ lưỡng tình hình xung quanh', number: 1 },
      {
        text: '[THẬN TRỌNG] Tiến hành thận trọng với kế hoạch rõ ràng',
        number: 2,
      },
      { text: '[NGUY HIỂM] Hành động quyết đoán như trước đây', number: 3 },
    ];

    // Set appropriate prompt based on skill type
    const weaknessNote =
      '\n\nBạn cảm thấy yếu ớt hơn so với trước đây do hình phạt từ việc sử dụng khả năng đặc biệt. Lần này, bạn sẽ làm gì?';
    game.currentPrompt = resurrectionMessage + weaknessNote;

    return await this.gamesRepository.save(game);
  }

  /**
   * Convert complex GameStats to simple GameStats for engine compatibility
   */
  private convertGameStats(
    stats: any,
  ): import('../common/types/game-engine.types').GameStats {
    const converted: Record<string, string | number> = {};

    for (const [key, value] of Object.entries(stats || {})) {
      if (typeof value === 'string' || typeof value === 'number') {
        converted[key] = value;
      } else if (value && typeof value === 'object') {
        // Convert complex objects to strings
        converted[key] = JSON.stringify(value);
      } else {
        converted[key] = String(value);
      }
    }

    return converted as import('../common/types/game-engine.types').GameStats;
  }

  /**
   * Convert InventoryItem array to engine-compatible format
   */
  private convertInventoryItems(
    items: any[],
  ): import('../common/types/game-engine.types').InventoryItem[] {
    return (items || []).map((item) => ({
      name: item.name || '',
      description: item.description,
      quantity: item.quantity || 1,
      type: item.type,
      rarity: this.normalizeRarity(item.rarity),
    }));
  }

  /**
   * Update quest
   */
  async updateQuest(
    id: string,
    userId: string,
    updateQuestDto: UpdateQuestDto,
  ): Promise<Game> {
    try {
      // 1. Check if game exists and belongs to the user
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // 2. Initialize quest log if it doesn't exist
      if (!game.questLog) {
        game.questLog = [];
      }

      // 3. Check if quest already exists
      const existingQuestIndex = game.questLog.findIndex(
        (quest) => quest.id === updateQuestDto.id,
      );

      if (existingQuestIndex !== -1) {
        // 4. Update existing quest
        const existingQuest = game.questLog[existingQuestIndex];

        // Update basic properties
        game.questLog[existingQuestIndex] = {
          ...existingQuest,
          title: updateQuestDto.title || existingQuest.title,
          description: updateQuestDto.description || existingQuest.description,
          status: updateQuestDto.status || existingQuest.status,
          progress:
            updateQuestDto.progress !== undefined
              ? updateQuestDto.progress
              : existingQuest.progress,
          rewards: updateQuestDto.rewards || existingQuest.rewards,
          relatedNpcs: updateQuestDto.relatedNpcs || existingQuest.relatedNpcs,
          deadline: updateQuestDto.deadline || existingQuest.deadline,
        };

        // Update objectives if provided
        if (updateQuestDto.objectives && updateQuestDto.objectives.length > 0) {
          // Map existing objectives by description for easy lookup
          const existingObjectives = new Map(
            existingQuest.objectives.map((obj) => [obj.description, obj]),
          );

          // Process new/updated objectives
          const updatedObjectives = updateQuestDto.objectives.map((newObj) => {
            const existing = existingObjectives.get(newObj.description);
            if (existing) {
              // Update existing objective
              return {
                ...existing,
                completed: newObj.completed,
                optional:
                  newObj.optional !== undefined
                    ? newObj.optional
                    : existing.optional,
              };
            } else {
              // Add new objective
              return {
                description: newObj.description,
                completed: newObj.completed,
                optional: newObj.optional || false,
              };
            }
          });

          // Keep existing objectives that weren't in the update
          const objectiveDescriptions = new Set(
            updateQuestDto.objectives.map((obj) => obj.description),
          );

          const remainingObjectives = existingQuest.objectives.filter(
            (obj) => !objectiveDescriptions.has(obj.description),
          );

          // Combine updated and remaining objectives
          game.questLog[existingQuestIndex].objectives = [
            ...updatedObjectives,
            ...remainingObjectives,
          ];
        }

        // Update progress based on completed objectives if not explicitly set
        if (updateQuestDto.progress === undefined) {
          const completedObjectives = game.questLog[
            existingQuestIndex
          ].objectives.filter((obj) => obj.completed && !obj.optional).length;

          const requiredObjectives = game.questLog[
            existingQuestIndex
          ].objectives.filter((obj) => !obj.optional).length;

          if (requiredObjectives > 0) {
            game.questLog[existingQuestIndex].progress = Math.round(
              (completedObjectives / requiredObjectives) * 100,
            );
          }
        }

        // Auto-update status if all required objectives are completed
        const allRequiredCompleted = game.questLog[
          existingQuestIndex
        ].objectives
          .filter((obj) => !obj.optional)
          .every((obj) => obj.completed);

        if (
          allRequiredCompleted &&
          game.questLog[existingQuestIndex].status === 'active'
        ) {
          game.questLog[existingQuestIndex].status = 'completed';

          // Add to story history
          game.storyHistory.push({
            type: 'quest_completed',
            content: `Nhiệm vụ hoàn thành: ${game.questLog[existingQuestIndex].title}`,
            timestamp: new Date(),
            attributes: {
              questId: game.questLog[existingQuestIndex].id,
              questTitle: game.questLog[existingQuestIndex].title,
            },
          });
        }
      } else {
        // 5. Create new quest
        const newQuest = {
          id: updateQuestDto.id,
          title: updateQuestDto.title,
          description: updateQuestDto.description,
          status: (updateQuestDto.status || 'active') as
            | 'active'
            | 'completed'
            | 'failed'
            | 'hidden',
          progress: updateQuestDto.progress || 0,
          objectives: updateQuestDto.objectives || [],
          rewards: updateQuestDto.rewards || [],
          relatedNpcs: updateQuestDto.relatedNpcs || [],
          deadline: updateQuestDto.deadline,
        };

        game.questLog.push(newQuest);

        // Add to story history
        game.storyHistory.push({
          type: 'quest_started',
          content: `Nhiệm vụ mới: ${newQuest.title}`,
          timestamp: new Date(),
          attributes: {
            questId: newQuest.id,
            questTitle: newQuest.title,
          },
        });
      }

      // 6. Save updated game to database
      const updatedGame = await this.gamesRepository.save(game);
      this.logger.log(`Game ${id} quest updated successfully`);

      return updatedGame;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating quest for game ${id}:`, error);
      throw new InternalServerErrorException('Failed to update quest');
    }
  }

  /**
   * Update NPC relationship
   */
  async updateNpcRelationship(
    id: string,
    userId: string,
    updateNpcRelationshipDto: UpdateNpcRelationshipDto,
  ): Promise<Game> {
    try {
      // 1. Check if game exists and belongs to the user
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // 2. Initialize NPC relationships array if it doesn't exist
      if (!game.npcRelationships) {
        game.npcRelationships = [];
      }

      // 3. Check if NPC already exists in relationships
      const existingNpcIndex = game.npcRelationships.findIndex(
        (npc) =>
          npc.npcId === updateNpcRelationshipDto.npcId ||
          npc.npcName === updateNpcRelationshipDto.npcName,
      );

      const now = new Date();

      if (existingNpcIndex !== -1) {
        // 4. Update existing NPC relationship
        const existingNpc = game.npcRelationships[existingNpcIndex];

        // Update relationship level if provided
        if (updateNpcRelationshipDto.relationshipLevel !== undefined) {
          game.npcRelationships[existingNpcIndex].relationshipLevel =
            updateNpcRelationshipDto.relationshipLevel;
        }

        // Update status if provided
        if (updateNpcRelationshipDto.status) {
          game.npcRelationships[existingNpcIndex].status =
            updateNpcRelationshipDto.status;
        }

        // Add new interaction if provided
        if (updateNpcRelationshipDto.newInteraction) {
          if (!existingNpc.interactions) {
            game.npcRelationships[existingNpcIndex].interactions = [];
          }

          game.npcRelationships[existingNpcIndex].interactions.push({
            date: now,
            type: updateNpcRelationshipDto.newInteraction.type,
            outcome: updateNpcRelationshipDto.newInteraction.outcome,
            impact: updateNpcRelationshipDto.newInteraction.impact,
          });
        }

        // Add new memories if provided
        if (
          updateNpcRelationshipDto.newMemories &&
          updateNpcRelationshipDto.newMemories.length > 0
        ) {
          if (!existingNpc.memories) {
            game.npcRelationships[existingNpcIndex].memories = [];
          }

          game.npcRelationships[existingNpcIndex].memories = [
            ...game.npcRelationships[existingNpcIndex].memories,
            ...updateNpcRelationshipDto.newMemories,
          ];
        }

        // Update location if provided
        if (updateNpcRelationshipDto.currentLocation) {
          game.npcRelationships[existingNpcIndex].currentLocation =
            updateNpcRelationshipDto.currentLocation;
        }

        // Update activity if provided
        if (updateNpcRelationshipDto.currentActivity) {
          game.npcRelationships[existingNpcIndex].currentActivity =
            updateNpcRelationshipDto.currentActivity;
        }
      } else {
        // 5. Create new NPC relationship
        const newNpcRelationship: NpcRelationship = {
          npcId: updateNpcRelationshipDto.npcId,
          npcName: updateNpcRelationshipDto.npcName,
          relationshipLevel: updateNpcRelationshipDto.relationshipLevel || 0,
          status: updateNpcRelationshipDto.status || 'neutral',
          interactions: updateNpcRelationshipDto.newInteraction
            ? [
                {
                  date: now,
                  type: updateNpcRelationshipDto.newInteraction.type,
                  outcome: updateNpcRelationshipDto.newInteraction.outcome,
                  impact: updateNpcRelationshipDto.newInteraction.impact,
                },
              ]
            : [],
          memories: updateNpcRelationshipDto.newMemories || [],
          currentLocation: updateNpcRelationshipDto.currentLocation,
          currentActivity: updateNpcRelationshipDto.currentActivity,
        };

        game.npcRelationships.push(newNpcRelationship);
      }

      // 6. Save updated game to database
      const updatedGame = await this.gamesRepository.save(game);
      this.logger.log(`Game ${id} NPC relationship updated successfully`);

      return updatedGame;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Error updating NPC relationship for game ${id}:`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to update NPC relationship',
      );
    }
  }

  /**
   * Update game world state
   */
  async updateWorldState(
    id: string,
    userId: string,
    updateWorldStateDto: UpdateWorldStateDto,
  ): Promise<Game> {
    try {
      // 1. Check if game exists and belongs to the user
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // 2. Initialize world state if it doesn't exist
      if (!game.worldState) {
        game.worldState = {
          gameTime: {
            day: 1,
            hour: 12,
            minute: 0,
            season: 'spring',
            year: 1,
          },
          environment: {
            weather: 'clear',
            temperature: 20,
            conditions: ['normal'],
          },
          society: {
            politicalState: 'stable',
            economicState: 'normal',
          },
          discoveredRegions: [],
          activeEvents: [],
        };
      }

      // 3. Update game time if provided
      if (updateWorldStateDto.gameTime) {
        game.worldState.gameTime = {
          ...game.worldState.gameTime,
          ...updateWorldStateDto.gameTime,
        };
      }

      // 4. Update environment if provided
      if (updateWorldStateDto.environment) {
        game.worldState.environment = {
          ...game.worldState.environment,
          ...updateWorldStateDto.environment,
        };
      }

      // 5. Update society if provided
      if (updateWorldStateDto.society) {
        game.worldState.society = {
          ...game.worldState.society,
          ...updateWorldStateDto.society,
        };
      }

      // 6. Update discovered regions if provided
      if (
        updateWorldStateDto.discoveredRegions &&
        Array.isArray(updateWorldStateDto.discoveredRegions)
      ) {
        // Add new regions without duplicates
        const existingRegions = new Set(
          game.worldState.discoveredRegions || [],
        );
        updateWorldStateDto.discoveredRegions.forEach((region: string) => {
          existingRegions.add(region);
        });
        game.worldState.discoveredRegions = Array.from(existingRegions);
      }

      // 7. Update active events if provided
      if (
        updateWorldStateDto.activeEvents &&
        Array.isArray(updateWorldStateDto.activeEvents)
      ) {
        // Replace existing events with the same ID, add new ones
        const existingEvents = new Map(
          (game.worldState.activeEvents || []).map((event) => [
            event.id,
            event,
          ]),
        );

        updateWorldStateDto.activeEvents.forEach((event: any) => {
          existingEvents.set(event.id, {
            ...event,
            startTime: event.startTime || new Date(),
          });
        });

        game.worldState.activeEvents = Array.from(existingEvents.values());
      }

      // 8. Update custom attributes if provided
      if (
        updateWorldStateDto.attributes &&
        typeof updateWorldStateDto.attributes === 'object'
      ) {
        game.worldState = {
          ...game.worldState,
          ...updateWorldStateDto.attributes,
        };
      }

      // 9. Add to world evolution history
      if (!game.worldEvolution) {
        game.worldEvolution = [];
      }

      // Record significant changes to world evolution
      const significantChanges = [];

      if (updateWorldStateDto.environment?.weather) {
        significantChanges.push({
          aspect: 'weather',
          change: `Weather changed to ${updateWorldStateDto.environment.weather}`,
          playerInfluence: 0, // System change
        });
      }

      if (updateWorldStateDto.society?.politicalState) {
        significantChanges.push({
          aspect: 'politics',
          change: `Political state changed to ${updateWorldStateDto.society.politicalState}`,
          playerInfluence: 20, // Assume some player influence
        });
      }

      if (
        updateWorldStateDto.activeEvents &&
        updateWorldStateDto.activeEvents.length > 0
      ) {
        updateWorldStateDto.activeEvents.forEach((event: any) => {
          significantChanges.push({
            aspect: 'event',
            change: `Event started: ${event.name}`,
            playerInfluence: 50, // Assume moderate player influence
          });
        });
      }

      // Add all significant changes to evolution history
      const now = new Date();
      significantChanges.forEach((change) => {
        game.worldEvolution.push({
          timestamp: now,
          ...change,
        });
      });

      // 10. Save updated game to database
      const updatedGame = await this.gamesRepository.save(game);
      this.logger.log(`Game ${id} world state updated successfully`);

      return updatedGame;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating world state for game ${id}:`, error);
      throw new InternalServerErrorException('Failed to update world state');
    }
  }

  /**
   * Update player status effects
   */
  async updateStatusEffects(
    id: string,
    userId: string,
    updateStatusEffectsDto: UpdateStatusEffectsDto,
  ): Promise<Game> {
    try {
      // 1. Check if game exists and belongs to the user
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // 2. Initialize player status effects array if it doesn't exist
      if (!game.playerStatusEffects) {
        game.playerStatusEffects = [];
      }

      // 3. Process effects to add
      if (
        updateStatusEffectsDto.addEffects &&
        updateStatusEffectsDto.addEffects.length > 0
      ) {
        // Check for duplicates and add new effects
        const existingEffectIds = new Set(
          game.playerStatusEffects.map((effect) => effect.id),
        );

        updateStatusEffectsDto.addEffects.forEach((newEffect) => {
          if (!existingEffectIds.has(newEffect.id)) {
            game.playerStatusEffects.push({
              ...newEffect,
              appliedAt: new Date(),
              remainingDuration: newEffect.duration,
            });

            // Add to story history
            game.storyHistory.push({
              type: 'status_effect_applied',
              content: `Hiệu ứng mới: ${newEffect.name} - ${newEffect.description}`,
              timestamp: new Date(),
              attributes: {
                effectId: newEffect.id,
                effectName: newEffect.name,
                effectType: newEffect.type || 'unknown',
                source: newEffect.source || 'unknown',
              },
            });
          }
        });
      }

      // 4. Process effects to remove
      if (
        updateStatusEffectsDto.removeEffects &&
        updateStatusEffectsDto.removeEffects.length > 0
      ) {
        const removeEffectIds = new Set(updateStatusEffectsDto.removeEffects);

        // Filter out effects to remove
        const effectsToRemove = game.playerStatusEffects.filter((effect) =>
          removeEffectIds.has(effect.id),
        );

        game.playerStatusEffects = game.playerStatusEffects.filter(
          (effect) => !removeEffectIds.has(effect.id),
        );

        // Add to story history for each removed effect
        effectsToRemove.forEach((effect) => {
          game.storyHistory.push({
            type: 'status_effect_removed',
            content: `Hiệu ứng kết thúc: ${effect.name}`,
            timestamp: new Date(),
            attributes: {
              effectId: effect.id,
              effectName: effect.name,
              effectType: effect.type || 'unknown',
              reason: 'manual_removal',
            },
          });
        });
      }

      // 5. Process effects to update
      if (
        updateStatusEffectsDto.updateEffects &&
        updateStatusEffectsDto.updateEffects.length > 0
      ) {
        updateStatusEffectsDto.updateEffects.forEach((updatedEffect) => {
          const existingEffectIndex = game.playerStatusEffects.findIndex(
            (effect) => effect.id === updatedEffect.id,
          );

          if (existingEffectIndex !== -1) {
            // Update existing effect
            const oldEffect = {
              ...game.playerStatusEffects[existingEffectIndex],
            };

            game.playerStatusEffects[existingEffectIndex] = {
              ...oldEffect,
              ...updatedEffect,
              // Keep original application time
              appliedAt: oldEffect.appliedAt,
              // Update remaining duration if duration changed
              remainingDuration:
                updatedEffect.duration !== oldEffect.duration
                  ? updatedEffect.duration
                  : oldEffect.remainingDuration,
            };

            // Add to story history if significant changes
            if (
              updatedEffect.intensity !== oldEffect.intensity ||
              updatedEffect.duration !== oldEffect.duration ||
              JSON.stringify(updatedEffect.effects) !==
                JSON.stringify(oldEffect.effects)
            ) {
              game.storyHistory.push({
                type: 'status_effect_changed',
                content: `Hiệu ứng thay đổi: ${updatedEffect.name}`,
                timestamp: new Date(),
                attributes: {
                  effectId: updatedEffect.id,
                  effectName: updatedEffect.name,
                  changes: {
                    intensity: updatedEffect.intensity !== oldEffect.intensity,
                    duration: updatedEffect.duration !== oldEffect.duration,
                    effects:
                      JSON.stringify(updatedEffect.effects) !==
                      JSON.stringify(oldEffect.effects),
                  },
                },
              });
            }
          }
        });
      }

      // 6. Apply status effects to character stats
      this.applyStatusEffectsToStats(game);

      // 7. Save updated game to database
      const updatedGame = await this.gamesRepository.save(game);
      this.logger.log(`Game ${id} status effects updated successfully`);

      return updatedGame;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating status effects for game ${id}:`, error);
      throw new InternalServerErrorException('Failed to update status effects');
    }
  }

  /**
   * Process status effects (reduce duration, apply effects, remove expired)
   */
  async processStatusEffects(id: string, userId: string): Promise<void> {
    try {
      // 1. Get the game
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (
        !game ||
        !game.playerStatusEffects ||
        game.playerStatusEffects.length === 0
      ) {
        return; // No game or no status effects to process
      }

      // 2. Process each status effect
      const expiredEffects: string[] = [];
      let effectsChanged = false;

      game.playerStatusEffects.forEach((effect) => {
        // Reduce remaining duration by 1
        effect.remainingDuration -= 1;
        effectsChanged = true;

        // Check if effect has expired
        if (effect.remainingDuration <= 0) {
          expiredEffects.push(effect.id);

          // Add to story history
          game.storyHistory.push({
            type: 'status_effect_expired',
            content: `Hiệu ứng kết thúc: ${effect.name}`,
            timestamp: new Date(),
            attributes: {
              effectId: effect.id,
              effectName: effect.name,
              effectType: effect.type || 'unknown',
              reason: 'duration_ended',
            },
          });
        }
      });

      // 3. Remove expired effects
      if (expiredEffects.length > 0) {
        game.playerStatusEffects = game.playerStatusEffects.filter(
          (effect) => !expiredEffects.includes(effect.id),
        );
        effectsChanged = true;
      }

      // 4. Apply effects to stats if any changes were made
      if (effectsChanged) {
        this.applyStatusEffectsToStats(game);

        // 5. Save the game
        await this.gamesRepository.save(game);
      }
    } catch (error) {
      this.logger.error(
        `Error processing status effects for game ${id}:`,
        error,
      );
      // Don't throw here, just log the error to avoid interrupting the main action
    }
  }

  /**
   * Apply status effects to character stats
   */
  private applyStatusEffectsToStats(game: Game): void {
    // Skip if no status effects
    if (!game.playerStatusEffects || game.playerStatusEffects.length === 0) {
      return;
    }

    // Create a copy of the original stats
    const originalStats = { ...game.characterStats };

    // Apply each effect to the stats
    game.playerStatusEffects.forEach((effect) => {
      if (effect.effects) {
        Object.entries(effect.effects).forEach(([statKey, value]) => {
          // Handle numeric changes
          if (
            typeof value === 'number' &&
            typeof game.characterStats[statKey] === 'number'
          ) {
            // Apply the effect
            game.characterStats[statKey] =
              (game.characterStats[statKey] as number) + value;
          }
          // Handle percentage changes
          else if (
            typeof value === 'string' &&
            value.endsWith('%') &&
            typeof game.characterStats[statKey] === 'number'
          ) {
            const percentage = parseFloat(value) / 100;
            const originalValue = originalStats[statKey] as number;
            const change = originalValue * percentage;
            game.characterStats[statKey] =
              (game.characterStats[statKey] as number) + change;
          }
          // Handle direct string replacements
          else if (typeof value === 'string' && !value.endsWith('%')) {
            game.characterStats[statKey] = value;
          }
        });
      }
    });
  }

  /**
   * Update game events
   */
  async updateGameEvents(
    id: string,
    userId: string,
    updateGameEventDto: UpdateGameEventDto,
  ): Promise<Game> {
    try {
      // 1. Check if game exists and belongs to the user
      const game = await this.gamesRepository.findOne({
        where: { id, userId },
      });

      if (!game) {
        throw new BadRequestException(
          `Game with ID ${id} not found or you don't have access to it`,
        );
      }

      // 2. Initialize game events array if it doesn't exist
      if (!game.worldState) {
        game.worldState = {
          gameTime: {
            day: 1,
            hour: 12,
            minute: 0,
            season: 'spring',
            year: 1,
          },
          environment: {
            weather: 'clear',
            temperature: 20,
            conditions: ['normal'],
          },
          society: {
            politicalState: 'stable',
            economicState: 'normal',
          },
          discoveredRegions: [],
          activeEvents: [],
        };
      }

      if (!game.worldState.activeEvents) {
        game.worldState.activeEvents = [];
      }

      // 3. Process events to add
      if (
        updateGameEventDto.addEvents &&
        updateGameEventDto.addEvents.length > 0
      ) {
        // Check for duplicates and add new events
        const existingEventIds = new Set(
          game.worldState.activeEvents.map((event) => event.id),
        );

        updateGameEventDto.addEvents.forEach((newEvent) => {
          if (!existingEventIds.has(newEvent.id)) {
            game.worldState.activeEvents.push({
              ...newEvent,
              startTime: new Date(),
              affectedRegions: newEvent.relatedLocations || [],
              consequences: [],
            });

            // Add to story history
            game.storyHistory.push({
              type: 'event_started',
              content: `Sự kiện mới: ${newEvent.name} - ${newEvent.description}`,
              timestamp: new Date(),
              attributes: {
                eventId: newEvent.id,
                eventName: newEvent.name,
                eventType: newEvent.type,
              },
            });

            // Apply immediate effects if any
            if (
              newEvent.immediateEffects &&
              newEvent.immediateEffects.length > 0
            ) {
              this.applyEventEffects(game, newEvent.immediateEffects);
            }
          }
        });
      }

      // 4. Process events to remove
      if (
        updateGameEventDto.removeEvents &&
        updateGameEventDto.removeEvents.length > 0
      ) {
        const removeEventIds = new Set(updateGameEventDto.removeEvents);

        // Filter out events to remove
        const eventsToRemove = game.worldState.activeEvents.filter((event) =>
          removeEventIds.has(event.id),
        );

        game.worldState.activeEvents = game.worldState.activeEvents.filter(
          (event) => !removeEventIds.has(event.id),
        );

        // Add to story history for each removed event
        eventsToRemove.forEach((event) => {
          game.storyHistory.push({
            type: 'event_ended',
            content: `Sự kiện kết thúc: ${event.name}`,
            timestamp: new Date(),
            attributes: {
              eventId: event.id,
              eventName: event.name,
              eventType: event.type || 'unknown',
              duration: this.calculateEventDuration(
                event.startTime,
                new Date(),
              ),
            },
          });
        });
      }

      // 5. Process events to update
      if (
        updateGameEventDto.updateEvents &&
        updateGameEventDto.updateEvents.length > 0
      ) {
        updateGameEventDto.updateEvents.forEach((updatedEvent) => {
          const existingEventIndex = game.worldState.activeEvents.findIndex(
            (event) => event.id === updatedEvent.id,
          );

          if (existingEventIndex !== -1) {
            // Update existing event
            const oldEvent = {
              ...game.worldState.activeEvents[existingEventIndex],
            };

            game.worldState.activeEvents[existingEventIndex] = {
              ...oldEvent,
              ...updatedEvent,
              // Keep original start time
              startTime: oldEvent.startTime,
              // Update affected regions and consequences
              affectedRegions:
                updatedEvent.relatedLocations || oldEvent.affectedRegions,
              consequences: updatedEvent.immediateEffects
                ? updatedEvent.immediateEffects.map(
                    (effect) => `${effect.type}: ${effect.target}`,
                  )
                : oldEvent.consequences,
            };

            // Add to story history if significant changes
            if (
              updatedEvent.name !== oldEvent.name ||
              updatedEvent.description !== oldEvent.description ||
              updatedEvent.type !== oldEvent.type
            ) {
              game.storyHistory.push({
                type: 'event_changed',
                content: `Sự kiện thay đổi: ${updatedEvent.name}`,
                timestamp: new Date(),
                attributes: {
                  eventId: updatedEvent.id,
                  eventName: updatedEvent.name,
                  changes: {
                    name: updatedEvent.name !== oldEvent.name,
                    description:
                      updatedEvent.description !== oldEvent.description,
                    type: updatedEvent.type !== oldEvent.type,
                  },
                },
              });
            }

            // Apply new immediate effects if any
            if (
              updatedEvent.immediateEffects &&
              updatedEvent.immediateEffects.length > 0
            ) {
              this.applyEventEffects(game, updatedEvent.immediateEffects);
            }
          }
        });
      }

      // 6. Save updated game to database
      const updatedGame = await this.gamesRepository.save(game);
      this.logger.log(`Game ${id} events updated successfully`);

      return updatedGame;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating events for game ${id}:`, error);
      throw new InternalServerErrorException('Failed to update events');
    }
  }

  /**
   * Apply event effects to the game state
   */
  private applyEventEffects(
    game: Game,
    effects: GameEventConsequenceDto[],
  ): void {
    effects.forEach((effect) => {
      switch (effect.type) {
        case 'stat_change':
          if (
            typeof game.characterStats[effect.target] === 'number' &&
            typeof effect.value === 'number'
          ) {
            game.characterStats[effect.target] =
              (game.characterStats[effect.target] as number) + effect.value;
          } else if (typeof effect.value === 'string') {
            game.characterStats[effect.target] = effect.value;
          }
          break;

        case 'weather_change':
          if (!game.worldState || !game.worldState.environment) {
            if (!game.worldState) {
              game.worldState = {
                gameTime: {
                  day: 1,
                  hour: 12,
                  minute: 0,
                  season: 'spring',
                  year: 1,
                },
                environment: {
                  weather: 'clear',
                  temperature: 20,
                  conditions: ['normal'],
                },
                society: {
                  politicalState: 'stable',
                  economicState: 'normal',
                },
                discoveredRegions: [],
                activeEvents: [],
              };
            } else {
              game.worldState.environment = {
                weather: 'clear',
                temperature: 20,
                conditions: ['normal'],
              };
            }
          }

          if (typeof effect.value === 'string') {
            game.worldState.environment.weather = effect.value;
          }
          break;

        case 'temperature_change':
          if (!game.worldState || !game.worldState.environment) {
            if (!game.worldState) {
              game.worldState = {
                gameTime: {
                  day: 1,
                  hour: 12,
                  minute: 0,
                  season: 'spring',
                  year: 1,
                },
                environment: {
                  weather: 'clear',
                  temperature: 20,
                  conditions: ['normal'],
                },
                society: {
                  politicalState: 'stable',
                  economicState: 'normal',
                },
                discoveredRegions: [],
                activeEvents: [],
              };
            } else {
              game.worldState.environment = {
                weather: 'clear',
                temperature: 20,
                conditions: ['normal'],
              };
            }
          }

          if (typeof effect.value === 'number') {
            game.worldState.environment.temperature = effect.value;
          }
          break;

        case 'add_status_effect':
          if (!game.playerStatusEffects) {
            game.playerStatusEffects = [];
          }

          const statusEffectValue = effect.value as Record<string, any>;
          if (
            typeof statusEffectValue === 'object' &&
            statusEffectValue &&
            statusEffectValue.id &&
            statusEffectValue.name &&
            statusEffectValue.description &&
            statusEffectValue.effects
          ) {
            game.playerStatusEffects.push({
              id: statusEffectValue.id,
              name: statusEffectValue.name,
              description: statusEffectValue.description,
              duration: statusEffectValue.duration || 1,
              remainingDuration: statusEffectValue.duration || 1,
              intensity: statusEffectValue.intensity,
              source: statusEffectValue.source,
              type: statusEffectValue.type,
              effects: statusEffectValue.effects,
              visualEffects: statusEffectValue.visualEffects,
              cures: statusEffectValue.cures,
              appliedAt: new Date(),
            });
          }
          break;

        case 'add_item':
          if (!game.inventoryItems) {
            game.inventoryItems = [];
          }

          const itemValue = effect.value as Record<string, any>;
          if (typeof itemValue === 'object' && itemValue && itemValue.name) {
            const existingItemIndex = game.inventoryItems.findIndex(
              (item) => item.name === itemValue.name,
            );

            if (existingItemIndex !== -1) {
              game.inventoryItems[existingItemIndex].quantity +=
                itemValue.quantity || 1;
            } else {
              game.inventoryItems.push({
                name: itemValue.name,
                description: itemValue.description || '',
                quantity: itemValue.quantity || 1,
                type: itemValue.type || 'misc',
                rarity: this.normalizeRarity(itemValue.rarity),
              });
            }
          }
          break;

        case 'remove_item':
          if (game.inventoryItems) {
            const itemIndex = game.inventoryItems.findIndex(
              (item) => item.name === effect.target,
            );

            if (itemIndex !== -1) {
              const quantity =
                typeof effect.value === 'number' ? effect.value : 1;

              if (game.inventoryItems[itemIndex].quantity <= quantity) {
                // Remove item completely
                game.inventoryItems.splice(itemIndex, 1);
              } else {
                // Reduce quantity
                game.inventoryItems[itemIndex].quantity -= quantity;
              }
            }
          }
          break;

        case 'reputation_change':
          if (!game.reputation) {
            game.reputation = {};
          }

          if (
            typeof effect.target === 'string' &&
            typeof effect.value === 'number'
          ) {
            const currentRep = game.reputation[effect.target] || 0;
            game.reputation[effect.target] = currentRep + effect.value;
          }
          break;

        case 'quest_update':
          if (!game.questLog) {
            game.questLog = [];
          }

          const questValue = effect.value as Record<string, any>;
          if (
            typeof effect.target === 'string' &&
            typeof questValue === 'object' &&
            questValue
          ) {
            const questIndex = game.questLog.findIndex(
              (quest) => quest.id === effect.target,
            );

            if (questIndex !== -1) {
              // Update existing quest
              game.questLog[questIndex] = {
                ...game.questLog[questIndex],
                ...questValue,
              };
            }
          }
          break;
      }
    });
  }

  /**
   * Calculate duration between two dates in hours
   */
  private calculateEventDuration(startDate: Date, endDate: Date): number {
    const diffMs = endDate.getTime() - new Date(startDate).getTime();
    return Math.round(diffMs / (1000 * 60 * 60));
  }

  /**
   * Normalize rarity to engine-compatible values
   */
  private normalizeRarity(
    rarity: unknown,
  ): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
    if (typeof rarity === 'string') {
      const normalized = rarity.toLowerCase();
      if (
        ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(normalized)
      ) {
        return normalized as
          | 'common'
          | 'uncommon'
          | 'rare'
          | 'epic'
          | 'legendary';
      }
    }
    return 'common'; // Default fallback
  }
}
