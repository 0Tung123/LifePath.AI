export declare class GeminiAiService {
    private readonly generativeAI;
    private readonly model;
    private readonly logger;
    constructor();
    generateStoryContent(prompt: string, gameContext: any): Promise<string>;
    generateChoices(storyContext: string, gameContext: any): Promise<any[]>;
    generateCombatScene(character: any, location: string): Promise<any>;
    private getGenreName;
    private getGenreSpecificInstructions;
    private getGenreAttributes;
    private getGenreItems;
    private getGenreCombatInstructions;
    private getGenreEnemyTypes;
    private getGenreRewardTypes;
}
