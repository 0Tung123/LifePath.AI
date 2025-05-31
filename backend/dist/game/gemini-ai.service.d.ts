import { ConfigService } from '@nestjs/config';
export declare class GeminiAiService {
    private configService;
    private readonly defaultGenerativeAI;
    private readonly defaultModel;
    private readonly logger;
    private readonly allowUserApiKeys;
    private readonly defaultApiKey;
    constructor(configService: ConfigService);
    private getModel;
    generateStoryContent(prompt: string, gameContext: any): Promise<string>;
    generateChoices(storyContent: string, gameContext: any): Promise<any[]>;
    generateCombatScene(character: any, location: string): Promise<any>;
    private getGenreName;
    private getGenreSpecificInstructions;
    private getGenreAttributes;
    private getGenreItems;
    private getRelevantAttributes;
    private formatAttributeName;
}
