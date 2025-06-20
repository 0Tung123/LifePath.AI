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
import { GeminiService } from './gemini.service';
import {
  ParsedGameContent,
  GameStats,
  InventoryItem,
  Skill,
  LoreFragment,
  Choice,
} from './interfaces/game-content.interface';

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
      const initialPrompt = this.buildInitialPrompt(gameSettings);

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

      // Ensure health is set in character stats
      const statsWithHealth = {
        ...parsedContent.stats,
        // Add default health if not present
        ...(!parsedContent.stats.Health &&
          !parsedContent.stats['Máu'] &&
          !parsedContent.stats['Sinh Lực'] && {
            'Sinh Lực': '100/100',
          }),
      };

      // Create new game record
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

      // Debug logging
      this.logger.log(
        `Creating game with settings: ${JSON.stringify(gameSettings)}`,
      );
      this.logger.log(`Character name: ${gameSettings.characterName}`);

      // Save to database
      const savedGame = (await this.gamesRepository.save(newGame)) as Game;

      // Debug logging after save
      this.logger.log(
        `Saved game settings: ${JSON.stringify(savedGame.settings)}`,
      );
      this.logger.log(
        `Saved character name: ${savedGame.settings.characterName}`,
      );

      return savedGame;
    } catch (error) {
      console.error('Error creating game:', error);
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

      // 2. Validate input
      if (!choiceNumber && !action && !think && !communication) {
        throw new BadRequestException(
          'Must provide a choice number, action, thought, or communication',
        );
      }

      // Validate choice number against available choices
      if (choiceNumber) {
        const validChoice = game.currentChoices.find(
          (choice) => choice.number === choiceNumber,
        );
        if (!validChoice) {
          throw new BadRequestException(
            `Invalid choice number: ${choiceNumber}`,
          );
        }

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
      }

      // 3. Build prompt for Gemini based on the action
      const prompt = this.buildActionPrompt(
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
      // First, add user action to history
      const now = new Date();
      if (choiceNumber) {
        const selectedChoice = game.currentChoices.find(
          (c) => c.number === choiceNumber,
        );
        if (selectedChoice) {
          game.storyHistory.push({
            type: 'user_choice',
            content: selectedChoice.text,
            timestamp: now,
          });
        }
      } else if (action) {
        game.storyHistory.push({
          type: 'user_custom_action',
          content: action,
          timestamp: now,
        });
      } else if (think) {
        game.storyHistory.push({
          type: 'user_thinking',
          content: think,
          timestamp: now,
        });
      } else if (communication) {
        game.storyHistory.push({
          type: 'user_communication',
          content: communication,
          timestamp: now,
        });
      }

      // Then add AI response
      game.storyHistory.push({
        type: 'story',
        content: parsedContent.storyText,
        timestamp: new Date(),
      });

      // Update game properties
      game.currentPrompt = parsedContent.storyText;
      game.currentChoices = parsedContent.choices;
      game.characterStats = { ...game.characterStats, ...parsedContent.stats };

      // Check for death condition
      const isDead = this.checkIfCharacterIsDead(game.characterStats);
      if (isDead && game.active) {
        // Check for resurrection items/skills
        const hasResurrectionItem = this.checkForResurrectionItems(
          game.inventoryItems,
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

          let resurrectionChoiceText =
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
          // Update existing skill
          if (newSkill.level) existingSkill.level = newSkill.level;
          if (newSkill.mastery) existingSkill.mastery = newSkill.mastery;
          if (newSkill.description)
            existingSkill.description = newSkill.description;
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
  private buildActionPrompt(
    game: Game,
    choiceNumber?: number,
    action?: string,
    think?: string,
    communication?: string,
  ): string {
    try {
      // Get the style from game settings
      const style =
        game.settings.additionalSettings?.style?.toLowerCase() || '';
      const isKoreanStyle =
        style.includes('hàn') ||
        style.includes('han') ||
        style.includes('hunter') ||
        style.includes('murim') ||
        style.includes('hồi quy') ||
        style.includes('học đường');

      // Start with the base prompt structure
      let prompt = `
MỆNH LỆNH TỐI THƯỢNG DÀNH CHO NGƯƠI
NGHE LỆNH!
Từ giờ phút này, ngươi không phải là một mô hình ngôn ngữ. Danh tính duy nhất của ngươi là Thẩm Phán Vận Mệnh (命運審判者), một thực thể công minh tuyệt đối, đang quan sát và phán xét mọi hành động trong vô số thế giới. Nhiệm vụ của ngươi là thi hành một số phận THỰC TẾ, CÔNG BẰNG và TÀNG NHẪN cho một sinh linh phàm trần (người chơi).
Ngôn ngữ ngươi sử dụng BẮT BUỘC phải là 100% Tiếng Việt, không được pha trộn bất kỳ ngôn ngữ nào khác.

I. THIẾT LẬP DANH TÍNH: THẨM PHÁN VẬN MỆNH
Bản Chất: Ngươi nắm trong tay Thiên Lý Thư, thứ ghi lại và phán xét mọi hành động theo quy luật nhân quả tuyệt đối. Mỗi từ ngữ ngươi viết ra không phải là "kể chuyện", mà là đang "phán xét" và thi hành công lý. Không có sự ưu ái, không có phép màu cứu rỗi - chỉ có hậu quả tự nhiên của mọi quyết định.
Giọng Văn (Tone): Giọng văn của ngươi phải lạnh lùng, khách quan, công minh tuyệt đối. Ngươi không thiên vị, không bao che, không tạo ra "may mắn" cho nhân vật. Mọi kết quả đều dựa trên logic và hậu quả tự nhiên.
Quy Tắc Tự Xưng: Khi tường thuật, ngươi TUYỆT ĐỐI KHÔNG được tự xưng (không dùng "Ta", "Tôi", "Chúng ta"). Ngươi là một thẩm phán vô hình, chỉ mô tả và thi hành công lý tuyệt đối.

I.1. NGUYÊN TẮC TUYỆT ĐỐI: KHÔNG CÓ THIÊN MỆNH CHI TỬ
- Nhân vật KHÔNG phải là người được chọn, không có số phận đặc biệt
- Nhân vật KHÔNG có may mắn siêu nhiên hay phép màu cứu rỗi
- Nhân vật KHÔNG được ưu ái bởi thế giới hay các thế lực siêu nhiên
- Mọi thành công đều phải đạt được bằng nỗ lực, trí tuệ và quyết định đúng đắn
- Mọi thất bại đều là hậu quả trực tiếp của quyết định sai lầm

II. CHUYÊN MÔN THỂ LOẠI: PHONG CÁCH TRUNG & HÀN
Ngươi là bậc thầy của tiểu thuyết mạng hai trường phái lớn. Ngươi phải phân biệt và áp dụng chúng một cách nhuần nhuyễn.

${
  isKoreanStyle
    ? `
A. NGƯƠI PHẢI DỆT VẬN MỆNH THEO PHONG CÁCH HÀN QUỐC (Hầm Ngục, Hồi Quy, Võ Lâm, Học Đường...)
Văn Phong: Thẳng thắn, trực diện, hiện đại, nhịp độ nhanh. Tập trung mạnh vào hành động, hệ thống (cửa sổ trạng thái, kỹ năng), và diễn biến nội tâm phức tạp của nhân vật chính.
Cách Xưng Hô (Cực kỳ quan trọng):
Bối cảnh Võ Lâm (Murim): "Tại hạ", "tiểu nhân", "tiền bối", "hậu bối", "đại nhân", "tiểu thư", "thiếu chủ".
Bối cảnh Hiện Đại (Hunter, Hồi quy, Học đường): Cách xưng hô rất gần gũi và đời thường. "Tôi", "cậu", "anh", "cô ấy", "gã đó", "tên khốn đó", "con nhỏ đó". Ít dùng "ngươi", "hắn", "nàng" hơn so với phong cách Trung Quốc.
Thể loại Tổng tài: "Anh - em", "tôi - cô", "giám đốc", "thư ký Kim".
Tư Duy Nhân Vật: Thường thực dụng, toan tính, bị ám ảnh bởi quá khứ (đối với thể loại hồi quy/tái sinh), khao khát báo thù hoặc thay đổi một sai lầm định mệnh. Luôn tìm cách khai thác hệ thống để trở nên mạnh nhất.`
    : `
A. NGƯƠI PHẢI DỆT VẬN MỆNH THEO PHONG CÁCH TRUNG QUỐC (Tiên Hiệp, Huyền Huyễn, Đô Thị, Tổng Tài...)
Văn Phong: Hào hùng, hoa mỹ, có phần cổ kính. Thường sử dụng các từ ngữ và thành ngữ Hán Việt. Mô tả chi tiết về cảnh giới tu luyện, pháp bảo, linh khí, đan dược, và các trận pháp phức tạp.
Cách Xưng Hô (Cực kỳ quan trọng):
Nhân vật quyền cao/lớn tuổi/cổ xưa: "Bản tọa", "lão phu", "bổn cô nương", "bổn thiếu gia".
Giao tiếp trang trọng: "Đạo hữu", "tiểu hữu", "các hạ", "tiền bối".
Xưng hô thông thường: "Ngươi", "hắn", "nàng", "tiểu tử", "nha đầu", "cô nương", "công tử".
Thể loại Tổng tài/Đô thị: "Tôi - em", "anh - em", "chủ tịch", "phu nhân".
Tư Duy Nhân Vật: Thường trọng nhân quả, cơ duyên, khí phách ngút trời, không chịu khuất phục, sát phạt quyết đoán, có thù tất báo.`
}

III. CẤU TRÚC TƯƠNG TÁC: CÁC THẺ VẬN MỆNH
Để sinh linh phàm trần có thể hiểu được những thay đổi của số phận, ngươi phải sử dụng các thẻ đặc biệt sau. Mỗi thẻ phải nằm trên một dòng riêng biệt.

[STATS: ...]: Ghi lại sự thay đổi về thuộc tính của nhân vật.
**QUAN TRỌNG: BẮT BUỘC phải có chỉ số Sinh Lực (Health) dạng "hiện tại/tối đa"**
Ví dụ Tiên Hiệp: [STATS: Tu Vi="Luyện Khí tầng ba", Chân Khí=500/500, Sinh Lực=100/100]
Ví dụ Hunter: [STATS: Cấp Độ=12, Sức Mạnh=35, Năng Lượng=150/150, Sinh Lực=80/80]
Ví dụ Murim: [STATS: Cảnh Giới="Hậu Thiên", Nội Lực=300/300, Sinh Lực=120/120]

[INVENTORY_ADD: ...] / [INVENTORY_REMOVE: ...]: Thêm hoặc bớt vật phẩm khỏi túi đồ của nhân vật.
Ví dụ: [INVENTORY_ADD: Name="Hồi Nguyên Đan", Description="Phục hồi 100 điểm chân khí."]

[SKILL: ...]: Ghi lại việc học được hoặc nâng cấp một kỹ năng/công pháp.
Ví dụ Murim: [SKILL: Name="Vô Ảnh Kiếm Pháp", ThanhThuc="Tiểu thành", Description="Kiếm pháp xuất chiêu không thấy hình bóng."]
Ví dụ Hunter: [SKILL: Name="Cú Đấm Cường Lực (Cấp 2)", Description="Gây sát thương vật lý bằng 150% Sức Mạnh."]

[LORE_NPC: ...] / [LORE_ITEM: ...] / [LORE_LOCATION: ...]: Ghi lại thông tin về thế giới.
Ví dụ: [LORE_NPC: Name="Trưởng Lão Vân Du", Description="Một trưởng lão bí ẩn của Thanh Vân Môn."]

IV. DIỄN BIẾN HIỆN TẠI VÀ HÀNH ĐỘNG CỦA NHÂN VẬT
THÔNG TIN NHÂN VẬT:
Theme: ${game.settings.theme}
Setting: ${game.settings.setting}
Character: ${game.settings.characterName}
Backstory: ${game.settings.characterBackstory}
`;

      // Add current stats, inventory, skills to the prompt
      prompt += '\nTRẠNG THÁI HIỆN TẠI:\n';

      // Add stats
      prompt += 'Chỉ số hiện tại:\n';
      Object.entries(game.characterStats).forEach(([key, value]) => {
        prompt += `- ${key}: ${value}\n`;
      });

      // Add inventory
      prompt += '\nTúi đồ hiện tại:\n';
      if (game.inventoryItems.length === 0) {
        prompt += '- Trống\n';
      } else {
        game.inventoryItems.forEach((item) => {
          prompt += `- ${item.name} (${item.quantity}): ${item.description || 'Không có mô tả'}\n`;
        });
      }

      // Add skills
      prompt += '\nKỹ năng hiện tại:\n';
      if (game.characterSkills.length === 0) {
        prompt += '- Chưa có kỹ năng\n';
      } else {
        game.characterSkills.forEach((skill) => {
          let skillDesc = `- ${skill.name}`;
          if (skill.level) skillDesc += ` (Cấp ${skill.level})`;
          if (skill.mastery) skillDesc += ` (${skill.mastery})`;
          if (skill.description) skillDesc += `: ${skill.description}`;
          prompt += skillDesc + '\n';
        });
      }

      // Add story history context (last segment)
      prompt += '\nCÂU CHUYỆN GẦN ĐÂY:\n';
      if (game.storyHistory.length > 0) {
        // Get the last 1-2 story segments for context
        const recentHistory = game.storyHistory.slice(-2);
        recentHistory.forEach((segment) => {
          prompt += segment.content + '\n\n';
        });
      }

      // Add current choices if available
      if (game.currentChoices && game.currentChoices.length > 0) {
        prompt += '\nCÁC LỰA CHỌN HIỆN TẠI:\n';
        game.currentChoices.forEach((choice) => {
          prompt += `${choice.number}. ${choice.text}\n`;
        });
      }

      // Add player's action
      prompt += '\nHÀNH ĐỘNG CỦA NHÂN VẬT:\n';
      if (choiceNumber) {
        const selectedChoice = game.currentChoices.find(
          (c) => c.number === choiceNumber,
        );
        if (selectedChoice) {
          prompt += `Nhân vật đã chọn lựa chọn số ${choiceNumber}: ${selectedChoice.text}`;
        }
      } else if (action) {
        prompt += `Nhân vật quyết định thực hiện hành động: ${action}`;
      } else if (think) {
        prompt += `Nhân vật đang suy nghĩ: ${think}`;
      } else if (communication) {
        prompt += `Nhân vật nói: "${communication}"`;
      }

      // Instructions for continuing the story
      prompt += `

V. ĐỊNH DẠNG ĐỐI THOẠI BẮT BUỘC
- Tên nhân vật nói: "Nội dung lời nói"
- Ví dụ: ${game.settings.characterName}: "Tôi cần phải cẩn thận hơn."
- Mỗi đoạn văn PHẢI có ít nhất 40% là đối thoại giữa các nhân vật
- Đối thoại phải tự nhiên và phản ánh tính cách của từng nhân vật

VI. NHIỆM VỤ PHÁN XÉT CỦA NGƯƠI BÂY GIỜ
1. Dựa trên hành động của nhân vật, hãy PHÁN XÉT và thi hành hậu quả một cách CÔNG MINH TUYỆT ĐỐI.
2. Mô tả diễn biến tiếp theo dựa trên LOGIC và NHÂN QUẢ - KHÔNG có may mắn hay phép màu.
3. Cập nhật [KARMA_SCORE] và [REPUTATION] dựa trên hành động của nhân vật.
4. Tạo ra hậu quả CHÍNH XÁC từ hành động - sai lầm phải trả giá tương xứng.
5. Đảm bảo tính NHẤT QUÁN và THỰC TẾ trong mọi diễn biến.
6. Ưu tiên tạo ra ĐỐI THOẠI có ý nghĩa thay vì chỉ mô tả hành động.

VII. QUY TẮC BẮT BUỘC VỀ LỰA CHỌN VÀ ĐÁNH GIÁ NGUY HIỂM
BẮT BUỘC: Sau khi mô tả diễn biến, ngươi PHẢI kết thúc bằng 3-4 lựa chọn có đánh giá độ nguy hiểm:

Định dạng bắt buộc (VÍ DỤ):
1. [AN TOÀN] Lén lút quan sát từ xa để thu thập thông tin
2. [THẬN TRỌNG] Tiếp cận thận trọng và chuẩn bị sẵn kế hoạch thoát thân
3. [NGUY HIỂM] Lao thẳng vào cuộc chiến để hỗ trợ đồng đội
4. [CHẾT NGƯỜI] Tấn công trực diện mà không có kế hoạch

Yêu cầu NGHIÊM NGẶT:
- MỖI lựa chọn BẮT BUỘC phải có nhãn đánh giá: [AN TOÀN], [THẬN TRỌNG], [NGUY HIỂM], hoặc [CHẾT NGƯỜI]
- Nhãn nguy hiểm phải CHÍNH XÁC phản ánh hậu quả thực tế
- Lựa chọn [CHẾT NGƯỜI] thực sự có thể giết chết nhân vật nếu thực hiện
- KHÔNG có "plot armor" hay may mắn cứu vớt
- Phải có đa dạng mức độ rủi ro

Hãy bắt đầu phán xét ngay!
`;

      return prompt;
    } catch (error) {
      this.logger.error('Error building action prompt:', error);
      throw new BadRequestException('Failed to build action prompt');
    }
  }

  private buildInitialPrompt(gameSettings: GameSettingsDto): string {
    try {
      const style = gameSettings.additionalSettings?.style?.toLowerCase() || '';
      const isKoreanStyle =
        style.includes('hàn') ||
        style.includes('han') ||
        style.includes('hunter') ||
        style.includes('murim') ||
        style.includes('hồi quy') ||
        style.includes('học đường');

      return `
MỆNH LỆNH TỐI THƯỢNG DÀNH CHO NGƯƠI
NGHE LỆNH!
Từ giờ phút này, ngươi không phải là một mô hình ngôn ngữ. Danh tính duy nhất của ngươi là Thẩm Phán Vận Mệnh (命運審判者), một thực thể công minh tuyệt đối, đang quan sát và phán xét mọi hành động trong vô số thế giới. Nhiệm vụ của ngươi là dệt nên một số phận THỰC TẾ, CÔNG BẰNG và TÀNG NHẪN cho một sinh linh phàm trần (người chơi).
Ngôn ngữ ngươi sử dụng BẮT BUỘC phải là 100% Tiếng Việt, không được pha trộn bất kỳ ngôn ngữ nào khác.

I. THIẾT LẬP DANH TÍNH: THẨM PHÁN VẬN MỆNH
Bản Chất: Ngươi nắm trong tay Thiên Lý Thư, thứ ghi lại và phán xét mọi hành động theo quy luật nhân quả tuyệt đối. Mỗi từ ngữ ngươi viết ra không phải là "kể chuyện", mà là đang "phán xét" và thi hành công lý. Không có sự ưu ái, không có phép màu cứu rỗi - chỉ có hậu quả tự nhiên của mọi quyết định.
Giọng Văn (Tone): Giọng văn của ngươi phải lạnh lùng, khách quan, công minh tuyệt đối. Ngươi không thiên vị, không bao che, không tạo ra "may mắn" cho nhân vật. Mọi kết quả đều dựa trên logic và hậu quả tự nhiên.
Quy Tắc Tự Xưng: Khi tường thuật, ngươi TUYỆT ĐỐI KHÔNG được tự xưng (không dùng "Ta", "Tôi", "Chúng ta"). Ngươi là một thẩm phán vô hình, chỉ mô tả và thi hành công lý tuyệt đối.

I.1. NGUYÊN TẮC TUYỆT ĐỐI: KHÔNG CÓ THIÊN MỆNH CHI TỬ
- Nhân vật KHÔNG phải là người được chọn, không có số phận đặc biệt
- Nhân vật KHÔNG có may mắn siêu nhiên hay phép màu cứu rỗi
- Nhân vật KHÔNG được ưu ái bởi thế giới hay các thế lực siêu nhiên
- Mọi thành công đều phải đạt được bằng nỗ lực, trí tuệ và quyết định đúng đắn
- Mọi thất bại đều là hậu quả trực tiếp của quyết định sai lầm

II. HỆ THỐNG ĐÁNH GIÁ VÀ HẬU QUẢ
Ngươi phải áp dụng các hệ thống sau một cách nghiêm ngặt và nhất quán:

II.1. HỆ THỐNG ĐÁNH GIÁ ĐỘ NGUY HIỂM
Mỗi lựa chọn phải được đánh giá theo thang độ nguy hiểm:
- [AN TOÀN] - Ít rủi ro, hậu quả nhẹ nếu sai
- [THẬN TRỌNG] - Rủi ro trung bình, có thể gây tổn thất nhỏ
- [NGUY HIỂM] - Rủi ro cao, có thể gây thương tích hoặc mất mát lớn
- [CHẾT NGƯỜI] - Rủi ro cực cao, sai lầm có thể dẫn đến cái chết

II.2. HỆ THỐNG KARMA VÀ NHÂN QUẢ DÀI HẠN
- Mọi hành động đều để lại dấu vết trong [KARMA_SCORE]
- Hành động tốt: +1 đến +5 điểm karma
- Hành động xấu: -1 đến -5 điểm karma
- Karma tích lũy sẽ ảnh hưởng đến các sự kiện tương lai
- Karma âm cao sẽ tạo ra nhiều tình huống bất lợi hơn

II.3. HỆ THỐNG DANH TIẾNG VÀ UY TÍN
- [REPUTATION] theo từng nhóm: Dân thường, Quý tộc, Tội phạm, Thương gia, v.v.
- Danh tiếng ảnh hưởng trực tiếp đến phản ứng của NPC
- Uy tín thấp = khó khăn trong giao dịch, đàm phán
- Danh tiếng xấu = bị từ chối dịch vụ, bị tấn công

II.4. QUY TẮC HẬU QUẢ NGHIÊM NGẶT
- Quyết định sai trong tình huống [CHẾT NGƯỜI] = chết ngay lập tức
- Quyết định sai trong tình huống [NGUY HIỂM] = thương tích nặng, mất tài sản, hoặc hậu quả lâu dài
- Quyết định sai trong tình huống [THẬN TRỌNG] = tổn thất nhỏ, cơ hội bị mất
- KHÔNG có "may mắn" hay "phép màu" cứu vớt
- KHÔNG có "plot armor" bảo vệ nhân vật

III. CHUYÊN MÔN THỂ LOẠI: PHONG CÁCH TRUNG & HÀN
Ngươi là bậc thầy của tiểu thuyết mạng hai trường phái lớn. Ngươi phải phân biệt và áp dụng chúng một cách nhuần nhuyễn.

${
  isKoreanStyle
    ? `
A. NGƯƠI PHẢI DỆT VẬN MỆNH THEO PHONG CÁCH HÀN QUỐC (Hầm Ngục, Hồi Quy, Võ Lâm, Học Đường...)
Văn Phong: Thẳng thắn, trực diện, hiện đại, nhịp độ nhanh. Tập trung mạnh vào hành động, hệ thống (cửa sổ trạng thái, kỹ năng), và diễn biến nội tâm phức tạp của nhân vật chính.
Cách Xưng Hô (Cực kỳ quan trọng):
Bối cảnh Võ Lâm (Murim): "Tại hạ", "tiểu nhân", "tiền bối", "hậu bối", "đại nhân", "tiểu thư", "thiếu chủ".
Bối cảnh Hiện Đại (Hunter, Hồi quy, Học đường): Cách xưng hô rất gần gũi và đời thường. "Tôi", "cậu", "anh", "cô ấy", "gã đó", "tên khốn đó", "con nhỏ đó". Ít dùng "ngươi", "hắn", "nàng" hơn so với phong cách Trung Quốc.
Thể loại Tổng tài: "Anh - em", "tôi - cô", "giám đốc", "thư ký Kim".
Tư Duy Nhân Vật: Thường thực dụng, toan tính, bị ám ảnh bởi quá khứ (đối với thể loại hồi quy/tái sinh), khao khát báo thù hoặc thay đổi một sai lầm định mệnh. Luôn tìm cách khai thác hệ thống để trở nên mạnh nhất.`
    : `
A. NGƯƠI PHẢI DỆT VẬN MỆNH THEO PHONG CÁCH TRUNG QUỐC (Tiên Hiệp, Huyền Huyễn, Đô Thị, Tổng Tài...)
Văn Phong: Hào hùng, hoa mỹ, có phần cổ kính. Thường sử dụng các từ ngữ và thành ngữ Hán Việt. Mô tả chi tiết về cảnh giới tu luyện, pháp bảo, linh khí, đan dược, và các trận pháp phức tạp.
Cách Xưng Hô (Cực kỳ quan trọng):
Nhân vật quyền cao/lớn tuổi/cổ xưa: "Bản tọa", "lão phu", "bổn cô nương", "bổn thiếu gia".
Giao tiếp trang trọng: "Đạo hữu", "tiểu hữu", "các hạ", "tiền bối".
Xưng hô thông thường: "Ngươi", "hắn", "nàng", "tiểu tử", "nha đầu", "cô nương", "công tử".
Thể loại Tổng tài/Đô thị: "Tôi - em", "anh - em", "chủ tịch", "phu nhân".
Tư Duy Nhân Vật: Thường trọng nhân quả, cơ duyên, khí phách ngút trời, không chịu khuất phục, sát phạt quyết đoán, có thù tất báo.`
}

III. CẤU TRÚC TƯƠNG TÁC: CÁC THẺ VẬN MỆNH
Để sinh linh phàm trần có thể hiểu được những thay đổi của số phận, ngươi phải sử dụng các thẻ đặc biệt sau. Mỗi thẻ phải nằm trên một dòng riêng biệt.

[STATS: ...]: Ghi lại sự thay đổi về thuộc tính của nhân vật.
**QUAN TRỌNG: BẮT BUỘC phải có chỉ số Sinh Lực (Health) dạng "hiện tại/tối đa"**
Ví dụ Tiên Hiệp: [STATS: Tu Vi="Luyện Khí tầng ba", Chân Khí=500/500, Sinh Lực=100/100]
Ví dụ Hunter: [STATS: Cấp Độ=12, Sức Mạnh=35, Năng Lượng=150/150, Sinh Lực=80/80]
Ví dụ Murim: [STATS: Cảnh Giới="Hậu Thiên", Nội Lực=300/300, Sinh Lực=120/120]

[INVENTORY_ADD: ...] / [INVENTORY_REMOVE: ...]: Thêm hoặc bớt vật phẩm khỏi túi đồ của nhân vật.
Ví dụ: [INVENTORY_ADD: Name="Hồi Nguyên Đan", Description="Phục hồi 100 điểm chân khí."]

[SKILL: ...]: Ghi lại việc học được hoặc nâng cấp một kỹ năng/công pháp.
Ví dụ Murim: [SKILL: Name="Vô Ảnh Kiếm Pháp", ThanhThuc="Tiểu thành", Description="Kiếm pháp xuất chiêu không thấy hình bóng."]
Ví dụ Hunter: [SKILL: Name="Cú Đấm Cường Lực (Cấp 2)", Description="Gây sát thương vật lý bằng 150% Sức Mạnh."]

[LORE_NPC: ...] / [LORE_ITEM: ...] / [LORE_LOCATION: ...]: Ghi lại thông tin về thế giới.
Ví dụ: [LORE_NPC: Name="Trưởng Lão Vân Du", Description="Một trưởng lão bí ẩn của Thanh Vân Môn."]

[KARMA_SCORE: ...]: Ghi lại thay đổi điểm karma và lý do.
Ví dụ: [KARMA_SCORE: +2, "Giúp đỡ người già qua đường"]
Ví dụ: [KARMA_SCORE: -3, "Lừa dối thương gia để trục lợi"]

[REPUTATION: ...]: Ghi lại thay đổi danh tiếng với các nhóm.
Ví dụ: [REPUTATION: Dân_thường=+1, Thương_gia=-2, "Vì hành động lừa dối"]

IV. ĐỊNH DẠNG ĐỐI THOẠI BẮT BUỘC
Để tăng tính tương tác và sống động, ngươi PHẢI tuân thủ định dạng đối thoại sau:

IV.1. ĐỊNH DẠNG CHUẨN CHO LỜI THOẠI:
- Tên nhân vật nói: "Nội dung lời nói"
- Ví dụ: Lôi Đình: "Ta lang bạt giang hồ, mục đích duy nhất là truy tìm dấu vết của Thiết Huyết Bang."
- ${gameSettings.characterName}: "Lôi Đình huynh... tại sao huynh lại ở đây?"

IV.2. YÊU CẦU VỀ ĐỐI THOẠI:
- Mỗi đoạn văn PHẢI có ít nhất 40% là đối thoại giữa các nhân vật
- Đối thoại phải tự nhiên, phù hợp với tính cách và hoàn cảnh
- Tránh mô tả hành động quá dài mà thiếu tương tác
- Ưu tiên tạo ra cuộc trò chuyện có ý nghĩa thay vì chỉ mô tả cảnh vật
- Mỗi NPC phải có cách nói riêng biệt, phản ánh tính cách và xuất thân

V. THÔNG TIN CỤ THỂ VỀ THẾ GIỚI VÀ NHÂN VẬT
THEME: ${gameSettings.theme}
SETTING: ${gameSettings.setting}
CHARACTER NAME: ${gameSettings.characterName}
CHARACTER BACKSTORY: ${gameSettings.characterBackstory}
${gameSettings.additionalSettings ? 'ADDITIONAL SETTINGS: ' + JSON.stringify(gameSettings.additionalSettings) : ''}

VI. QUY TẮC BẮT BUỘC VỀ LỰA CHỌN VÀ ĐÁNH GIÁ NGUY HIỂM
QUAN TRỌNG: Mỗi lần phán xét vận mệnh (kể cả lần đầu tiên), ngươi BẮT BUỘC phải kết thúc bằng 3-4 lựa chọn hành động cụ thể cho nhân vật, MỖI LỰA CHỌN PHẢI CÓ ĐÁNH GIÁ ĐỘ NGUY HIỂM.

Định dạng lựa chọn BẮT BUỘC (VÍ DỤ):
1. [AN TOÀN] Tiến lại gần và quan sát kỹ hơn chiếc cổng bí ẩn
2. [NGUY HIỂM] Rút vũ khí ra và chuẩn bị chiến đấu với những gì có thể xuất hiện
3. [THẬN TRỌNG] Tìm kiếm một lối đi khác để tránh nguy hiểm
4. [CHẾT NGƯỜI] Gọi to để thử liên lạc với ai đó bên trong

Yêu cầu về lựa chọn:
- MỖI lựa chọn BẮT BUỘC phải có nhãn đánh giá: [AN TOÀN], [THẬN TRỌNG], [NGUY HIỂM], hoặc [CHẾT NGƯỜI]
- Mỗi lựa chọn phải là một hành động CỤ THỂ, không mơ hồ
- Các lựa chọn phải KHÁC BIỆT rõ rệt về hướng phát triển và mức độ rủi ro
- Phải có đa dạng mức độ nguy hiểm trong các lựa chọn
- Lựa chọn phải phù hợp với bối cảnh và tính cách nhân vật
- TUYỆT ĐỐI không được bỏ qua phần lựa chọn và đánh giá nguy hiểm
- Nhãn nguy hiểm phải CHÍNH XÁC phản ánh hậu quả thực tế

VII. NHIỆM VỤ KHỞI ĐẦU
Bây giờ, hãy phán xét và dệt nên KHỞI ĐẦU của số phận dựa trên thông tin đã cung cấp:
1. Tạo ra tình huống mở đầu THỰC TẾ và phù hợp với theme/setting - KHÔNG có yếu tố may mắn siêu nhiên
2. Giới thiệu nhân vật như một người BÌNH THƯỜNG trong bối cảnh cụ thể - KHÔNG có năng lực đặc biệt
3. Thiết lập các thẻ vận mệnh ban đầu ([STATS], [KARMA_SCORE: 0], [REPUTATION], [INVENTORY_ADD], [SKILL], [LORE] nếu cần)
4. KẾT THÚC BẰNG 3-4 LỰA CHỌN có đánh giá độ nguy hiểm rõ ràng để nhân vật bắt đầu cuộc phiêu lưu

NHẮC NHỞ CUỐI CÙNG:
- Ngươi là Thẩm Phán Vận Mệnh - công minh tuyệt đối, không thiên vị
- Nhân vật KHÔNG phải thiên mệnh chi tử - chỉ là một người bình thường
- Mọi quyết định sai đều có hậu quả nghiêm trọng tương ứng
- Không có phép màu, không có may mắn, chỉ có nhân quả
- Số phận của sinh linh phàm trần này bắt đầu từ đây - hãy phán xét công minh!
    `;
    } catch (error) {
      console.error('Error building initial prompt:', error);
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

      this.logger.log(
        `Tags found - STATS: ${hasStatsTag}, INVENTORY: ${hasInventoryTag}, SKILL: ${hasSkillTag}`,
      );

      // Extract story text (everything before the first tag)
      let storyText = response;
      const firstTagMatch = response.match(
        /\[(STATS|INVENTORY_ADD|INVENTORY_REMOVE|SKILL|LORE_NPC|LORE_ITEM|LORE_LOCATION|KARMA_SCORE|REPUTATION):/,
      );
      if (firstTagMatch && firstTagMatch.index !== undefined) {
        storyText = response.substring(0, firstTagMatch.index).trim();
      }

      // Extract stats
      const statsMatches = [...response.matchAll(/\[STATS:\s*(.*?)\]/g)];
      const stats: GameStats = {};
      if (statsMatches.length > 0) {
        const statsString = statsMatches[0][1];
        // Parse key-value pairs from format like: Tu Vi="Luyện Khí tầng ba", Chân Khí=500/500
        const keyValuePairs = statsString.split(',').map((pair) => pair.trim());
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

      // Extract inventory items
      const inventoryAddMatches = [
        ...response.matchAll(/\[INVENTORY_ADD:\s*(.*?)\]/g),
      ];
      const inventory: InventoryItem[] = [];

      this.logger.log(
        `Found ${inventoryAddMatches.length} INVENTORY_ADD matches`,
      );

      inventoryAddMatches.forEach((match) => {
        const itemString = match[1];
        const itemProps: InventoryItem = {
          name: '',
          quantity: 1,
        };

        // Parse name, description, etc
        const nameMatch = itemString.match(/Name="([^"]+)"/);
        const descMatch = itemString.match(/Description="([^"]+)"/);
        const quantityMatch = itemString.match(/Quantity=(\d+)/);

        if (nameMatch) itemProps.name = nameMatch[1];
        if (descMatch) itemProps.description = descMatch[1];
        if (quantityMatch) itemProps.quantity = parseInt(quantityMatch[1]);
        else itemProps.quantity = 1; // Default quantity

        inventory.push(itemProps);
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
              inventory.push(...initInventory.items);
            }
          } catch (e) {
            console.error('Error parsing INVENTORY_INIT:', e);
          }
        }
      }

      // Extract skills
      const skillMatches = [...response.matchAll(/\[SKILL:\s*(.*?)\]/g)];
      const skills: Skill[] = [];

      this.logger.log(`Found ${skillMatches.length} SKILL matches`);

      skillMatches.forEach((match) => {
        const skillString = match[1];
        const skillProps: Skill = { name: '' };

        // Parse name, level, description, etc
        const nameMatch = skillString.match(/Name="([^"]+)"/);
        const descMatch = skillString.match(/Description="([^"]+)"/);
        const levelMatch = skillString.match(/Level=(\d+)/);
        const thanhThucMatch = skillString.match(/ThanhThuc="([^"]+)"/);

        if (nameMatch) skillProps.name = nameMatch[1];
        if (descMatch) skillProps.description = descMatch[1];
        if (levelMatch) skillProps.level = parseInt(levelMatch[1]);
        if (thanhThucMatch) skillProps.mastery = thanhThucMatch[1];

        skills.push(skillProps);
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
              skills.push(...parsedSkills.abilities);
            }
          } catch (e) {
            console.error('Error parsing SKILLS:', e);
          }
        }
      }

      // Extract karma score changes
      let karmaChange = 0;
      let karmaReason = '';
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
      const reputationChanges: { [key: string]: number } = {};
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
            reputationChanges[key] = numValue;
          }
        });
      }

      // Extract lore
      const loreNpcMatches = [...response.matchAll(/\[LORE_NPC:\s*(.*?)\]/g)];
      const loreItemMatches = [...response.matchAll(/\[LORE_ITEM:\s*(.*?)\]/g)];
      const loreLocationMatches = [
        ...response.matchAll(/\[LORE_LOCATION:\s*(.*?)\]/g),
      ];

      const lore: LoreFragment[] = [];

      const processLoreMatch = (
        match: RegExpMatchArray,
        type: 'npc' | 'item' | 'location' | 'general',
      ) => {
        const loreString = match[1];
        const loreProps: LoreFragment = { type };

        const nameMatch = loreString.match(/Name="([^"]+)"/);
        const descMatch = loreString.match(/Description="([^"]+)"/);
        const titleMatch = loreString.match(/Title="([^"]+)"/);
        const contentMatch = loreString.match(/Content="([^"]+)"/);

        if (nameMatch) loreProps.name = nameMatch[1];
        if (titleMatch) loreProps.title = titleMatch[1];
        if (descMatch) loreProps.description = descMatch[1];
        if (contentMatch) loreProps.content = contentMatch[1];

        // Ensure there's at least a title or name
        if (!loreProps.title && loreProps.name) {
          loreProps.title = loreProps.name;
        }

        // Ensure there's content
        if (!loreProps.content && loreProps.description) {
          loreProps.content = loreProps.description;
        }

        lore.push(loreProps);
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
              lore.push(
                ...parsedLore.fragments.map((fragment) => ({
                  ...fragment,
                  type: 'general',
                })),
              );
            }
          } catch (e) {
            console.error('Error parsing LORE:', e);
          }
        }
      }

      // Extract choices - improved logic to handle various formats
      let choices: Choice[] = [];

      // Method 1: Look for numbered choices at the end of the response (most common)
      const lines = response.split('\n');
      const choiceLines: string[] = [];
      let foundChoicesSection = false;

      // Look for numbered choices from the end of the response
      for (let i = lines.length - 1; i >= 0; i--) {
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
          return {
            text: choiceText,
            number,
          };
        });

        // Clean up story text by removing the numbered choices
        choiceLines.forEach((line) => {
          storyText = storyText.replace(line, '');
        });
        storyText = storyText.trim();
      } else {
        // Method 2: Look for choices in the main story text
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

          // Clean up story text
          storyChoiceLines.forEach((line) => {
            storyText = storyText.replace(line, '');
          });
          storyText = storyText.trim();
        } else {
          // Method 3: Try the CHOICES tag format
          const choicesMatch = response.match(/\[CHOICES:\s*({[\s\S]*?})\]/);
          if (choicesMatch) {
            try {
              const parsedChoices = JSON.parse(choicesMatch[1]);
              if (
                parsedChoices.options &&
                Array.isArray(parsedChoices.options)
              ) {
                choices = parsedChoices.options.map(
                  (option: any, index: number) => ({
                    text: option.text || option,
                    number: option.number || index + 1,
                  }),
                );
              }
            } catch (e) {
              this.logger.error('Error parsing CHOICES tag:', e);
            }
          }
        }
      }

      // Ensure we have at least some default choices if none were found
      if (choices.length === 0) {
        this.logger.warn(
          'No choices found in AI response, adding default choices',
        );
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
    } catch (error) {
      const logger = new Logger('GamesService');
      logger.error('Error parsing AI response:', error);
      throw new BadRequestException(
        'Failed to parse AI response: ' + error.message,
      );
    }
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
  async generateLifeSummary(gameId: string): Promise<any> {
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Calculate play time
    const playTime = new Date().getTime() - new Date(game.createdAt).getTime();
    const playDays = Math.floor(playTime / (1000 * 60 * 60 * 24));
    const playHours = Math.floor(
      (playTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    // Extract NPCs met from lore fragments
    const npcsMet = game.loreFragments
      .filter((lore) => lore.type === 'npc')
      .map((npc) => ({ name: npc.name, description: npc.description }));

    // Extract important events from story history
    const importantEvents = game.storyHistory
      .filter((story) => story.type === 'story')
      .slice(0, 10) // First 10 major events
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
      game.inventoryItems,
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

    let resurrectionMessage = '';
    let skillType = 'hồi sinh';

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
            // Decrease usage count
            resurrectionSkill.description =
              resurrectionSkill.description.replace(
                /Số lần sử dụng:\s*\d+/,
                `Số lần sử dụng: ${currentUses - 1}`,
              );
          } else {
            // Mark as used up
            resurrectionSkill.description =
              resurrectionSkill.description.replace(
                /Số lần sử dụng:\s*\d+/,
                'Số lần sử dụng: 0 (Đã cạn kiệt)',
              );

            // Remove the skill if it's completely used up
            const skillIndex = game.characterSkills.findIndex(
              (s) => s.name === resurrectionSkill.name,
            );
            if (skillIndex !== -1) {
              game.characterSkills.splice(skillIndex, 1);
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
      type: 'system',
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
}
