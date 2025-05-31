import { Character, GameGenre } from './entities/character.entity';
import { ConfigService } from '@nestjs/config';
export declare class CharacterGeneratorService {
    private configService;
    private readonly defaultGenerativeAI;
    private readonly defaultModel;
    private readonly logger;
    private readonly allowUserApiKeys;
    private readonly defaultApiKey;
    constructor(configService: ConfigService);
    private getModel;
    generateCharacterFromDescription(description: string, preferredGenre?: GameGenre, userApiKey?: string): Promise<Partial<Character>>;
    private formatCharacterData;
    private getGenreDescription;
    private getDefaultAttributes;
    private getDefaultCurrency;
}
