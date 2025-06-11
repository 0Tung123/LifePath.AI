import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
import { GameService } from './game.service';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(GameSession)
    private gameSessionRepository: Repository<GameSession>,
    @InjectRepository(StoryNode)
    private storyNodeRepository: Repository<StoryNode>,
  ) {}

  async createBookmark(
    gameSessionId: string,
    storyNodeId: string,
    name: string,
    description?: string,
  ): Promise<Bookmark> {
    // Kiểm tra xem game session có tồn tại không
    const gameSession = await this.gameSessionRepository.findOne({
      where: { id: gameSessionId },
    });
    if (!gameSession) {
      throw new NotFoundException(`Game session with ID ${gameSessionId} not found`);
    }

    // Kiểm tra xem story node có tồn tại không
    const storyNode = await this.storyNodeRepository.findOne({
      where: { id: storyNodeId },
    });
    if (!storyNode) {
      throw new NotFoundException(`Story node with ID ${storyNodeId} not found`);
    }

    // Tạo auto summary từ nội dung của story node
    const autoSummary = this.generateAutoSummary(storyNode.content);

    // Tạo bookmark mới
    const bookmark = this.bookmarkRepository.create({
      name,
      description,
      autoSummary,
      gameSessionId,
      storyNodeId,
    });

    // Kiểm tra số lượng bookmark hiện có
    const existingBookmarks = await this.bookmarkRepository.find({
      where: { gameSessionId },
    });

    // Giới hạn số lượng bookmark là 10
    if (existingBookmarks.length >= 10) {
      throw new Error('Maximum number of bookmarks (10) reached. Please delete some before creating new ones.');
    }

    return this.bookmarkRepository.save(bookmark);
  }

  async getBookmarks(gameSessionId: string): Promise<Bookmark[]> {
    return this.bookmarkRepository.find({
      where: { gameSessionId },
      order: { createdAt: 'DESC' },
    });
  }

  async getBookmark(id: string): Promise<Bookmark> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id },
      relations: ['storyNode'],
    });
    if (!bookmark) {
      throw new NotFoundException(`Bookmark with ID ${id} not found`);
    }
    return bookmark;
  }

  async deleteBookmark(id: string): Promise<void> {
    const result = await this.bookmarkRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Bookmark with ID ${id} not found`);
    }
  }

  async updateBookmark(
    id: string,
    name: string,
    description?: string,
  ): Promise<Bookmark> {
    const bookmark = await this.getBookmark(id);
    bookmark.name = name;
    if (description) {
      bookmark.description = description;
    }
    return this.bookmarkRepository.save(bookmark);
  }

  // Tạo tóm tắt tự động từ nội dung story node
  private generateAutoSummary(content: string): string {
    // Giới hạn độ dài tóm tắt là 50 ký tự
    const maxLength = 50;
    
    // Loại bỏ thẻ HTML nếu có
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Lấy đoạn đầu tiên của nội dung
    const summary = plainText.trim().split(/[.!?]/).filter(s => s.trim().length > 0)[0] || plainText;
    
    // Cắt ngắn nếu quá dài và thêm dấu "..."
    if (summary.length > maxLength) {
      return summary.substring(0, maxLength - 3) + '...';
    }
    
    return summary;
  }
}