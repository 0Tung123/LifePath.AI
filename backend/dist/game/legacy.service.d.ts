import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { Legacy } from './entities/legacy.entity';
import { CharacterDeath } from './entities/character-death.entity';
import { MemoryService } from '../memory/memory.service';
import { GeminiAiService } from './gemini-ai.service';
export declare class LegacyService {
    private characterRepository;
    private legacyRepository;
    private characterDeathRepository;
    private memoryService;
    private geminiAiService;
    constructor(characterRepository: Repository<Character>, legacyRepository: Repository<Legacy>, characterDeathRepository: Repository<CharacterDeath>, memoryService: MemoryService, geminiAiService: GeminiAiService);
    createLegacyFromDeadCharacter(characterId: string): Promise<Legacy>;
    applyLegacyToNewCharacter(legacyId: string, newCharacterId: string): Promise<void>;
    private selectInheritableItems;
    private extractCharacterKnowledge;
    private generateLegacyDescription;
    private calculateLegacyBonuses;
    private applyLegacyItems;
    private applyLegacyKnowledge;
    private applyLegacyBonuses;
    getAvailableLegacies(userId: string): Promise<Legacy[]>;
}
