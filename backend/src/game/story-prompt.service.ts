import { Injectable, Logger } from '@nestjs/common';
import { GeminiAiService } from './gemini-ai.service';

export enum StoryPromptType {
  CHINESE = 'chinese',
  KOREAN = 'korean',
}

@Injectable()
export class StoryPromptService {
  private readonly logger = new Logger(StoryPromptService.name);

  constructor(private readonly geminiAiService: GeminiAiService) {}

  /**
   * Tạo prompt tiếng Việt theo phong cách truyện Trung Quốc
   */
  private createChineseStylePrompt(
    characterInfo: any,
    currentContent?: string,
    previousChoices?: string[],
  ): string {
    // Prompt cơ bản cho phong cách Trung Quốc
    let basePrompt = `
[HƯỚNG DẪN TRUYỆN - PHONG CÁCH TRUNG HOA]

Hãy viết một đoạn truyện theo phong cách Tiên Hiệp/Võ Hiệp Trung Quốc với nhân vật có các thông tin sau:
${JSON.stringify(characterInfo, null, 2)}

[PHONG CÁCH & ĐẶC ĐIỂM]
- Phong cách: Tiên Hiệp/Võ Hiệp Trung Quốc
- Bối cảnh: Thế giới võng du tiên hiệp, võ hiệp Trung Hoa với các môn phái, tông môn
- Văn phong: Hoa mỹ, giàu hình ảnh, sử dụng từ ngữ đặc trưng tiên hiệp/võ hiệp
- Nhân vật: Xưng hô kiểu "bần đạo", "lão phu", "tiểu đệ", "tiên tử", "đại hiệp"
- Yếu tố: Tu tiên, đột phá cảnh giới, giang hồ, môn phái, ân oán tình thù

[ĐỊNH DẠNG]
[CẢNH]: Mô tả địa điểm, thời gian, không khí
[NHÂN VẬT]: Giới thiệu nhân vật quan trọng và những đặc điểm nổi bật
[HÀNH ĐỘNG]: Mô tả hành động của nhân vật chính và những người khác
[ĐOẠN KẾT]: Kết thúc với tình tiết treo và các lựa chọn tiếp theo

[LỰA CHỌN]: 2-4 lựa chọn tiềm năng, mỗi lựa chọn trong ngoặc vuông và có số thứ tự. Ví dụ:
[1] Quyết định A
[2] Quyết định B
`;

    // Thêm nội dung hiện tại nếu có
    if (currentContent && currentContent.trim() !== '') {
      basePrompt += `
[NỘI DUNG HIỆN TẠI]
${currentContent}
`;
    }

    // Thêm lựa chọn trước đó nếu có
    if (previousChoices && previousChoices.length > 0) {
      basePrompt += `
[LỰA CHỌN TRƯỚC ĐÓ]
Người chơi đã chọn: "${previousChoices[previousChoices.length - 1]}"
`;
    }

    // Thêm hướng dẫn cụ thể
    const specificRequest = `
[YÊU CẦU]
1. QUAN TRỌNG: Hãy viết toàn bộ nội dung bằng tiếng Việt Nam. Không sử dụng tiếng Trung, tiếng Hàn hay tiếng Anh.
2. Viết tiếp diễn biến câu chuyện, tuân theo định dạng mẫu và các nguyên tắc từ prompt.
3. Độ dài khoảng 300-500 từ.
4. Kết thúc bằng một tình tiết treo (cliffhanger) và 2-4 lựa chọn cho người chơi.
5. Hãy sử dụng đúng các thẻ định dạng ([CẢNH], [NHÂN VẬT], v.v.) theo prompt.
6. Đảm bảo phong cách ngôn ngữ và cấu trúc phù hợp với văn hóa Trung Hoa nhưng vẫn viết bằng tiếng Việt Nam.
7. Có thể dùng một số từ đặc trưng của văn hóa đó (như đạo hữu, sư phụ) nhưng phải viết kèm nghĩa tiếng Việt trong lần xuất hiện đầu tiên.
8. Chia câu chuyện thành các đoạn ngắn, mỗi đoạn không quá 4-5 câu để dễ đọc.
`;

    // Kết hợp prompt gốc và yêu cầu cụ thể
    return `${basePrompt}\n\n${specificRequest}`;
  }

  /**
   * Tạo prompt tiếng Việt theo phong cách truyện Hàn Quốc
   */
  private createKoreanStylePrompt(
    characterInfo: any,
    currentContent?: string,
    previousChoices?: string[],
  ): string {
    // Prompt cơ bản cho phong cách Hàn Quốc
    let basePrompt = `
[HƯỚNG DẪN TRUYỆN - PHONG CÁCH HÀN QUỐC]

Hãy viết một đoạn truyện theo phong cách Manhwa/Web Novel Hàn Quốc với nhân vật có các thông tin sau:
${JSON.stringify(characterInfo, null, 2)}

[PHONG CÁCH & ĐẶC ĐIỂM]
- Phong cách: Thợ Săn/Hồi Quy (Hunter/Regression) Hàn Quốc
- Bối cảnh: Thế giới hiện đại với cổng/hầm ngục, hệ thống cấp bậc xã hội
- Văn phong: Trực tiếp, hấp dẫn, cân bằng giữa hành động và kịch tính
- Nhân vật: Xưng hô theo cấp bậc (Sunbae-Hoobae), gia đình/bạn bè quan trọng
- Yếu tố: Săn quái vật, thức tỉnh kỹ năng, hồi quy/trọng sinh, cổng/hầm ngục

[ĐỊNH DẠNG]
[CẢNH]: Mô tả địa điểm, thời gian, không khí
[NHÂN VẬT]: Giới thiệu nhân vật quan trọng và những đặc điểm nổi bật
[HÀNH ĐỘNG]: Mô tả hành động của nhân vật chính và những người khác
[ĐOẠN KẾT]: Kết thúc với tình tiết treo và các lựa chọn tiếp theo

[LỰA CHỌN]: 2-4 lựa chọn tiềm năng, mỗi lựa chọn trong ngoặc vuông và có số thứ tự. Ví dụ:
[1] Quyết định A
[2] Quyết định B
`;

    // Thêm nội dung hiện tại nếu có
    if (currentContent && currentContent.trim() !== '') {
      basePrompt += `
[NỘI DUNG HIỆN TẠI]
${currentContent}
`;
    }

    // Thêm lựa chọn trước đó nếu có
    if (previousChoices && previousChoices.length > 0) {
      basePrompt += `
[LỰA CHỌN TRƯỚC ĐÓ]
Người chơi đã chọn: "${previousChoices[previousChoices.length - 1]}"
`;
    }

    // Thêm hướng dẫn cụ thể
    const specificRequest = `
[YÊU CẦU]
1. QUAN TRỌNG: Hãy viết toàn bộ nội dung bằng tiếng Việt Nam. Không sử dụng tiếng Trung, tiếng Hàn hay tiếng Anh.
2. Viết tiếp diễn biến câu chuyện, tuân theo định dạng mẫu và các nguyên tắc từ prompt.
3. Độ dài khoảng 300-500 từ.
4. Kết thúc bằng một tình tiết treo (cliffhanger) và 2-4 lựa chọn cho người chơi.
5. Hãy sử dụng đúng các thẻ định dạng ([CẢNH], [NHÂN VẬT], v.v.) theo prompt.
6. Đảm bảo phong cách ngôn ngữ và cấu trúc phù hợp với văn hóa Hàn Quốc nhưng vẫn viết bằng tiếng Việt Nam.
7. Có thể dùng một số từ đặc trưng của văn hóa đó (như sunbae, oppa) nhưng phải viết kèm nghĩa tiếng Việt trong lần xuất hiện đầu tiên.
8. Chia câu chuyện thành các đoạn ngắn, mỗi đoạn không quá 4-5 câu để dễ đọc.
`;

    // Kết hợp prompt gốc và yêu cầu cụ thể
    return `${basePrompt}\n\n${specificRequest}`;
  }

  /**
   * Tạo nội dung truyện dựa trên prompt
   */
  async generateStoryContent(
    promptType: StoryPromptType,
    characterInfo: any,
    currentContent?: string,
    previousChoices?: string[],
  ): Promise<{ content: string; choices: string[] }> {
    try {
      // Tạo prompt dựa trên loại đã chọn
      let prompt: string;
      if (promptType === StoryPromptType.CHINESE) {
        prompt = this.createChineseStylePrompt(
          characterInfo,
          currentContent,
          previousChoices,
        );
      } else {
        prompt = this.createKoreanStylePrompt(
          characterInfo,
          currentContent,
          previousChoices,
        );
      }

      // Gửi prompt đến Gemini AI để tạo nội dung
      const storyContent = await this.geminiAiService.generateStoryContent(
        prompt,
        { character: characterInfo },
      );

      // Phân tích nội dung để trích xuất các lựa chọn
      const choices = this.extractChoicesFromContent(storyContent);

      return {
        content: storyContent,
        choices: choices.length > 0 ? choices : ['Tiếp tục hành trình'],
      };
    } catch (error) {
      this.logger.error(
        `Lỗi khi tạo nội dung truyện: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Trích xuất các lựa chọn từ nội dung truyện
   */
  private extractChoicesFromContent(content: string): string[] {
    const choices: string[] = [];
    const choiceRegex = /\[(\d+)\]\s+(.+?)(?=\n\[|$)/gs;
    
    let match;
    while ((match = choiceRegex.exec(content)) !== null) {
      choices.push(match[2].trim());
    }
    
    return choices;
  }
}