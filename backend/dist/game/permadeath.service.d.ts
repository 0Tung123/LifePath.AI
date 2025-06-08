import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { GameSession } from './entities/game-session.entity';
import { CharacterDeath } from './entities/character-death.entity';
import { StoryNode } from './entities/story-node.entity';
import { MemoryService } from '../memory/memory.service';
import { GeminiAiService } from './gemini-ai.service';
export interface DeathEvaluationResult {
    died: boolean;
    description?: string;
    lastWords?: string[];
    deathProbability?: number;
    reasoning?: string;
}
export declare class PermadeathService {
    private characterRepository;
    private gameSessionRepository;
    private characterDeathRepository;
    private storyNodeRepository;
    private memoryService;
    private geminiAiService;
    constructor(characterRepository: Repository<Character>, gameSessionRepository: Repository<GameSession>, characterDeathRepository: Repository<CharacterDeath>, storyNodeRepository: Repository<StoryNode>, memoryService: MemoryService, geminiAiService: GeminiAiService);
    evaluateLethalSituation(gameSessionId: string, decision: string, dangerLevel: number): Promise<DeathEvaluationResult>;
    private calculateDeathThreshold;
    private hasProtection;
    private executeCharacterDeath;
    private recordNearDeathExperience;
    private extractDeathCause;
    private generateEpitaph;
    calculateCurrentDangerLevel(gameSessionId: string): Promise<number>;
    updateSurvivalStats(): Promise<void>;
}
