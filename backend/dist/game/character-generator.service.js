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
var CharacterGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const character_entity_1 = require("./entities/character.entity");
const config_1 = require("@nestjs/config");
let CharacterGeneratorService = CharacterGeneratorService_1 = class CharacterGeneratorService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CharacterGeneratorService_1.name);
        this.defaultApiKey = this.configService.get('GEMINI_API_KEY') || '';
        this.allowUserApiKeys =
            this.configService.get('ALLOW_USER_API_KEYS') === 'true';
        if (!this.defaultApiKey || this.defaultApiKey === 'dummy-api-key') {
            this.logger.warn('GEMINI_API_KEY is not properly configured. AI features will be limited.');
            this.defaultGenerativeAI = null;
            this.defaultModel = null;
        }
        else {
            this.defaultGenerativeAI = new generative_ai_1.GoogleGenerativeAI(this.defaultApiKey);
            this.defaultModel = this.defaultGenerativeAI.getGenerativeModel({
                model: 'gemini-pro',
            });
        }
    }
    getModel(userApiKey) {
        if (!this.defaultModel && (!this.allowUserApiKeys || !userApiKey)) {
            return null;
        }
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
    async generateCharacterFromDescription(description, preferredGenre, userApiKey) {
        try {
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
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse character data from AI response');
            }
            const characterData = JSON.parse(jsonMatch[0]);
            return this.formatCharacterData(characterData);
        }
        catch (error) {
            this.logger.error(`Error generating character: ${error.message}`, error.stack);
            throw new Error(`Failed to generate character: ${error.message}`);
        }
    }
    formatCharacterData(data) {
        const primaryGenre = Object.values(character_entity_1.GameGenre).includes(data.genre)
            ? data.genre
            : character_entity_1.GameGenre.FANTASY;
        const inventory = data.inventory || {
            items: [],
            currency: {},
        };
        if (!inventory.currency) {
            inventory.currency = this.getDefaultCurrency(primaryGenre);
        }
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
    getGenreDescription(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return 'Fantasy (giả tưởng) - thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí';
            case character_entity_1.GameGenre.MODERN:
                return 'Modern (hiện đại) - thế giới hiện đại với công nghệ và xã hội như thực tế';
            case character_entity_1.GameGenre.SCIFI:
                return 'Sci-Fi (khoa học viễn tưởng) - thế giới tương lai với công nghệ tiên tiến, du hành vũ trụ';
            case character_entity_1.GameGenre.XIANXIA:
                return 'Xianxia (Tiên Hiệp) - thế giới tu tiên, trau dồi linh khí, thăng cấp cảnh giới';
            case character_entity_1.GameGenre.WUXIA:
                return 'Wuxia (Võ Hiệp) - thế giới võ thuật, giang hồ, kiếm hiệp';
            case character_entity_1.GameGenre.HORROR:
                return 'Horror (kinh dị) - thế giới đầy rẫy những sinh vật kinh dị, ma quỷ và sự sợ hãi';
            case character_entity_1.GameGenre.CYBERPUNK:
                return 'Cyberpunk - thế giới tương lai đen tối với công nghệ cao, tập đoàn lớn và cấy ghép cơ thể';
            case character_entity_1.GameGenre.STEAMPUNK:
                return 'Steampunk - thế giới thay thế với công nghệ hơi nước tiên tiến, thường có bối cảnh thời Victoria';
            case character_entity_1.GameGenre.POSTAPOCALYPTIC:
                return 'Post-Apocalyptic (hậu tận thế) - thế giới sau thảm họa toàn cầu, con người phải sinh tồn';
            case character_entity_1.GameGenre.HISTORICAL:
                return 'Historical (lịch sử) - thế giới dựa trên các giai đoạn lịch sử thực tế';
            default:
                return 'Fantasy (giả tưởng) - thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí';
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
    getDefaultCurrency(genre) {
        switch (genre) {
            case character_entity_1.GameGenre.FANTASY:
                return { gold: 50, silver: 100 };
            case character_entity_1.GameGenre.MODERN:
                return { dollars: 1000 };
            case character_entity_1.GameGenre.XIANXIA:
            case character_entity_1.GameGenre.WUXIA:
                return { spirit_stones: 10, yuan: 1000 };
            case character_entity_1.GameGenre.SCIFI:
            case character_entity_1.GameGenre.CYBERPUNK:
                return { credits: 1000 };
            case character_entity_1.GameGenre.POSTAPOCALYPTIC:
                return { bullets: 20, scrap: 50 };
            default:
                return { gold: 50 };
        }
    }
};
exports.CharacterGeneratorService = CharacterGeneratorService;
exports.CharacterGeneratorService = CharacterGeneratorService = CharacterGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CharacterGeneratorService);
//# sourceMappingURL=character-generator.service.js.map