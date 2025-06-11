import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GameGenre } from './entities/character.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiAiService {
  private readonly defaultGenerativeAI: GoogleGenerativeAI;
  private readonly defaultModel: any;
  private readonly logger = new Logger(GeminiAiService.name);
  private readonly allowUserApiKeys: boolean;
  private readonly defaultApiKey: string;

  constructor(private configService: ConfigService) {
    // Get configuration from environment variables
    this.defaultApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.allowUserApiKeys =
      this.configService.get<string>('ALLOW_USER_API_KEYS') === 'true';

    // Initialize default AI model
    this.defaultGenerativeAI = new GoogleGenerativeAI(this.defaultApiKey);
    this.defaultModel = this.defaultGenerativeAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
  }

  // Get the appropriate model based on user context
  private getModel(userApiKey?: string): any {
    // If user API keys are allowed and a key is provided, use it
    if (this.allowUserApiKeys && userApiKey) {
      try {
        const userGenerativeAI = new GoogleGenerativeAI(userApiKey);
        return userGenerativeAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
        });
      } catch (error) {
        this.logger.warn(
          `Failed to initialize with user API key: ${error.message}`,
        );
        // Fall back to default model if user's key fails
        return this.defaultModel;
      }
    }

    // Otherwise use the default model
    return this.defaultModel;
  }

  async generateStoryContent(
    prompt: string,
    gameContext: any,
  ): Promise<string> {
    try {
      const character = gameContext.character;
      if (!character) {
        throw new Error(
          'Character information is required for story generation',
        );
      }

      // Get user API key if available
      const userApiKey = gameContext.user?.geminiApiKey;
      // Get the appropriate model
      const model = this.getModel(userApiKey);

      const primaryGenre = character.primaryGenre || GameGenre.FANTASY;
      const secondaryGenres = character.secondaryGenres || [];
      const customGenreDescription = character.customGenreDescription || '';

      // Build character info based on genres
      let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;

      // Add all relevant attributes
      characterInfo += 'Attributes: ';
      const attributes = character.attributes;
      const relevantAttributes = this.getRelevantAttributes(
        primaryGenre,
        secondaryGenres,
      );

      for (const attr of relevantAttributes) {
        if (attributes[attr] !== undefined) {
          characterInfo += `${this.formatAttributeName(attr)} ${attributes[attr]}, `;
        }
      }

      // Remove trailing comma and space
      characterInfo = characterInfo.replace(/, $/, '. ');

      // Add inventory information
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

      // Add currency information
      if (character.inventory && character.inventory.currency) {
        characterInfo += 'Currency: ';
        Object.entries(character.inventory.currency).forEach(
          ([currency, amount], index, array) => {
            characterInfo += `${amount} ${currency}`;
            if (index < array.length - 1) {
              characterInfo += ', ';
            }
          },
        );
        characterInfo += '. ';
      }

      // Add skills information
      if (character.skills && character.skills.length > 0) {
        characterInfo += 'Skills: ' + character.skills.join(', ') + '. ';
      }

      // Add special abilities if any
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

      // Add game state information
      let gameStateInfo = '';
      if (gameContext.gameState) {
        gameStateInfo = `
        Current Location: ${gameContext.gameState.currentLocation || 'Unknown'}
        Time: Day ${gameContext.gameState.time?.day || 1}, ${
          gameContext.gameState.time?.hour || 0
        }:${gameContext.gameState.time?.minute || 0}
        Weather: ${gameContext.gameState.weather || 'Clear'}
        `;

        if (
          gameContext.gameState.flags &&
          Object.keys(gameContext.gameState.flags).length > 0
        ) {
          gameStateInfo += 'Story Flags: ';
          Object.entries(gameContext.gameState.flags).forEach(
            ([flag, value]) => {
              gameStateInfo += `${flag}: ${value}, `;
            },
          );
          gameStateInfo = gameStateInfo.replace(/, $/, '\n');
        }
      }

      // Add previous choice information if available
      let previousChoiceInfo = '';
      if (gameContext.previousChoice) {
        previousChoiceInfo = `The character's previous action was: "${gameContext.previousChoice}".`;
      }

      // Get genre-specific instructions
      const genreInstructions = this.getGenreSpecificInstructions(primaryGenre);

      // Get secondary genre influences
      let secondaryGenreInfluences = '';
      if (secondaryGenres && secondaryGenres.length > 0) {
        secondaryGenreInfluences =
          'Câu chuyện này cũng kết hợp các yếu tố từ: ';
        secondaryGenres.forEach((genre, index) => {
          secondaryGenreInfluences += this.getGenreName(genre);
          if (index < secondaryGenres.length - 1) {
            secondaryGenreInfluences += ', ';
          }
        });
        secondaryGenreInfluences += '. ';
      }

      // Add custom genre description if available
      let customGenreInfo = '';
      if (customGenreDescription) {
        customGenreInfo = `Câu chuyện này có các yếu tố tùy chỉnh sau: ${customGenreDescription}. `;
      }

      // Construct the full prompt
      const fullPrompt = `
      Bạn là một người kể chuyện sáng tạo cho một trò chơi phiêu lưu tương tác bằng văn bản.
      
      ${characterInfo}
      
      ${gameStateInfo}
      
      ${previousChoiceInfo}
      
      Thể loại chính: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      ${genreInstructions}
      
      Dựa trên bối cảnh trên và gợi ý sau đây, hãy tạo phần tiếp theo của câu chuyện:
      
      "${prompt}"
      
      Cung cấp mô tả chi tiết, phong phú về khung cảnh, bao gồm chi tiết cảm giác, cảm xúc nhân vật và các yếu tố môi trường.
      Viết ở ngôi thứ hai (ví dụ: "Bạn nhìn thấy một lâu đài cao vút ở đằng xa").
      Giữ câu trả lời tập trung vào kể chuyện, không có bình luận về cách viết.
      Độ dài câu trả lời: 150-250 từ.
      `;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      this.logger.error(
        `Error generating story content: ${error.message}`,
        error.stack,
      );
      return 'The storyteller pauses, gathering thoughts before continuing the tale...';
    }
  }

  async generateChoices(
    storyContent: string,
    gameContext: any,
  ): Promise<any[]> {
    try {
      const character = gameContext.character;
      if (!character) {
        throw new Error(
          'Character information is required for choice generation',
        );
      }

      // Get user API key if available
      const userApiKey = gameContext.user?.geminiApiKey;
      // Get the appropriate model
      const model = this.getModel(userApiKey);

      const primaryGenre = character.primaryGenre || GameGenre.FANTASY;
      const secondaryGenres = character.secondaryGenres || [];
      const customGenreDescription = character.customGenreDescription || '';

      // Build character info based on genres (similar to generateStoryContent)
      let characterInfo = `Character: ${character.name}, a level ${character.level} ${character.characterClass}. `;

      // Add all relevant attributes
      characterInfo += 'Attributes: ';
      const attributes = character.attributes;
      const relevantAttributes = this.getRelevantAttributes(
        primaryGenre,
        secondaryGenres,
      );

      for (const attr of relevantAttributes) {
        if (attributes[attr] !== undefined) {
          characterInfo += `${this.formatAttributeName(attr)} ${attributes[attr]}, `;
        }
      }

      // Remove trailing comma and space
      characterInfo = characterInfo.replace(/, $/, '. ');

      // Add inventory information
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

      // Add skills information
      if (character.skills && character.skills.length > 0) {
        characterInfo += 'Skills: ' + character.skills.join(', ') + '. ';
      }

      // Get genre-specific attributes for choices
      const genreAttributes = this.getGenreAttributes(primaryGenre);
      const genreItems = this.getGenreItems(primaryGenre);

      // Get secondary genre influences
      let secondaryGenreInfluences = '';
      if (secondaryGenres && secondaryGenres.length > 0) {
        secondaryGenreInfluences = 'Kết hợp thêm các yếu tố từ: ';
        secondaryGenres.forEach((genre, index) => {
          secondaryGenreInfluences += this.getGenreName(genre);
          if (index < secondaryGenres.length - 1) {
            secondaryGenreInfluences += ', ';
          }
        });
        secondaryGenreInfluences += '. ';
      }

      // Add custom genre description if available
      let customGenreInfo = '';
      if (customGenreDescription) {
        customGenreInfo = `Cân nhắc các yếu tố tùy chỉnh này: ${customGenreDescription}. `;
      }

      // Determine if this is a combat scene
      const isCombatScene = gameContext.isCombatScene || false;
      let combatInfo = '';
      if (isCombatScene) {
        combatInfo = `
        Đây là CẢNH CHIẾN ĐẤU. Tạo ra các lựa chọn bao gồm:
        - Ít nhất một hành động tấn công
        - Ít nhất một hành động phòng thủ hoặc né tránh
        - Ít nhất một hành động sáng tạo hoặc liên quan đến môi trường
        `;
      }

      // Construct the full prompt
      const fullPrompt = `
      Bạn đang tạo ra các lựa chọn có ý nghĩa cho một trò chơi phiêu lưu tương tác bằng văn bản.
      
      ${characterInfo}
      
      Dựa trên đoạn câu chuyện sau đây, hãy tạo ra 3-4 lựa chọn khác nhau cho người chơi:
      
      "${storyContent}"
      
      Thể loại chính: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      ${combatInfo}
      
      Các lựa chọn phải phù hợp với thể loại chính và phản ánh chủ đề và đặc trưng của thể loại đó.
      Mỗi lựa chọn phải là một hành động rõ ràng mà nhân vật có thể thực hiện.
      
      Các thuộc tính liên quan đến thể loại này bao gồm: ${genreAttributes.join(', ')}
      Các loại vật phẩm liên quan đến thể loại này bao gồm: ${genreItems.join(', ')}
      
      Định dạng mỗi lựa chọn dưới dạng đối tượng JSON với các thuộc tính sau:
      1. text: Văn bản lựa chọn hiển thị cho người chơi (1-15 từ)
      2. consequences: Hậu quả tiềm tàng (không hiển thị cho người chơi)
        - attributeChanges: {thuộc_tính: giá_trị_số, ...}
        - itemGains: [{id: chuỗi, name: tên_vật_phẩm, quantity: số_lượng}, ...]
        - itemLosses: [{id: chuỗi, name: tên_vật_phẩm, quantity: số_lượng}, ...]
        - currencyChanges: {loại_tiền_tệ: giá_trị_số, ...}
        - flags: {tên_cờ: giá_trị, ...}
        - locationChange: chuỗi (nếu có)
      3. nextPrompt: Mô tả ngắn gọn về những gì xảy ra tiếp theo nếu lựa chọn này được chọn
      
      Chỉ trả về một mảng JSON hợp lệ chứa các đối tượng lựa chọn, không có văn bản bổ sung.
      `;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const responseText = response.text();

      // Extract the JSON array from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid choice JSON');
      }

      const choicesJson = jsonMatch[0];
      return JSON.parse(choicesJson);
    } catch (error) {
      this.logger.error(
        `Error generating choices: ${error.message}`,
        error.stack,
      );
      // Return default choices if generation fails
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

  async generateCombatScene(character: any, location: string): Promise<any> {
    try {
      const primaryGenre = character.primaryGenre || GameGenre.FANTASY;
      const secondaryGenres = character.secondaryGenres || [];
      const customGenreDescription = character.customGenreDescription || '';

      // Get user API key if available from character's user
      const userApiKey = character.user?.geminiApiKey;
      // Get the appropriate model
      const model = this.getModel(userApiKey);

      // Get relevant attributes for combat
      const relevantAttributes = this.getRelevantAttributes(
        primaryGenre,
        secondaryGenres,
      );
      let attributesInfo = '';

      for (const attr of relevantAttributes) {
        if (character.attributes[attr] !== undefined) {
          attributesInfo += `${this.formatAttributeName(attr)}: ${character.attributes[attr]}, `;
        }
      }

      // Remove trailing comma and space
      attributesInfo = attributesInfo.replace(/, $/, '');

      // Get secondary genre influences
      let secondaryGenreInfluences = '';
      if (secondaryGenres && secondaryGenres.length > 0) {
        secondaryGenreInfluences = 'Kết hợp thêm các yếu tố từ: ';
        secondaryGenres.forEach((genre, index) => {
          secondaryGenreInfluences += this.getGenreName(genre);
          if (index < secondaryGenres.length - 1) {
            secondaryGenreInfluences += ', ';
          }
        });
        secondaryGenreInfluences += '. ';
      }

      // Add custom genre description if available
      let customGenreInfo = '';
      if (customGenreDescription) {
        customGenreInfo = `Cân nhắc các yếu tố tùy chỉnh này: ${customGenreDescription}. `;
      }

      const prompt = `
      Tạo ra một cuộc gặp gỡ chiến đấu cho trò chơi phiêu lưu tương tác bằng văn bản.
      
      Nhân vật: ${character.name}, cấp độ ${character.level} ${
        character.characterClass
      }
      Thuộc tính: ${attributesInfo}
      Địa điểm: ${location}
      
      Thể loại chính: ${this.getGenreName(primaryGenre)}
      ${secondaryGenreInfluences}
      ${customGenreInfo}
      
      Tạo một đối tượng JSON với các nội dung sau:
      1. Mô tả về kẻ thù và tình huống chiến đấu
      2. Dữ liệu kẻ thù phù hợp với cấp độ của nhân vật và thể loại
      
      JSON nên có cấu trúc như sau:
      {
        "enemies": [
          {
            "id": chuỗi,
            "name": tên kẻ thù,
            "level": số cấp độ,
            "health": điểm máu,
            "attributes": {cặp khóa-giá trị của các thuộc tính liên quan},
            "abilities": [mảng chuỗi các khả năng đặc biệt]
          }
        ],
        "rewards": {
          "experience": số kinh nghiệm,
          "gold": số vàng (hoặc tiền tệ phù hợp với thể loại),
          "items": [
            {
              "id": chuỗi,
              "name": tên vật phẩm,
              "quantity": số lượng,
              "dropChance": tỷ lệ rơi (0-1)
            }
          ]
        },
        "description": Mô tả tường thuật của cảnh chiến đấu
      }
      
      Chỉ trả về một đối tượng JSON hợp lệ, không có văn bản bổ sung.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      // Extract the JSON object from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to generate valid combat scene JSON');
      }

      const combatJson = jsonMatch[0];
      return JSON.parse(combatJson);
    } catch (error) {
      this.logger.error(
        `Error generating combat scene: ${error.message}`,
        error.stack,
      );
      // Return a default combat scene if generation fails
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
        description:
          'A shadowy figure emerges, challenging you to combat. Prepare yourself!',
      };
    }
  }

  // Helper methods for genre-specific content
  private getGenreName(genre: GameGenre): string {
    switch (genre) {
      case GameGenre.FANTASY:
        return 'Giả tưởng (Fantasy)';
      case GameGenre.SCIFI:
        return 'Khoa học viễn tưởng (Science Fiction)';
      case GameGenre.CYBERPUNK:
        return 'Cyberpunk';
      case GameGenre.XIANXIA:
        return 'Tiên Hiệp (Xianxia)';
      case GameGenre.WUXIA:
        return 'Võ Hiệp (Wuxia)';
      case GameGenre.HORROR:
        return 'Kinh dị (Horror)';
      case GameGenre.MODERN:
        return 'Hiện đại (Modern)';
      case GameGenre.POSTAPOCALYPTIC:
        return 'Hậu tận thế (Post-Apocalyptic)';
      case GameGenre.STEAMPUNK:
        return 'Steampunk';
      case GameGenre.HISTORICAL:
        return 'Lịch sử (Historical)';
      default:
        return 'Giả tưởng (Fantasy)';
    }
  }

  private getGenreSpecificInstructions(genre: GameGenre): string {
    switch (genre) {
      case GameGenre.FANTASY:
        return `
        Tạo một câu chuyện giả tưởng cao với các yếu tố phép thuật, sinh vật thần thoại và nhiệm vụ sử thi.
        Sử dụng mô tả phong phú về các yếu tố ma thuật, di tích cổ đại, rừng thần bí và sinh vật kỳ ảo.
        Kết hợp các chủ đề về anh hùng, số phận và cuộc đấu tranh giữa thiện và ác.
        `;
      case GameGenre.SCIFI:
        return `
        Tạo một câu chuyện khoa học viễn tưởng với công nghệ tiên tiến, khám phá vũ trụ và xã hội tương lai.
        Sử dụng mô tả nhấn mạnh công nghệ, thế giới ngoài hành tinh, tàu vũ trụ và các khái niệm khoa học.
        Kết hợp các chủ đề về khám phá, tác động của công nghệ đối với xã hội và vị trí của con người trong vũ trụ.
        `;
      case GameGenre.CYBERPUNK:
        return `
        Tạo một câu chuyện cyberpunk với công nghệ cao và cuộc sống thấp kém, sự thống trị của tập đoàn và thế giới số.
        Sử dụng mô tả tương phản giữa công nghệ tiên tiến với sự suy tàn đô thị, đường phố đầy đèn neon và giao diện kỹ thuật số.
        Kết hợp các chủ đề về nổi loạn chống lại sự kiểm soát của tập đoàn, chủ nghĩa chuyển đổi con người và ranh giới mờ nhạt giữa con người và máy móc.
        `;
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return `
        Tạo một câu chuyện võ thuật, tu luyện và huyền bí phương Đông.
        Sử dụng mô tả nhấn mạnh vào việc vận dụng khí, kỹ thuật võ thuật, môn phái cổ đại và sự phát triển tâm linh.
        Kết hợp các chủ đề về tu luyện cá nhân, danh dự, hệ thống phân cấp võ học và việc theo đuổi trường sinh bất tử.
        `;
      case GameGenre.HORROR:
        return `
        Tạo một câu chuyện kinh dị với các yếu tố sợ hãi, điều chưa biết và căng thẳng tâm lý.
        Sử dụng mô tả gợi lên sự sợ hãi, kinh hoàng và lo lắng, chú ý đến bầu không khí và sự căng thẳng.
        Kết hợp các chủ đề về sự sống sót, sự tỉnh táo và đối mặt với điều chưa biết hoặc siêu nhiên.
        `;
      case GameGenre.MODERN:
        return `
        Tạo một câu chuyện đương đại đặt trong thời hiện đại với các yếu tố thực tế.
        Sử dụng mô tả thực tế về bối cảnh hiện đại, công nghệ và động lực xã hội.
        Kết hợp các chủ đề liên quan đến cuộc sống đương đại, mối quan hệ và các thách thức xã hội.
        `;
      case GameGenre.POSTAPOCALYPTIC:
        return `
        Tạo một câu chuyện đặt sau thảm họa toàn cầu, tập trung vào sự sống sót và tái thiết.
        Sử dụng mô tả về cảnh quan đổ nát, khan hiếm, cộng đồng tạm bợ và các mối nguy hiểm môi trường.
        Kết hợp các chủ đề về sự sống sót, thích nghi, hy vọng trong nghịch cảnh và việc tái thiết xã hội.
        `;
      case GameGenre.STEAMPUNK:
        return `
        Tạo một câu chuyện với thẩm mỹ thời Victoria, công nghệ chạy bằng hơi nước và các yếu tố tương lai cổ điển.
        Sử dụng mô tả về máy móc bằng đồng thau, động cơ hơi nước, phi thuyền và công nghệ lịch sử thay thế.
        Kết hợp các chủ đề về phát minh, khám phá, động lực giai cấp và tác động của công nghệ.
        `;
      case GameGenre.HISTORICAL:
        return `
        Tạo một câu chuyện đặt trong một thời kỳ lịch sử cụ thể với sự chú ý đến tính chính xác lịch sử.
        Sử dụng mô tả nắm bắt bối cảnh, phong tục, công nghệ và động lực xã hội của thời đại.
        Kết hợp các chủ đề liên quan đến thời kỳ lịch sử trong khi duy trì một câu chuyện hấp dẫn.
        `;
      default:
        return `
        Tạo một câu chuyện hấp dẫn với mô tả sống động và những lựa chọn có ý nghĩa.
        Tập trung vào sự phát triển của nhân vật, xây dựng thế giới và trải nghiệm câu chuyện nhập vai.
        `;
    }
  }

  private getGenreAttributes(genre: GameGenre): string[] {
    switch (genre) {
      case GameGenre.FANTASY:
        return [
          'strength',
          'intelligence',
          'dexterity',
          'charisma',
          'health',
          'mana',
        ];
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return ['strength', 'dexterity', 'qi', 'cultivation', 'perception'];
      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        return ['intelligence', 'tech', 'hacking', 'piloting'];
      case GameGenre.HORROR:
        return ['sanity', 'willpower', 'perception'];
      case GameGenre.MODERN:
        return ['charisma', 'education', 'wealth', 'influence'];
      case GameGenre.POSTAPOCALYPTIC:
        return ['strength', 'survival', 'scavenging', 'radiation resistance'];
      case GameGenre.STEAMPUNK:
        return ['intelligence', 'engineering', 'social standing'];
      default:
        return ['strength', 'intelligence', 'dexterity', 'charisma'];
    }
  }

  private getGenreItems(genre: GameGenre): string[] {
    switch (genre) {
      case GameGenre.FANTASY:
        return ['weapon', 'armor', 'potion', 'scroll', 'magical artifact'];
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return [
          'weapon',
          'cultivation manual',
          'medicinal herb',
          'qi pill',
          'talisman',
        ];
      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        return ['weapon', 'implant', 'gadget', 'medkit', 'data chip'];
      case GameGenre.HORROR:
        return [
          'weapon',
          'light source',
          'medical supply',
          'ritual item',
          'key',
        ];
      case GameGenre.MODERN:
        return ['smartphone', 'weapon', 'tool', 'medicine', 'document'];
      case GameGenre.POSTAPOCALYPTIC:
        return ['weapon', 'scrap', 'food', 'water', 'medicine', 'fuel'];
      case GameGenre.STEAMPUNK:
        return ['gadget', 'weapon', 'tool', 'blueprint', 'mechanical part'];
      default:
        return ['weapon', 'tool', 'consumable', 'key item'];
    }
  }

  // Helper method to get relevant attributes based on all genres
  private getRelevantAttributes(
    primaryGenre: GameGenre,
    secondaryGenres: GameGenre[],
  ): string[] {
    // Start with primary genre attributes
    const attributes = new Set(this.getGenreAttributes(primaryGenre));

    // Add attributes from secondary genres
    if (secondaryGenres && secondaryGenres.length > 0) {
      secondaryGenres.forEach((genre) => {
        this.getGenreAttributes(genre).forEach((attr) => attributes.add(attr));
      });
    }

    // Always include basic attributes
    ['strength', 'intelligence', 'dexterity', 'charisma', 'health'].forEach(
      (attr) => attributes.add(attr),
    );

    return Array.from(attributes);
  }

  // Helper method to format attribute names for display
  private formatAttributeName(attr: string): string {
    // Capitalize first letter
    return attr.charAt(0).toUpperCase() + attr.slice(1);
  }

  // General purpose method for generating content with Gemini
  async generateContent(prompt: string, userApiKey?: string): Promise<string> {
    try {
      const model = this.getModel(userApiKey);
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      this.logger.error(
        `Error generating content: ${error.message}`,
        error.stack,
      );
      return 'Unable to generate content at this time.';
    }
  }
}
