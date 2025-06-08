import { ConfigService } from '@nestjs/config';
import { PromptService, StoryType } from './prompt.service';
export declare class GeminiService {
    private configService;
    private promptService;
    private generativeAI;
    private model;
    constructor(configService: ConfigService, promptService: PromptService);
    generateStory(type: StoryType, userChoice: string): Promise<string>;
    continueStory(type: StoryType, previousContent: string, userChoice: string): Promise<string>;
}
