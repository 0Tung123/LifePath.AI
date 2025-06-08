import { CustomInputService } from './custom-input.service';
import { CustomInputDto, InputType } from './dto/custom-input.dto';
export declare class CustomInputController {
    private readonly customInputService;
    constructor(customInputService: CustomInputService);
    processCustomInput(customInputDto: CustomInputDto): Promise<{
        success: boolean;
        message: string;
        gameSession: import("./entities/game-session.entity").GameSession;
    }>;
    getInputTypes(): {
        inputTypes: {
            type: InputType;
            label: string;
            placeholder: string;
            examples: string[];
        }[];
    };
    getInputSuggestions(): Promise<{
        suggestions: {
            action: string[];
            thought: string[];
            speech: string[];
        };
    }>;
}
