export declare enum InputType {
    ACTION = "action",
    THOUGHT = "thought",
    SPEECH = "speech",
    CUSTOM = "custom"
}
export declare class CustomInputDto {
    content: string;
    type: InputType;
    target?: string;
    gameSessionId: string;
}
