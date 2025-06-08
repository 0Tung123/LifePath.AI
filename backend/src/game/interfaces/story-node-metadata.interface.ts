export interface StoryNodeMetadata {
  inputType?: string;
  userInput?: string;
  dangerLevel?: number;
  tags?: string[];
  mood?: string;
  isPivotalMoment?: boolean;
  isPlotTwist?: boolean;
  characterGrowth?: {
    type: 'skill' | 'personality' | 'relationship';
    description: string;
  };
  environmentDescription?: {
    weather?: string;
    timeOfDay?: string;
    location?: string;
    ambience?: string;
  };
  [key: string]: any; // Để tương thích với dữ liệu cũ
}

export interface ChoiceMetadata {
  isCustomAction?: boolean;
  customActionType?: string;
  successProbability?: number;
  dangerLevel?: number;
  requiresItem?: boolean;
  requiredItemId?: string;
  isHidden?: boolean;
  unlocksAt?: {
    attributeName: string;
    minimumValue: number;
  };
  [key: string]: any; // Để tương thích với dữ liệu cũ
}
