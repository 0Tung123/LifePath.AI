import { ConfigService } from '@nestjs/config';
export declare class GeminiService {
    private configService;
    private genAI;
    private model;
    constructor(configService: ConfigService);
    generateGameContent(prompt: string): Promise<string>;
}
