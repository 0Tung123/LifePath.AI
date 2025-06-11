import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GameSession, WorldLocation, WorldNPC, WorldFaction } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { MemoryService } from '../memory/memory.service';
import { TimeOfDay, Season } from './entities/story-node.entity';
export declare class WorldStateService {
    private gameSessionRepository;
    private characterRepository;
    private memoryService;
    private configService;
    private readonly logger;
    private geminiAi;
    private generationModel;
    constructor(gameSessionRepository: Repository<GameSession>, characterRepository: Repository<Character>, memoryService: MemoryService, configService: ConfigService);
    updateWorldState(): Promise<void>;
    generateWorldEvents(session: GameSession): Promise<void>;
    advanceTime(session: GameSession): Promise<void>;
    changeTimeOfDay(gameSessionId: string, newTimeOfDay: TimeOfDay): Promise<GameSession>;
    changeSeason(gameSessionId: string, newSeason: Season): Promise<GameSession>;
    updateFactionReputation(gameSessionId: string, factionId: string, amount: number): Promise<{
        faction: WorldFaction;
        newReputation: number;
    }>;
    updateLocationState(gameSessionId: string, locationId: string, newState: string, reason: string): Promise<WorldLocation>;
    initializeWorldState(gameSessionId: string, worldData: {
        locations: WorldLocation[];
        npcs: WorldNPC[];
        factions: WorldFaction[];
    }): Promise<GameSession>;
    getWorldState(gameSessionId: string): Promise<any>;
}
