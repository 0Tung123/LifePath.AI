import { BookmarkService } from './bookmark.service';
import { Bookmark } from './entities/bookmark.entity';
export declare class BookmarkController {
    private readonly bookmarkService;
    constructor(bookmarkService: BookmarkService);
    createBookmark(createBookmarkDto: {
        gameSessionId: string;
        storyNodeId: string;
        name: string;
        description?: string;
    }): Promise<Bookmark>;
    getBookmarks(gameSessionId: string): Promise<Bookmark[]>;
    getBookmark(id: string): Promise<Bookmark>;
    deleteBookmark(id: string): Promise<{
        message: string;
    }>;
    updateBookmark(id: string, updateBookmarkDto: {
        name: string;
        description?: string;
    }): Promise<Bookmark>;
}
