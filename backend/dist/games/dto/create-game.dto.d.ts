export interface AdditionalSettings {
    style?: string;
    difficulty?: string;
    gameLength?: string;
    combatStyle?: string;
    [key: string]: string | number | boolean | object | undefined;
}
export declare class GameSettingsDto {
    theme: string;
    setting: string;
    characterName: string;
    characterBackstory: string;
    additionalSettings?: AdditionalSettings;
}
export declare class CreateGameDto {
    gameSettings: GameSettingsDto;
}
