import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Character, GameGenre } from './entities/character.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CharacterGeneratorService {
  private readonly defaultGenerativeAI: GoogleGenerativeAI;
  private readonly defaultModel: any;
  private readonly logger = new Logger(CharacterGeneratorService.name);
  private readonly allowUserApiKeys: boolean;
  private readonly defaultApiKey: string;

  constructor(private configService: ConfigService) {
    // Get configuration from environment variables
    this.defaultApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.allowUserApiKeys =
      this.configService.get<string>('ALLOW_USER_API_KEYS') === 'true';

    // Initialize default AI model
    if (!this.defaultApiKey) {
      throw new Error(
        'GEMINI_API_KEY is required but not provided in environment variables',
      );
    }

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
        return userGenerativeAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
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

  async generateCharacterFromDescription(
    description: string,
    preferredGenre?: GameGenre,
    userApiKey?: string,
  ): Promise<Partial<Character>> {
    try {
      // Get the appropriate model based on user API key
      const model = this.getModel(userApiKey);

      const genreText = preferredGenre
        ? `Thể loại: ${this.getGenreDescription(preferredGenre)}.`
        : 'Hãy phân tích mô tả và xác định thể loại phù hợp nhất từ các lựa chọn: Fantasy (giả tưởng), Modern (hiện đại), Sci-Fi (khoa học viễn tưởng), Xianxia (Tiên Hiệp), Wuxia (Võ Hiệp), Horror (kinh dị), Cyberpunk, Steampunk, Post-Apocalyptic (hậu tận thế), Historical (lịch sử).';

      const prompt = `
        Bạn là một hệ thống tạo nhân vật thông minh cho trò chơi "Nhập Vai A.I Simulator". 
        Dựa trên mô tả của người chơi, hãy tạo một nhân vật hoàn chỉnh với các thuộc tính, kỹ năng và thông tin phù hợp.

        Mô tả của người chơi: "${description}"

        ${genreText}

        Hãy phân tích mô tả và tạo ra một nhân vật phù hợp. Trả về kết quả dưới dạng JSON với cấu trúc sau:
        {
          "name": "Tên nhân vật",
          "characterClass": "Lớp nhân vật",
          "genre": "thể_loại", // Một trong các giá trị: fantasy, modern, scifi, xianxia, wuxia, horror, cyberpunk, steampunk, postapocalyptic, historical
          "attributes": {
            // Thuộc tính phù hợp với thể loại, ví dụ:
            // Fantasy: strength, intelligence, dexterity, charisma, health, mana
            // Xianxia: cultivation, qi, perception, intelligence, strength
            // Modern: education, wealth, influence, charisma, health
            // Sci-Fi: tech, hacking, piloting, intelligence, health
            // Tùy chỉnh theo thể loại và mô tả
          },
          "skills": ["Kỹ năng 1", "Kỹ năng 2", ...],
          "specialAbilities": [
            {
              "name": "Tên khả năng đặc biệt",
              "description": "Mô tả khả năng",
              "cooldown": số_lượt_hồi_chiêu,
              "cost": {
                "type": "loại_chi_phí", // mana, qi, energy, etc.
                "amount": số_lượng
              }
            }
          ],
          "inventory": {
            "items": [
              {
                "id": "id-ngẫu-nhiên",
                "name": "Tên vật phẩm",
                "description": "Mô tả vật phẩm",
                "quantity": 1,
                "type": "loại_vật_phẩm", // weapon, armor, consumable, etc.
                "rarity": "độ_hiếm" // common, uncommon, rare, epic, legendary
              }
            ],
            "currency": {
              // Loại tiền tệ phù hợp với thể loại
              // Fantasy: gold, silver
              // Modern: dollars, euro
              // Xianxia: spirit_stones, yuan
              // Sci-Fi: credits
            }
          },
          "backstory": "Câu chuyện ngắn về nhân vật"
        }

        Hãy đảm bảo rằng tất cả các thuộc tính, kỹ năng và vật phẩm đều phù hợp với thể loại và mô tả của người chơi.
        Phân bổ điểm thuộc tính hợp lý, dựa trên mô tả của người chơi.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      // Extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse character data from AI response');
      }

      const characterData = JSON.parse(jsonMatch[0]);

      // Validate and format the character data
      return this.formatCharacterData(characterData);
    } catch (error) {
      this.logger.error(
        `Error generating character: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to generate character: ${error.message}`);
    }
  }

  private formatCharacterData(data: any): Partial<Character> {
    // Ensure the genre is valid
    const primaryGenre = Object.values(GameGenre).includes(
      data.genre as GameGenre,
    )
      ? (data.genre as GameGenre)
      : GameGenre.FANTASY;

    // Format inventory if it exists
    const inventory = data.inventory || {
      items: [],
      currency: {},
    };

    // Ensure currency exists
    if (!inventory.currency) {
      inventory.currency = this.getDefaultCurrency(primaryGenre);
    }

    // Format special abilities if they exist
    const specialAbilities = data.specialAbilities || [];

    return {
      name: data.name || 'Unnamed Character',
      characterClass: data.characterClass || 'Adventurer',
      primaryGenre,
      secondaryGenres: [],
      attributes: data.attributes || this.getDefaultAttributes(primaryGenre),
      skills: data.skills || [],
      specialAbilities,
      inventory,
      backstory: data.backstory || '',
      relationships: [],
    };
  }

  private getGenreDescription(genre: GameGenre): string {
    switch (genre) {
      case GameGenre.FANTASY:
        return 'Fantasy (giả tưởng) - thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí';
      case GameGenre.MODERN:
        return 'Modern (hiện đại) - thế giới hiện đại với công nghệ và xã hội như thực tế';
      case GameGenre.SCIFI:
        return 'Sci-Fi (khoa học viễn tưởng) - thế giới tương lai với công nghệ tiên tiến, du hành vũ trụ';
      case GameGenre.XIANXIA:
        return 'Xianxia (Tiên Hiệp) - thế giới tu tiên, trau dồi linh khí, thăng cấp cảnh giới';
      case GameGenre.WUXIA:
        return 'Wuxia (Võ Hiệp) - thế giới võ thuật, giang hồ, kiếm hiệp';
      case GameGenre.HORROR:
        return 'Horror (kinh dị) - thế giới đầy rẫy những sinh vật kinh dị, ma quỷ và sự sợ hãi';
      case GameGenre.CYBERPUNK:
        return 'Cyberpunk - thế giới tương lai đen tối với công nghệ cao, tập đoàn lớn và cấy ghép cơ thể';
      case GameGenre.STEAMPUNK:
        return 'Steampunk - thế giới thay thế với công nghệ hơi nước tiên tiến, thường có bối cảnh thời Victoria';
      case GameGenre.POSTAPOCALYPTIC:
        return 'Post-Apocalyptic (hậu tận thế) - thế giới sau thảm họa toàn cầu, con người phải sinh tồn';
      case GameGenre.HISTORICAL:
        return 'Historical (lịch sử) - thế giới dựa trên các giai đoạn lịch sử thực tế';
      default:
        return 'Fantasy (giả tưởng) - thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí';
    }
  }

  private getDefaultAttributes(genre: GameGenre): Record<string, number> {
    switch (genre) {
      case GameGenre.FANTASY:
        return {
          strength: 10,
          intelligence: 10,
          dexterity: 10,
          charisma: 10,
          health: 100,
          mana: 100,
        };
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return {
          strength: 10,
          intelligence: 10,
          dexterity: 10,
          cultivation: 1,
          qi: 100,
          perception: 10,
        };
      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        return {
          strength: 10,
          intelligence: 10,
          dexterity: 10,
          tech: 10,
          hacking: 5,
          health: 100,
        };
      case GameGenre.MODERN:
        return {
          strength: 10,
          intelligence: 10,
          charisma: 10,
          education: 10,
          wealth: 10,
          health: 100,
        };
      case GameGenre.HORROR:
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

  private getDefaultCurrency(genre: GameGenre): Record<string, number> {
    switch (genre) {
      case GameGenre.FANTASY:
        return { gold: 50, silver: 100 };
      case GameGenre.MODERN:
        return { dollars: 1000 };
      case GameGenre.XIANXIA:
      case GameGenre.WUXIA:
        return { spirit_stones: 10, yuan: 1000 };
      case GameGenre.SCIFI:
      case GameGenre.CYBERPUNK:
        return { credits: 1000 };
      case GameGenre.POSTAPOCALYPTIC:
        return { bullets: 20, scrap: 50 };
      default:
        return { gold: 50 };
    }
  }
}
