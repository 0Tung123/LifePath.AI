import { Repository } from 'typeorm';
import { Consequence, ConsequenceSeverity } from './entities/consequence.entity';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { GeminiAiService } from './gemini-ai.service';
import { MemoryService } from '../memory/memory.service';
export interface GameContext {
    gameSessionId: string;
    characterId: string;
    currentSituation: string;
    characterDescription: string;
}
export interface ActionConsequence {
    description: string;
    timeToTrigger: 'immediate' | 'short' | 'medium' | 'long';
    severity: ConsequenceSeverity;
    isPermanent: boolean;
    affectedEntities: string[];
}
export declare class ConsequenceService {
    private consequenceRepository;
    private gameSessionRepository;
    private characterRepository;
    private geminiAiService;
    private memoryService;
    constructor(consequenceRepository: Repository<Consequence>, gameSessionRepository: Repository<GameSession>, characterRepository: Repository<Character>, geminiAiService: GeminiAiService, memoryService: MemoryService);
    evaluateActionConsequences(action: string, gameContext: GameContext): Promise<ActionConsequence[]>;
    triggerPendingConsequences(): Promise<void>;
    private calculateTriggerTime;
    private generateConsequenceTitle;
    private calculateMemoryImportance;
    private applyPermanentConsequence;
    private isCombatRelated;
    private isMagicRelated;
    private isHealthRelated;
    getPendingConsequencesForSession(gameSessionId: string): Promise<Consequence[]>;
}
