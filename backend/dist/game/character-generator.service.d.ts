import { Character, GameGenre } from './entities/character.entity';
export declare class CharacterGeneratorService {
    private readonly generativeAI;
    private readonly model;
    private readonly logger;
    constructor();
    generateCharacterFromDescription(description: string, preferredGenre?: GameGenre): Promise<Partial<Character>>;
    private formatCharacterData;
    private getGenreDescription;
    private getDefaultAttributes;
    private getDefaultCurrency;
}
