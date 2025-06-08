import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Story } from './entities/story.entity';
import { GeminiService } from './gemini.service';
import { StoryType } from './prompt.service';

@Injectable()
export class StoryService {
  constructor(
    @InjectRepository(Story)
    private storyRepository: Repository<Story>,
    private geminiService: GeminiService,
  ) {}

  /**
   * Tạo truyện mới và lưu vào database
   */
  async createStory(
    userId: string,
    type: StoryType,
    userChoice: string,
  ): Promise<Story> {
    // Gọi Gemini để tạo nội dung
    const content = await this.geminiService.generateStory(type, userChoice);

    // Tạo mới story entity
    const story = this.storyRepository.create({
      type,
      content,
      userId,
      metadata: {
        initialChoice: userChoice,
        currentChoices: this.extractChoices(content),
      },
    });

    // Lưu vào database
    return this.storyRepository.save(story);
  }

  /**
   * Tiếp tục truyện dựa trên lựa chọn mới
   */
  async continueStory(storyId: string, userChoice: string): Promise<Story> {
    // Tìm truyện trong database
    const story = await this.storyRepository.findOneBy({ id: storyId });
    if (!story) {
      throw new Error(`Story with id ${storyId} not found`);
    }

    // Gọi Gemini để tiếp tục nội dung
    const newContent = await this.geminiService.continueStory(
      story.type,
      story.content,
      userChoice,
    );

    // Cập nhật nội dung truyện
    story.content += '\n\n' + newContent;
    story.metadata = {
      ...story.metadata,
      lastChoice: userChoice,
      currentChoices: this.extractChoices(newContent),
    };

    // Lưu truyện đã cập nhật
    return this.storyRepository.save(story);
  }

  /**
   * Lấy danh sách truyện của người dùng
   */
  async getStoriesByUser(userId: string): Promise<Story[]> {
    return this.storyRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Lấy chi tiết một truyện
   */
  async getStoryById(id: string): Promise<Story> {
    const story = await this.storyRepository.findOneBy({ id });
    if (!story) {
      throw new Error(`Story with id ${id} not found`);
    }
    return story;
  }

  /**
   * Trích xuất các lựa chọn từ nội dung truyện
   * Format: [LỰA CHỌN]: 1. Option 1 2. Option 2 ...
   */
  private extractChoices(content: string): string[] {
    try {
      // Tìm phần [LỰA CHỌN] trong nội dung
      const choiceSection = content.match(/\[LỰA CHỌN\]:([\s\S]*?)(?=\[|$)/);
      if (!choiceSection) return [];

      // Trích xuất các lựa chọn có số đánh dấu
      const choiceText = choiceSection[1];
      const choices = choiceText.match(/\d+\.\s+(.*?)(?=\d+\.\s+|$)/g);

      if (!choices) return [];

      return choices.map((choice) => choice.trim());
    } catch (error) {
      console.error('Error extracting choices:', error);
      return [];
    }
  }
}
