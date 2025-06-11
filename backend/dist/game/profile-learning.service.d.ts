import { Repository } from 'typeorm';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
export declare class ProfileLearningService {
    private gameSessionRepository;
    private characterRepository;
    private readonly logger;
    constructor(gameSessionRepository: Repository<GameSession>, characterRepository: Repository<Character>);
    recordPlayerDecision(gameSessionId: string, decisionData: {
        nodeId: string;
        decisionType: string;
        content: string;
        affectedTraits?: Record<string, number>;
        affectedStats?: Record<string, number>;
        affectedFactions?: Record<string, number>;
        tags?: string[];
    }): Promise<void>;
    private determineDecisionWeight;
    private generateTagsFromContent;
    private updateGameplayProfile;
    analyzeWritingStyle(gameSessionId: string, text: string): Promise<void>;
    getGameplayProfile(gameSessionId: string): Promise<any>;
    adjustContentBasedOnProfile(gameSessionId: string, content: string): Promise<string>;
    private generateUniqueId;
    private calculateAverageSentenceLength;
    private detectFormality;
    private detectTone;
    private detectDescriptiveness;
    private expandContent;
    private condenseContent;
    private adjustTone;
}
