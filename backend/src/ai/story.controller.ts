import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StoryService } from './story.service';
import { StoryType } from './prompt.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// DTO cho request tạo truyện mới
class CreateStoryDto {
  type: StoryType;
  userChoice: string;
}

// DTO cho request tiếp tục truyện
class ContinueStoryDto {
  storyId: string;
  userChoice: string;
}

@Controller('story')
export class StoryController {
  constructor(private storyService: StoryService) {}

  /**
   * Endpoint tạo truyện mới
   */
  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createStory(@Request() req, @Body() createStoryDto: CreateStoryDto) {
    const userId = req.user.id;
    const { type, userChoice } = createStoryDto;
    const story = await this.storyService.createStory(userId, type, userChoice);
    return story;
  }

  /**
   * Endpoint tiếp tục truyện dựa trên lựa chọn mới
   */
  @UseGuards(JwtAuthGuard)
  @Post('continue')
  async continueStory(@Body() continueStoryDto: ContinueStoryDto) {
    const { storyId, userChoice } = continueStoryDto;
    const updatedStory = await this.storyService.continueStory(
      storyId,
      userChoice,
    );
    return updatedStory;
  }

  /**
   * Endpoint lấy các loại truyện có sẵn
   */
  @Get('types')
  getStoryTypes() {
    return {
      types: [
        {
          id: StoryType.CHINESE,
          name: 'Truyện Trung Quốc (Tiên Hiệp/Huyền Huyễn/Tình Cảm/Cung Đấu)',
        },
        {
          id: StoryType.KOREAN,
          name: 'Truyện Hàn Quốc (Thợ Săn Hầm Ngục/Hồi Quy/Tình Cảm/Học Đường)',
        },
      ],
    };
  }

  /**
   * Endpoint lấy danh sách truyện của người dùng
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-stories')
  async getMyStories(@Request() req) {
    const userId = req.user.id;
    const stories = await this.storyService.getStoriesByUser(userId);
    return stories;
  }

  /**
   * Endpoint lấy chi tiết một truyện
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getStory(@Param('id') id: string) {
    return this.storyService.getStoryById(id);
  }
}
