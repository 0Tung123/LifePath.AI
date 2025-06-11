import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { GameSession } from './entities/game-session.entity';
import { StoryNode } from './entities/story-node.entity';
export declare class BookmarkService {
    private bookmarkRepository;
    private gameSessionRepository;
    private storyNodeRepository;
    constructor(bookmarkRepository: Repository<Bookmark>, gameSessionRepository: Repository<GameSession>, storyNodeRepository: Repository<StoryNode>);
    createBookmark(gameSessionId: string, storyNodeId: string, name: string, description?: string): Promise<Bookmark>;
    getBookmarks(gameSessionId: string): Promise<Bookmark[]>;
    getBookmark(id: string): Promise<Bookmark>;
    deleteBookmark(id: string): Promise<void>;
    updateBookmark(id: string, name: string, description?: string): Promise<Bookmark>;
    private generateAutoSummary;
}
