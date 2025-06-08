import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptService, StoryType } from './prompt.service';

@Injectable()
export class GeminiService {
  private generativeAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private configService: ConfigService,
    private promptService: PromptService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    this.generativeAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng model Gemini Pro
    this.model = this.generativeAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  /**
   * Tạo nội dung truyện dựa trên prompt và lựa chọn của người dùng
   */
  async generateStory(type: StoryType, userChoice: string): Promise<string> {
    try {
      // Tạo prompt với lựa chọn của người dùng
      const prompt = this.promptService.createPromptWithUserChoice(
        type,
        userChoice,
      );

      // Gọi API Gemini để tạo nội dung
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating story with Gemini:', error);
      throw new Error(`Failed to generate story: ${error.message}`);
    }
  }

  /**
   * Tiếp tục câu chuyện dựa trên nội dung trước đó và lựa chọn mới
   */
  async continueStory(
    type: StoryType,
    previousContent: string,
    userChoice: string,
  ): Promise<string> {
    try {
      // Tạo prompt tiếp tục dựa trên nội dung trước và lựa chọn mới
      const prompt = `
${previousContent}

Người dùng đã chọn: "${userChoice}"

Tiếp tục câu chuyện dựa trên lựa chọn này, giữ nguyên phong cách và định dạng.
`;

      // Gọi API Gemini để tạo nội dung tiếp theo
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error continuing story with Gemini:', error);
      throw new Error(`Failed to continue story: ${error.message}`);
    }
  }
}
