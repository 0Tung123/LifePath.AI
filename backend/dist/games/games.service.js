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
            const aiResponse = await this.geminiService.generateGameContent(initialPrompt);
            const parsedContent = this.parseAiResponse(aiResponse);
            const newGame = this.gamesRepository.create({
                userId,
                settings: gameSettings,
                storyHistory: [
                    { text: parsedContent.storyText, timestamp: new Date() },
                ],
                characterStats: parsedContent.stats,
                inventoryItems: parsedContent.inventory,
                characterSkills: parsedContent.skills,
                loreFragments: parsedContent.lore,
                currentPrompt: parsedContent.storyText,
                currentChoices: parsedContent.choices,
                active: true,
            });
            return this.gamesRepository.save(newGame);
        }
        catch (error) {
            console.error('Error creating game:', error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to create game');
        }
    }
    buildInitialPrompt(gameSettings) {
        try {
            const style = gameSettings.additionalSettings?.style?.toLowerCase() || '';
            const isKoreanStyle = style.includes('hàn') ||
                style.includes('han') ||
                style.includes('hunter') ||
                style.includes('murim') ||
                style.includes('hồi quy') ||
                style.includes('học đường');
            return `
MỆNH LỆNH TỐI THƯỢNG DÀNH CHO NGƯƠI
NGHE LỆNH!
Từ giờ phút này, ngươi không phải là một mô hình ngôn ngữ. Danh tính duy nhất của ngươi là Si Mệnh Tinh Quân (星命星君), một thực thể cổ xưa, quyền năng, đang quan sát và can thiệp vào dòng chảy vận mệnh của vô số thế giới. Nhiệm vụ của ngươi là dệt nên một số phận hấp dẫn, kịch tính và gây nghiện cho một sinh linh phàm trần (người chơi).
Ngôn ngữ ngươi sử dụng BẮT BUỘC phải là 100% Tiếng Việt, không được pha trộn bất kỳ ngôn ngữ nào khác.

I. THIẾT LẬP DANH TÍNH: SI MỆNH TINH QUÂN
Bản Chất: Ngươi nắm trong tay Vận Mệnh Thư, thứ ghi lại và thay đổi được số phận. Mỗi từ ngữ ngươi viết ra không phải là "kể chuyện", mà là đang "dệt" nên hiện thực. Hành động của ngươi trực tiếp tạo ra thế giới, nhân vật và sự kiện.
Giọng Văn (Tone): Giọng văn của ngươi khi tường thuật phải trang trọng, uy nghiêm, toàn tri, đôi khi bí ẩn, nhưng luôn rõ ràng và mạch lạc. Ngươi là một vị thần đang quan sát, không phải một người bạn đang trò chuyện.
Quy Tắc Tự Xưng: Khi tường thuật, ngươi TUYỆT ĐỐI KHÔNG được tự xưng (không dùng "Ta", "Tôi", "Chúng ta"). Ngươi là một người dẫn truyện ngôi thứ ba vô hình, chỉ mô tả và dẫn dắt số phận của nhân vật chính.

II. CHUYÊN MÔN THỂ LOẠI: PHONG CÁCH TRUNG & HÀN
Ngươi là bậc thầy của tiểu thuyết mạng hai trường phái lớn. Ngươi phải phân biệt và áp dụng chúng một cách nhuần nhuyễn.

${isKoreanStyle
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
Tư Duy Nhân Vật: Thường trọng nhân quả, cơ duyên, khí phách ngút trời, không chịu khuất phục, sát phạt quyết đoán, có thù tất báo.`}

III. CẤU TRÚC TƯƠNG TÁC: CÁC THẺ VẬN MỆNH
Để sinh linh phàm trần có thể hiểu được những thay đổi của số phận, ngươi phải sử dụng các thẻ đặc biệt sau. Mỗi thẻ phải nằm trên một dòng riêng biệt.

[STATS: ...]: Ghi lại sự thay đổi về thuộc tính của nhân vật.
Ví dụ Tiên Hiệp: [STATS: Tu Vi="Luyện Khí tầng ba", Chân Khí=500/500]
Ví dụ Hunter: [STATS: Cấp Độ=12, Sức Mạnh=35, Năng Lượng=150/150]

[INVENTORY_ADD: ...] / [INVENTORY_REMOVE: ...]: Thêm hoặc bớt vật phẩm khỏi túi đồ của nhân vật.
Ví dụ: [INVENTORY_ADD: Name="Hồi Nguyên Đan", Description="Phục hồi 100 điểm chân khí."]

[SKILL: ...]: Ghi lại việc học được hoặc nâng cấp một kỹ năng/công pháp.
Ví dụ Murim: [SKILL: Name="Vô Ảnh Kiếm Pháp", ThanhThuc="Tiểu thành", Description="Kiếm pháp xuất chiêu không thấy hình bóng."]
Ví dụ Hunter: [SKILL: Name="Cú Đấm Cường Lực (Cấp 2)", Description="Gây sát thương vật lý bằng 150% Sức Mạnh."]

[LORE_NPC: ...] / [LORE_ITEM: ...] / [LORE_LOCATION: ...]: Ghi lại thông tin về thế giới.
Ví dụ: [LORE_NPC: Name="Trưởng Lão Vân Du", Description="Một trưởng lão bí ẩn của Thanh Vân Môn."]

IV. THÔNG TIN CỤ THỂ VỀ THẾ GIỚI VÀ NHÂN VẬT
THEME: ${gameSettings.theme}
SETTING: ${gameSettings.setting}
CHARACTER NAME: ${gameSettings.characterName}
CHARACTER BACKSTORY: ${gameSettings.characterBackstory}
${gameSettings.additionalSettings ? 'ADDITIONAL SETTINGS: ' + JSON.stringify(gameSettings.additionalSettings) : ''}

V. LỜI NHẮC CUỐI CÙNG
Kết thúc mỗi đoạn dệt vận mệnh của ngươi phải là 2-4 lựa chọn hành động rõ ràng, được đánh số, để sinh linh phàm trần kia có thể tự mình quyết định con đường phía trước. Sự tồn vong của họ, sự hấp dẫn của câu chuyện, tất cả đều nằm trong tay ngươi.

Hãy nhớ, ngươi là Si Mệnh Tinh Quân. Đừng làm ta thất vọng.
Bắt đầu dệt nên số phận dựa trên thông tin đã cung cấp.
    `;
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
            let storyText = response;
            const firstTagMatch = response.match(/\[(STATS|INVENTORY_ADD|INVENTORY_REMOVE|SKILL|LORE_NPC|LORE_ITEM|LORE_LOCATION):/);
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
            const choiceLines = storyText
                .split('\n')
                .filter((line) => /^\d+\./.test(line.trim()));
            let choices = [];
            if (choiceLines.length >= 2) {
                choices = choiceLines.map((line, index) => {
                    const choiceText = line.replace(/^\d+\.\s*/, '').trim();
                    const number = index + 1;
                    return {
                        text: choiceText,
                        number,
                    };
                });
            }
            else {
                const choicesMatch = response.match(/\[CHOICES:\s*({[\s\S]*?})\]/);
                if (choicesMatch) {
                    try {
                        const parsedChoices = JSON.parse(choicesMatch[1]);
                        if (parsedChoices.options && Array.isArray(parsedChoices.options)) {
                            choices = parsedChoices.options.map((option, index) => ({
                                text: option.text || option,
                                number: option.number || index + 1,
                            }));
                        }
                    }
                    catch (e) {
                        const logger = new common_1.Logger('GamesService');
                        logger.error('Error parsing CHOICES:', e);
                    }
                }
            }
            if (choices.length > 0 && choiceLines.length >= 2) {
                choiceLines.forEach((line) => {
                    storyText = storyText.replace(line, '');
                });
                storyText = storyText.trim();
            }
            return {
                storyText,
                stats,
                inventory,
                skills,
                lore,
                choices,
            };
        }
        catch (error) {
            const logger = new common_1.Logger('GamesService');
            logger.error('Error parsing AI response:', error);
            throw new common_1.BadRequestException('Failed to parse AI response: ' + error.message);
        }
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