import { Repository } from 'typeorm';
import { Story } from './entities/story.entity';
import { GeminiService } from './gemini.service';
import { StoryType } from './prompt.service';
export declare class StoryService {
    private storyRepository;
    private geminiService;
    constructor(storyRepository: Repository<Story>, geminiService: GeminiService);
    createStory(userId: string, type: StoryType, userChoice: string): Promise<Story>;
    continueStory(storyId: string, userChoice: string): Promise<Story>;
    getStoriesByUser(userId: string): Promise<Story[]>;
    getStoryById(id: string): Promise<Story>;
    private extractChoices;
}
