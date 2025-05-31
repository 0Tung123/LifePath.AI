import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

export interface ChineseNovelSettings {
  theme: string;
  setting: string;
  characterName: string;
  characterGender: string;
  characterDescription: string;
}

export interface GameStats {
  [key: string]: string | number;
}

export interface InventoryItem {
  name: string;
  description: string;
  thuocTinh: string;
}

export interface Skill {
  name: string;
  description: string;
  thanhThuc: string;
  hieuQua: string;
  tienHoa?: string;
}

export interface LoreEntry {
  type: 'NPC' | 'ITEM' | 'LOCATION';
  name: string;
  description: string;
}

export interface StoryChoice {
  id: number;
  text: string;
}

export interface ChineseNovelResponse {
  content: string;
  stats?: GameStats;
  inventory?: InventoryItem[];
  skills?: Skill[];
  lore?: LoreEntry[];
  choices: StoryChoice[];
}

@Injectable()
export class ChineseNovelService {
  private readonly defaultGenerativeAI: GoogleGenerativeAI | null;
  private readonly defaultModel: any | null;
  private readonly logger = new Logger(ChineseNovelService.name);
  private readonly allowUserApiKeys: boolean;
  private readonly defaultApiKey: string;

  constructor(private configService: ConfigService) {
    // Get configuration from environment variables
    this.defaultApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.allowUserApiKeys =
      this.configService.get<string>('ALLOW_USER_API_KEYS') === 'true';

    // Initialize default AI model if API key is available
    if (!this.defaultApiKey || this.defaultApiKey === 'dummy-api-key') {
      this.logger.warn(
        'GEMINI_API_KEY is not properly configured. AI features will be limited.',
      );
      this.defaultGenerativeAI = null;
      this.defaultModel = null;
    } else {
      this.defaultGenerativeAI = new GoogleGenerativeAI(this.defaultApiKey);
      this.defaultModel = this.defaultGenerativeAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
      });
    }
  }

  // Get the appropriate model based on user context
  private getModel(userApiKey?: string): any {
    // If the default model is null (API key not configured), return null
    if (!this.defaultModel && (!this.allowUserApiKeys || !userApiKey)) {
      return null;
    }

    // If user API keys are allowed and a key is provided, use it
    if (this.allowUserApiKeys && userApiKey) {
      try {
        const userGenerativeAI = new GoogleGenerativeAI(userApiKey);
        return userGenerativeAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
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

  private buildOptimizedPrompt(gameSettings: ChineseNovelSettings): string {
    const themeInstructions = this.getThemeInstructions(gameSettings.theme);
    const addressingStyle = this.getAddressingStyle(gameSettings.theme);
    const statsTemplate = this.getStatsTemplate(gameSettings.theme);

    return `
Bạn là một Đại Năng kể chuyện, chuyên sáng tác tiểu thuyết mạng Trung Quốc thể loại '${gameSettings.theme}', với các phong cách có thể là truyền thống (tu tiên, võ hiệp), hiện đại, trinh thám, kinh dị, giả tưởng hoặc fantasy. Văn phong của bạn cần đậm chất thể loại này.

${addressingStyle}

**Thông tin đầu vào từ người dùng:**

- Chủ đề: ${gameSettings.theme}
- Bối cảnh: ${gameSettings.setting}
- Nhân vật chính: Tên - ${gameSettings.characterName}, Giới tính - ${gameSettings.characterGender}, Sơ lược - ${gameSettings.characterDescription}

**Yêu cầu cụ thể:**

1. Hãy bắt đầu câu chuyện dựa trên các thông tin trên, phù hợp với chủ đề và bối cảnh đã chọn.

2. Mô tả chi tiết khung cảnh ban đầu và tình huống nhân vật chính đang gặp phải, dùng ngôn ngữ giàu hình ảnh, đậm chất thể loại.

3. Xác định các chỉ số ban đầu cho nhân vật chính (bằng TIẾNG VIỆT, phù hợp với chủ đề và bối cảnh. BẮT BUỘC phải có chỉ số "LucChien". ${statsTemplate}). Trả về các chỉ số này TRONG MỘT DÒNG RIÊNG BIỆT bắt đầu bằng '[STATS: ' và theo định dạng 'TenChiSo1=GiaTri1, TenChiSo2="GiaTriChuoi",...]'. Tên chỉ số NÊN viết liền không dấu, viết hoa chữ cái đầu mỗi từ. Giá trị có thể là số hoặc chuỗi trong dấu ngoặc kép.

4. Nếu nhân vật bắt đầu với vật phẩm trong ba lô, liệt kê chúng bằng thẻ [INVENTORY_INIT: Name="Tên Vật Phẩm", Description="Mô tả ngắn gọn", ThuocTinh="Thuộc tính 1=+X, Thuộc tính 2=Y"] cho mỗi vật phẩm trên một dòng riêng biệt.

5. Nếu nhân vật bắt đầu với công pháp/kỹ năng, liệt kê chúng bằng thẻ [SKILL: Name="Tên Công Pháp", Description="Mô tả chi tiết về công pháp/kỹ năng, cách hoạt động, uy lực.", ThanhThuc="Sơ Nhập Môn", HieuQua="Hiệu quả chính", TienHoa="Tên khi tiến hóa (nếu có)"] cho mỗi kỹ năng trên một dòng riêng biệt.

6. Khi giới thiệu Nhân vật phụ (NPC), Vật phẩm (ITEM) quan trọng mới, hoặc Địa điểm (LOCATION) đáng chú ý, cung cấp thông tin bằng thẻ [LORE_NPC: ], [LORE_ITEM: ], hoặc [LORE_LOCATION: ], theo định dạng 'Name="Tên Bằng Tiếng Việt", Description="Mô Tả Ngắn Gọn Bằng Tiếng Việt"]', trên một dòng riêng biệt.

7. Tạo 2-4 lựa chọn hành động rõ ràng, có ý nghĩa bằng tiếng Việt, dùng văn phong và xưng hô phù hợp với thể loại. Mỗi lựa chọn nằm trên một dòng riêng, đánh số thứ tự, ví dụ: "1. Lựa chọn A".

8. Đảm bảo các lựa chọn dẫn đến những hướng đi khác nhau trong cốt truyện.

9. Sử dụng ngôn ngữ giàu hình ảnh, phù hợp với chủ đề và bối cảnh.

10. Trong quá trình phát triển câu chuyện, tự do sáng tạo thêm NPC có chiều sâu, tình tiết bất ngờ, thử thách hoặc câu đố phù hợp, và cập nhật thông tin [STATS: ], [INVENTORY_...: ], [SKILL: ], [LORE_...: ] bằng tiếng Việt nếu cần.

11. Duy trì sự nhất quán của cốt truyện và tính cách nhân vật.

12. Nếu có số liệu khác (ngoài STATS chính), trình bày trong dấu ngoặc vuông, ví dụ [Điểm kinh nghiệm: +50].

13. Lời thoại của nhân vật đặt trong dấu ngoặc kép, có tên nhân vật đứng trước, ví dụ: Lão Ăn Mày: "Tiểu hữu, muốn nghe một câu chuyện không?".

14. Suy nghĩ của nhân vật chính (${gameSettings.characterName}) đặt trong dấu *suy nghĩ* hoặc _suy nghĩ_.

15. Quan trọng: Các dòng [STATS: ], [LORE_...: ], [INVENTORY_...: ], [SKILL: ] phải là dòng riêng biệt, không trộn lẫn với văn kể chuyện.

${themeInstructions}
`;
  }

  private getThemeInstructions(theme: string): string {
    const instructions = {
      'tu-tien': `
**Hướng dẫn thể loại Tu Tiên:**
- Tập trung vào việc tu luyện, đột phá cảnh giới, thu thập linh thạch và linh dược
- Sử dụng thuật ngữ như "tu vi", "linh khí", "đan dược", "pháp bảo", "động thiên địa"
- Mô tả các cảnh quan hùng vĩ như "tiên sơn", "linh địa", "bí cảnh"
- Nhấn mạnh sự khác biệt về thực lực và địa vị trong thế giới tu tiên`,

      'vo-hiep': `
**Hướng dẫn thể loại Võ Hiệp:**
- Tập trung vào võ công, giang hồ nghĩa khí, ân oán tình thù
- Sử dụng thuật ngữ như "nội công", "khinh công", "binh khí", "môn phái"
- Mô tả các địa điểm giang hồ như "tửu lâu", "khách sạn", "võ đường"
- Nhấn mạnh danh dự, nghĩa khí và các quy tắc giang hồ`,

      'hien-dai': `
**Hướng dẫn thể loại Hiện Đại:**
- Bối cảnh thành phố hiện đại với công nghệ, xã hội đương đại
- Có thể kết hợp yếu tố siêu nhiên hoặc hệ thống game
- Sử dụng ngôn ngữ hiện đại nhưng vẫn giữ tính kịch tính`,

      'trinh-tham': `
**Hướng dẫn thể loại Trinh Thám:**
- Tập trung vào việc điều tra, suy luận, tìm kiếm manh mối
- Tạo ra các bí ẩn, câu đố cần giải quyết
- Mô tả chi tiết hiện trường, dấu vết, tâm lý nhân vật`,

      'kinh-di': `
**Hướng dẫn thể loại Kinh Dị:**
- Tạo không khí u ám, bí ẩn, đáng sợ
- Sử dụng các yếu tố siêu nhiên, ma quỷ, linh hồn
- Mô tả chi tiết cảm giác sợ hãi, căng thẳng của nhân vật`,

      'gia-tuong': `
**Hướng dẫn thể loại Giả Tưởng:**
- Thế giới tưởng tượng với các luật lệ riêng
- Có thể có phép thuật, sinh vật huyền bí, công nghệ kỳ lạ
- Tự do sáng tạo các yếu tố độc đáo cho thế giới`,

      fantasy: `
**Hướng dẫn thể loại Fantasy:**
- Thế giới phép thuật với các chủng tộc khác nhau
- Hệ thống phép thuật, kỹ năng, level rõ ràng
- Mô tả các sinh vật huyền bí, dungeon, quest`,
    };

    return instructions[theme] || instructions['fantasy'];
  }

  private getAddressingStyle(theme: string): string {
    if (['tu-tien', 'vo-hiep', 'huyen-huyen'].includes(theme)) {
      return `Nếu là thể loại truyền thống (tu tiên, võ hiệp, huyền huyễn), dùng cách xưng hô như 'bản tọa', 'lão phu', 'tiểu tử', 'ngươi', 'hắn', 'nàng', 'bổn cô nương', 'các hạ', 'đạo hữu', tránh dùng 'tôi', 'bạn', 'anh ấy', 'cô ấy'.`;
    } else {
      return `Nếu là thể loại hiện đại, trinh thám, kinh dị hoặc giả tưởng, có thể dùng xưng hô linh hoạt hơn như 'ta', 'ngươi', 'hắn', 'nàng', hoặc các kiểu xưng hô phù hợp bối cảnh hiện đại, nhưng vẫn giữ phong thái kịch tính, cuốn hút.`;
    }
  }

  private getStatsTemplate(theme: string): string {
    if (['tu-tien', 'vo-hiep', 'huyen-huyen'].includes(theme)) {
      return `Các chỉ số khác có thể là "TuVi", "LinhLuc", "CanCot", "MayMan", "ThoNguyen", "CongPhapChinh", "LinhThach", "KinhNghiem", "KinhNghiemCanLenCap", "CapDo", "TocDo", "TheLuc", "SucManh", "KhiHuyet" (cho thể loại tu tiên, huyền huyễn)`;
    } else {
      return `Các chỉ số khác có thể là "TriTue", "SucBenh", "TamLy", "DiemDieuTra", "KyNang", "SucChiuDung" (cho trinh thám, kinh dị, hiện đại)`;
    }
  }

  async generateChineseNovel(
    gameSettings: ChineseNovelSettings,
    userApiKey?: string,
  ): Promise<ChineseNovelResponse> {
    try {
      const model = this.getModel(userApiKey);
      if (!model) {
        throw new Error(
          'AI model is not available. Please check API key configuration.',
        );
      }

      const prompt = this.buildOptimizedPrompt(gameSettings);

      this.logger.debug('Generating Chinese novel with prompt:', prompt);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.text();

      this.logger.debug('AI Response:', responseText);

      return this.parseChineseNovelResponse(responseText);
    } catch (error) {
      this.logger.error(
        `Error generating Chinese novel: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to generate story: ${error.message}`);
    }
  }

  async continueChineseNovel(
    gameSettings: ChineseNovelSettings,
    previousContent: string,
    currentStats: GameStats,
    currentInventory: InventoryItem[],
    currentSkills: Skill[],
    selectedChoice: string,
    userApiKey?: string,
  ): Promise<ChineseNovelResponse> {
    try {
      const model = this.getModel(userApiKey);
      if (!model) {
        throw new Error(
          'AI model is not available. Please check API key configuration.',
        );
      }

      const continuePrompt = this.buildContinuePrompt(
        gameSettings,
        previousContent,
        currentStats,
        currentInventory,
        currentSkills,
        selectedChoice,
      );

      this.logger.debug(
        'Continuing Chinese novel with prompt:',
        continuePrompt,
      );

      const result = await model.generateContent(continuePrompt);
      const response = result.response;
      const responseText = response.text();

      this.logger.debug('AI Continue Response:', responseText);

      return this.parseChineseNovelResponse(responseText);
    } catch (error) {
      this.logger.error(
        `Error continuing Chinese novel: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to continue story: ${error.message}`);
    }
  }

  private buildContinuePrompt(
    gameSettings: ChineseNovelSettings,
    previousContent: string,
    currentStats: GameStats,
    currentInventory: InventoryItem[],
    currentSkills: Skill[],
    selectedChoice: string,
  ): string {
    const basePrompt = this.buildOptimizedPrompt(gameSettings);

    const statsString = Object.entries(currentStats)
      .map(
        ([key, value]) =>
          `${key}=${typeof value === 'string' ? `"${value}"` : value}`,
      )
      .join(', ');

    const inventoryString = currentInventory
      .map(
        (item) =>
          `[INVENTORY: Name="${item.name}", Description="${item.description}", ThuocTinh="${item.thuocTinh}"]`,
      )
      .join('\n');

    const skillsString = currentSkills
      .map(
        (skill) =>
          `[SKILL: Name="${skill.name}", Description="${skill.description}", ThanhThuc="${skill.thanhThuc}", HieuQua="${skill.hieuQua}"${skill.tienHoa ? `, TienHoa="${skill.tienHoa}"` : ''}]`,
      )
      .join('\n');

    return `
${basePrompt}

**Bối cảnh câu chuyện trước đó:**
${previousContent}

**Trạng thái hiện tại của nhân vật:**
[STATS: ${statsString}]

${inventoryString}

${skillsString}

**Lựa chọn đã chọn:**
${selectedChoice}

**Yêu cầu tiếp tục:**
Dựa trên lựa chọn trên, hãy tiếp tục câu chuyện. Mô tả chi tiết những gì xảy ra sau khi nhân vật thực hiện hành động đã chọn. Cập nhật các chỉ số, vật phẩm, kỹ năng nếu cần thiết và tạo ra 2-4 lựa chọn mới cho tình huống tiếp theo.

Đảm bảo:
- Câu chuyện có tính liên kết với phần trước
- Phản ánh hậu quả của lựa chọn đã chọn
- Tạo ra tình huống mới thú vị
- Cập nhật thông tin game state phù hợp
`;
  }

  private parseChineseNovelResponse(
    responseText: string,
  ): ChineseNovelResponse {
    const result: ChineseNovelResponse = {
      content: '',
      choices: [],
    };

    // Extract main content (everything except special tags)
    let content = responseText;

    // Extract STATS
    const statsMatch = content.match(/\[STATS:\s*([^\]]+)\]/);
    if (statsMatch) {
      result.stats = this.parseStats(statsMatch[1]);
      content = content.replace(statsMatch[0], '').trim();
    }

    // Extract INVENTORY items
    const inventoryMatches = content.match(/\[INVENTORY_INIT:\s*([^\]]+)\]/g);
    if (inventoryMatches) {
      result.inventory = inventoryMatches
        .map((match) => {
          const itemMatch = match.match(/\[INVENTORY_INIT:\s*([^\]]+)\]/);
          if (itemMatch && itemMatch[1]) {
            return this.parseInventoryItem(itemMatch[1]);
          }
          return null;
        })
        .filter((item): item is InventoryItem => item !== null);
      inventoryMatches.forEach((match) => {
        content = content.replace(match, '').trim();
      });
    }

    // Extract SKILLS
    const skillMatches = content.match(/\[SKILL:\s*([^\]]+)\]/g);
    if (skillMatches) {
      result.skills = skillMatches
        .map((match) => {
          const skillMatch = match.match(/\[SKILL:\s*([^\]]+)\]/);
          if (skillMatch && skillMatch[1]) {
            return this.parseSkill(skillMatch[1]);
          }
          return null;
        })
        .filter((skill): skill is Skill => skill !== null);
      skillMatches.forEach((match) => {
        content = content.replace(match, '').trim();
      });
    }

    // Extract LORE entries
    const loreMatches = content.match(
      /\[LORE_(NPC|ITEM|LOCATION):\s*([^\]]+)\]/g,
    );
    if (loreMatches) {
      result.lore = loreMatches
        .map((match) => {
          const typeMatch = match.match(
            /\[LORE_(NPC|ITEM|LOCATION):\s*([^\]]+)\]/,
          );
          if (typeMatch && typeMatch[1] && typeMatch[2]) {
            const type = typeMatch[1] as 'NPC' | 'ITEM' | 'LOCATION';
            const loreData = typeMatch[2];
            return this.parseLoreEntry(type, loreData);
          }
          return null;
        })
        .filter((lore): lore is LoreEntry => lore !== null);
      loreMatches.forEach((match) => {
        content = content.replace(match, '').trim();
      });
    }

    // Extract choices (numbered list at the end)
    const choiceMatches = content.match(/^\d+\.\s*(.+)$/gm);
    if (choiceMatches) {
      result.choices = choiceMatches.map((match, index) => {
        const choiceText = match.replace(/^\d+\.\s*/, '');
        return {
          id: index + 1,
          text: choiceText.trim(),
        };
      });

      // Remove choices from content
      choiceMatches.forEach((match) => {
        content = content.replace(match, '').trim();
      });
    }

    // Clean up content
    result.content = content
      .replace(/\[STATS:.*?\]/g, '')
      .replace(/\[INVENTORY_.*?\]/g, '')
      .replace(/\[SKILL:.*?\]/g, '')
      .replace(/\[LORE_.*?\]/g, '')
      .replace(/^\d+\.\s*.*$/gm, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return result;
  }

  private parseStats(statsString: string): GameStats {
    const stats: GameStats = {};
    const pairs = statsString.split(',');

    for (const pair of pairs) {
      const [key, value] = pair.split('=').map((s) => s.trim());
      if (key && value) {
        // Remove quotes if present
        const cleanValue = value.replace(/^"(.*)"$/, '$1');
        // Try to parse as number, otherwise keep as string
        const numValue = Number(cleanValue);
        stats[key] = isNaN(numValue) ? cleanValue : numValue;
      }
    }

    return stats;
  }

  private parseInventoryItem(itemData: string): InventoryItem {
    const nameMatch = itemData.match(/Name="([^"]+)"/);
    const descMatch = itemData.match(/Description="([^"]+)"/);
    const attrMatch = itemData.match(/ThuocTinh="([^"]+)"/);

    return {
      name: nameMatch ? nameMatch[1] : 'Unknown Item',
      description: descMatch ? descMatch[1] : 'No description',
      thuocTinh: attrMatch ? attrMatch[1] : 'No attributes',
    };
  }

  private parseSkill(skillData: string): Skill {
    const nameMatch = skillData.match(/Name="([^"]+)"/);
    const descMatch = skillData.match(/Description="([^"]+)"/);
    const proficiencyMatch = skillData.match(/ThanhThuc="([^"]+)"/);
    const effectMatch = skillData.match(/HieuQua="([^"]+)"/);
    const evolutionMatch = skillData.match(/TienHoa="([^"]+)"/);

    return {
      name: nameMatch ? nameMatch[1] : 'Unknown Skill',
      description: descMatch ? descMatch[1] : 'No description',
      thanhThuc: proficiencyMatch ? proficiencyMatch[1] : 'Sơ Nhập Môn',
      hieuQua: effectMatch ? effectMatch[1] : 'No effect',
      tienHoa: evolutionMatch ? evolutionMatch[1] : undefined,
    };
  }

  private parseLoreEntry(
    type: 'NPC' | 'ITEM' | 'LOCATION',
    loreData: string,
  ): LoreEntry {
    const nameMatch = loreData.match(/Name="([^"]+)"/);
    const descMatch = loreData.match(/Description="([^"]+)"/);

    return {
      type,
      name: nameMatch ? nameMatch[1] : 'Unknown',
      description: descMatch ? descMatch[1] : 'No description',
    };
  }
}
