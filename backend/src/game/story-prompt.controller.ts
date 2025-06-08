import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StoryPromptService, StoryPromptType } from './story-prompt.service';

// DTO cho yêu cầu tạo nội dung truyện
class GenerateStoryContentDto {
  promptType: StoryPromptType;
  characterInfo: any;
  currentContent?: string;
  previousChoices?: string[];
}

@Controller('story-prompt')
export class StoryPromptController {
  constructor(private readonly storyPromptService: StoryPromptService) {}

  /**
   * API endpoint để tạo nội dung truyện sử dụng Gemini
   */
  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateStoryContent(@Body() dto: GenerateStoryContentDto) {
    return this.storyPromptService.generateStoryContent(
      dto.promptType,
      dto.characterInfo,
      dto.currentContent,
      dto.previousChoices,
    );
  }
}
