export declare enum StoryType {
    CHINESE = "chinese",
    KOREAN = "korean"
}
export declare class PromptService {
    private chinesePrompt;
    private koreanPrompt;
    constructor();
    getPrompt(type: StoryType): string;
    createPromptWithUserChoice(type: StoryType, userChoice: string): string;
}
