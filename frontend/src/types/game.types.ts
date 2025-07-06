// Game types for the LifePath.AI application

/**
 * Character level information
 */
export interface CharacterLevel {
  current: number;
  xp: number;
  nextLevel?: number;
}

/**
 * Cultivation system information
 */
export interface CultivationInfo {
  realm: string;
  stage?: string;
  xp: number;
  nextRealm?: string;
}

/**
 * Experience points for different aspects of the character
 */
export interface ExperiencePoints {
  character: number;
  cultivation?: number;
  skills?: number;
}

/**
 * Skill experience tracking
 */
export interface SkillExperience {
  level: number;
  xp: number;
  nextLevel?: number;
}

/**
 * Game statistics for character
 */
export interface GameStats {
  [key: string]:
    | string
    | number
    | ExperiencePoints
    | Record<string, SkillExperience>
    | CharacterLevel
    | CultivationInfo;
}
