import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export enum StoryType {
  CHINESE = 'chinese',
  KOREAN = 'korean',
}

@Injectable()
export class PromptService {
  private chinesePrompt: string;
  private koreanPrompt: string;

  constructor() {
    // Đọc nội dung prompt từ file
    this.chinesePrompt = fs.readFileSync(
      path.join(process.cwd(), '..', 'chinese_prompt.txt'),
      'utf8',
    );
    this.koreanPrompt = fs.readFileSync(
      path.join(process.cwd(), '..', 'korean_prompt.txt'),
      'utf8',
    );
  }

  /**
   * Lấy prompt theo loại truyện
   */
  getPrompt(type: StoryType): string {
    switch (type) {
      case StoryType.CHINESE:
        return this.chinesePrompt;
      case StoryType.KOREAN:
        return this.koreanPrompt;
      default:
        throw new Error(`Unsupported story type: ${type}`);
    }
  }

  /**
   * Tạo prompt hoàn chỉnh với lựa chọn của người dùng
   */
  createPromptWithUserChoice(type: StoryType, userChoice: string): string {
    const basePrompt = this.getPrompt(type);
    // Thay thế placeholder {{user_choice}} bằng lựa chọn của người dùng
    return basePrompt.replace(/{{user_choice}}/g, userChoice);
  }
}
