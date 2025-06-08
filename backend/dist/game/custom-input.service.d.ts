import { Repository } from 'typeorm';
import { GameSession } from './entities/game-session.entity';
import { Character } from './entities/character.entity';
import { StoryNode } from './entities/story-node.entity';
import { Choice } from './entities/choice.entity';
import { GeminiAiService } from './gemini-ai.service';
import { MemoryService } from '../memory/memory.service';
import { PermadeathService } from './permadeath.service';
import { ConsequenceService } from './consequence.service';
import { InputType } from './dto/custom-input.dto';
export declare class CustomInputService {
    private gameSessionRepository;
    private characterRepository;
    private storyNodeRepository;
    private choiceRepository;
    private geminiAiService;
    private memoryService;
    private permadeathService;
    private consequenceService;
    constructor(gameSessionRepository: Repository<GameSession>, characterRepository: Repository<Character>, storyNodeRepository: Repository<StoryNode>, choiceRepository: Repository<Choice>, geminiAiService: GeminiAiService, memoryService: MemoryService, permadeathService: PermadeathService, consequenceService: ConsequenceService);
    processCustomInput(gameSessionId: string, inputType: InputType, content: string, target?: string): Promise<GameSession>;
    private formatInputBasedOnType;
    private generateResponseToCustomInput;
}
