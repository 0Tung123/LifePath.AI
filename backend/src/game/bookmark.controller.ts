import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { Bookmark } from './entities/bookmark.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bookmark' })
  @ApiResponse({ status: 201, description: 'Bookmark created successfully' })
  async createBookmark(
    @Body()
    createBookmarkDto: {
      gameSessionId: string;
      storyNodeId: string;
      name: string;
      description?: string;
    },
  ): Promise<Bookmark> {
    try {
      return await this.bookmarkService.createBookmark(
        createBookmarkDto.gameSessionId,
        createBookmarkDto.storyNodeId,
        createBookmarkDto.name,
        createBookmarkDto.description,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('game-session/:id')
  @ApiOperation({ summary: 'Get all bookmarks for a game session' })
  @ApiResponse({ status: 200, description: 'Return all bookmarks' })
  async getBookmarks(@Param('id') gameSessionId: string): Promise<Bookmark[]> {
    return this.bookmarkService.getBookmarks(gameSessionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bookmark by ID' })
  @ApiResponse({ status: 200, description: 'Return the bookmark' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async getBookmark(@Param('id') id: string): Promise<Bookmark> {
    return this.bookmarkService.getBookmark(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async deleteBookmark(@Param('id') id: string): Promise<{ message: string }> {
    await this.bookmarkService.deleteBookmark(id);
    return { message: 'Bookmark deleted successfully' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bookmark' })
  @ApiResponse({ status: 200, description: 'Bookmark updated successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  async updateBookmark(
    @Param('id') id: string,
    @Body()
    updateBookmarkDto: {
      name: string;
      description?: string;
    },
  ): Promise<Bookmark> {
    return this.bookmarkService.updateBookmark(
      id,
      updateBookmarkDto.name,
      updateBookmarkDto.description,
    );
  }
}