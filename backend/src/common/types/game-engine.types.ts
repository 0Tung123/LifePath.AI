// Game engine types - complete and strict typing
export interface CharacterAttributes {
  // Chỉ số cơ bản
  strength: number; // Sức mạnh
  agility: number; // Nhanh nhẹn
  intelligence: number; // Trí tuệ
  wisdom: number; // Khôn ngoan
  charisma: number; // Quyến rũ
  constitution: number; // Thể chất
  luck: number; // May mắn

  // Chỉ số phụ
  health: {
    current: number;
    max: number;
  };
  mana?: {
    current: number;
    max: number;
  };
  stamina?: {
    current: number;
    max: number;
  };

  // Chỉ số tu luyện (nếu là game tu tiên)
  cultivation?: {
    level: string;
    progress: number;
    maxProgress: number;
  };

  // Các chỉ số khác
  experience: number;
  level: number;
  nextLevelExp: number;
}

export interface GameStats {
  attributes?: CharacterAttributes;
  // Vẫn giữ cấu trúc động cho các chỉ số khác
  [key: string]: any;
}

export interface InventoryItem {
  name: string;
  description?: string;
  quantity: number;
  type?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface CharacterSkill {
  readonly name: string;
  readonly description?: string;
  readonly level?: number;
  readonly mastery?: string;
  readonly type?: string;
  readonly requirements?: string[];
}

// Enum cho các loại lore cơ bản
export enum LoreCategory {
  NPC = 'npc',
  LOCATION = 'location',
  ITEM = 'item',
  EVENT = 'event',
  WORLD = 'world',
  // Có thể thêm các loại mới ở đây
}

// Enum cho mức độ quan trọng
export enum ImportanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Interface cho mối quan hệ giữa các mục lore
export interface LoreRelation {
  readonly targetId: string;
  readonly targetTitle: string;
  readonly relationType: string;
  readonly description?: string;
  readonly strength?: number; // 0-100
}

export interface LoreFragment {
  readonly id: string; // Thêm ID duy nhất để tham chiếu
  readonly title: string;
  readonly content: string;
  // Cho phép sử dụng các loại từ enum hoặc bất kỳ chuỗi nào
  readonly type: string;
  readonly category: LoreCategory | string;
  readonly importance: ImportanceLevel | string;
  readonly timestamp: Date;
  // Thêm các thuộc tính mới
  readonly tags?: string[]; // Các tag để phân loại linh hoạt
  readonly relations?: LoreRelation[]; // Mối quan hệ với các mục lore khác
  readonly discoveryContext?: string; // Bối cảnh khám phá
  readonly evolutionStages?: Array<{
    readonly stage: string;
    readonly content: string;
    readonly unlockedAt?: Date;
  }>; // Cho phép lore phát triển theo thời gian
  readonly attributes?: Record<string, string | number | boolean>; // Thuộc tính tùy chỉnh
}

export interface GameChoice {
  readonly text: string;
  readonly number: number;
  readonly consequences?: string[];
  readonly requirements?: Record<string, number | string>;
}

// Enum cho các loại tương tác cơ bản (có thể mở rộng)
export enum InteractionType {
  STORY = 'story',
  USER_CHOICE = 'user_choice',
  USER_CUSTOM_ACTION = 'user_custom_action',
  USER_THINKING = 'user_thinking',
  USER_COMMUNICATION = 'user_communication',
  // Các loại tương tác mới có thể được thêm vào đây
}

// Interface cho các thuộc tính tùy chỉnh của tương tác
export interface InteractionAttributes {
  readonly [key: string]: string | number | boolean | object | null;
}

export interface StoryHistoryEntry {
  // Cho phép sử dụng các loại tương tác từ enum hoặc bất kỳ chuỗi nào
  readonly type: InteractionType | string;
  readonly content: string;
  readonly timestamp: Date;
  // Thay thế metadata bằng cấu trúc rõ ràng hơn
  readonly attributes?: InteractionAttributes;
  // Thêm trường để theo dõi tác động của tương tác này đến thế giới game
  readonly worldImpact?: WorldImpact;
}

export interface KarmaChange {
  readonly amount: number;
  readonly reason: string;
  readonly timestamp: Date;
  // Thêm trường để phân loại loại hành động gây ra thay đổi karma
  readonly actionCategory?: string;
  // Thêm trường để theo dõi đối tượng bị ảnh hưởng
  readonly affectedEntities?: string[];
}

export interface ReputationChanges {
  readonly [group: string]: number;
}

// Interface mới để theo dõi tác động của hành động đến thế giới game
export interface WorldImpact {
  // Thay đổi môi trường (thời tiết, cảnh quan, v.v.)
  readonly environmentalChanges?: {
    readonly [aspect: string]: {
      readonly before?: string | number;
      readonly after: string | number;
      readonly description?: string;
    };
  };

  // Thay đổi xã hội (chính trị, kinh tế, v.v.)
  readonly socialChanges?: {
    readonly [aspect: string]: {
      readonly before?: string | number;
      readonly after: string | number;
      readonly description?: string;
    };
  };

  // Các sự kiện được kích hoạt
  readonly triggeredEvents?: Array<{
    readonly eventId: string;
    readonly eventName: string;
    readonly probability: number;
    readonly conditions: Record<string, string | number | boolean>;
  }>;

  // Các mối quan hệ bị ảnh hưởng
  readonly affectedRelationships?: Array<{
    readonly entityId: string;
    readonly entityName: string;
    readonly relationshipChange: number;
    readonly newStatus?: string;
  }>;
}

// Enum cho độ khó
export enum DifficultyLevel {
  EASY = 'easy',
  NORMAL = 'normal',
  HARD = 'hard',
  NIGHTMARE = 'nightmare',
  CUSTOM = 'custom',
}

// Enum cho chế độ chơi
export enum GameMode {
  STORY = 'story',
  SURVIVAL = 'survival',
  ADVENTURE = 'adventure',
  SANDBOX = 'sandbox',
  ROLEPLAY = 'roleplay',
  SIMULATION = 'simulation',
  CUSTOM = 'custom',
}

// Enum cho ngôn ngữ
export enum GameLanguage {
  VIETNAMESE = 'vi',
  ENGLISH = 'en',
}

// Interface cho cấu hình thế giới
export interface WorldConfiguration {
  readonly name: string;
  readonly description: string;
  readonly genre: string[];
  readonly themes: string[];
  readonly magicSystem?: string;
  readonly technologyLevel?: string;
  readonly socialStructure?: string;
  readonly majorFactions?: string[];
  readonly geography?: string[];
  readonly historicalEvents?: string[];
  readonly rules?: string[];
  readonly customAttributes?: Record<string, unknown>;
}

export interface GameSettings {
  readonly characterName: string;
  readonly background: string;
  readonly world: string;
  readonly difficulty: DifficultyLevel | string;
  readonly gameMode: GameMode | string;
  readonly customPrompt?: string;
  readonly enableKarma?: boolean;
  readonly enableReputation?: boolean;
  readonly language?: GameLanguage | string;

  // Thêm các trường mới
  readonly worldConfiguration?: WorldConfiguration;
  readonly adaptiveDifficulty?: boolean; // Độ khó tự điều chỉnh
  readonly narrativeStyle?: string; // Phong cách tường thuật
  readonly playerAgency?: number; // Mức độ tự do của người chơi (0-100)
  readonly worldDynamism?: number; // Mức độ năng động của thế giới (0-100)
  readonly npcComplexity?: number; // Mức độ phức tạp của NPC (0-100)
  readonly consequenceDepth?: number; // Độ sâu của hậu quả (0-100)
  readonly randomEvents?: boolean; // Bật/tắt sự kiện ngẫu nhiên
  readonly permadeath?: boolean; // Cái chết vĩnh viễn
  readonly timeProgression?: 'real-time' | 'turn-based' | 'hybrid' | string; // Cách thời gian tiến triển
  readonly customGameRules?: Record<string, unknown>; // Quy tắc game tùy chỉnh
}

// Interface cho các phân đoạn nội dung
export interface ContentSegment {
  readonly type:
    | 'dialogue'
    | 'monologue'
    | 'action'
    | 'description'
    | 'system'
    | string;
  readonly content: string;
  readonly speaker?: string;
  readonly tone?: string;
  readonly emphasis?: 'normal' | 'strong' | 'weak';
  readonly metadata?: Record<string, unknown>;
}

// Interface cho các sự kiện được kích hoạt
export interface TriggeredEvent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: string;
  readonly immediateEffects?: string[];
  readonly longTermEffects?: string[];
  readonly relatedNpcs?: string[];
  readonly relatedLocations?: string[];
  readonly duration?: number;
  readonly probability?: number; // 0-100
}

export interface ParsedGameContent {
  // Nội dung câu chuyện có thể là chuỗi đơn giản hoặc mảng các phân đoạn có cấu trúc
  readonly storyText: string;
  readonly storySegments?: ContentSegment[];
  readonly choices: GameChoice[];
  readonly genericChoices: GameChoice[];
  readonly stats: GameStats;
  readonly inventory: InventoryItem[];
  readonly skills: CharacterSkill[];
  readonly lore: LoreFragment[];
  readonly karmaChange?: number;
  readonly karmaReason?: string;
  readonly reputationChanges?: ReputationChanges;
  readonly achievements?: string[];

  // Thay thế events đơn giản bằng cấu trúc phong phú hơn
  readonly triggeredEvents?: TriggeredEvent[];

  // Thêm các trường mới
  readonly worldStateChanges?: Partial<WorldState>; // Thay đổi trạng thái thế giới
  readonly npcUpdates?: Array<{
    readonly npcId: string;
    readonly npcName: string;
    readonly changes: Record<string, unknown>;
    readonly newDialogue?: string[];
    readonly newBehavior?: string;
    readonly locationChange?: string;
  }>; // Cập nhật về NPC
  readonly discoveredSecrets?: string[]; // Bí mật được phát hiện
  readonly questUpdates?: Array<{
    readonly questId: string;
    readonly status?: 'active' | 'completed' | 'failed' | 'hidden';
    readonly progress?: number;
    readonly newObjectives?: string[];
    readonly completedObjectives?: string[];
  }>; // Cập nhật nhiệm vụ
  readonly playerStatusEffects?: Array<{
    readonly name: string;
    readonly description: string;
    readonly duration: number;
    readonly effects: Record<string, number | string>;
  }>; // Hiệu ứng trạng thái người chơi
  readonly dynamicContent?: Record<string, unknown>; // Nội dung động khác
}

// Enum cho các loại hành động cơ bản
export enum ActionType {
  CHOICE = 'choice',
  CUSTOM = 'custom',
  THINK = 'think',
  COMMUNICATE = 'communicate',
  // Có thể thêm các loại mới ở đây
}

export interface GameAction {
  // Cho phép sử dụng các loại từ enum hoặc bất kỳ chuỗi nào
  readonly type: ActionType | string;
  readonly choiceNumber?: number;
  readonly customAction?: string;
  readonly thought?: string;
  readonly communication?: string;
  readonly timestamp: Date;

  // Thêm các trường mới
  readonly target?: string; // Đối tượng của hành động (NPC, vật phẩm, địa điểm)
  readonly context?: string; // Bối cảnh của hành động
  readonly intensity?: number; // Cường độ của hành động (0-100)
  readonly intent?: string; // Ý định của người chơi
  readonly expectedOutcome?: string; // Kết quả mong đợi
  readonly alternatives?: string[]; // Các lựa chọn thay thế
  readonly constraints?: Record<string, unknown>; // Các ràng buộc
  readonly metadata?: Record<string, unknown>; // Metadata khác
}

// Interface cho trạng thái thế giới game
export interface WorldState {
  // Thời gian trong game
  gameTime: {
    day: number;
    hour: number;
    minute: number;
    season: string;
    year: number;
  };

  // Thời tiết và môi trường
  environment: {
    weather: string;
    temperature: number;
    conditions: string[];
    specialEffects?: string[];
  };

  // Trạng thái xã hội
  society: {
    politicalState: string;
    economicState: string;
    dominantFaction?: string;
    tensions?: Record<string, number>; // 0-100
    events?: string[];
  };

  // Các khu vực đã khám phá
  discoveredRegions: string[];

  // Các sự kiện đang diễn ra
  activeEvents: Array<{
    id: string;
    name: string;
    description: string;
    type?: string;
    startTime: Date;
    duration?: number; // Thời lượng tính bằng phút
    affectedRegions?: string[];
    consequences?: string[];
  }>;

  // Các thuộc tính tùy chỉnh khác
  attributes?: Record<string, unknown>;
}

// Interface cho mối quan hệ với NPC
export interface NpcRelationship {
  npcId: string;
  npcName: string;
  relationshipLevel: number; // -100 đến 100
  status: string; // friend, enemy, neutral, etc.
  interactions: Array<{
    date: Date;
    type: string;
    outcome: string;
    impact: number;
  }>;
  memories: string[]; // Những gì NPC nhớ về người chơi
  currentLocation?: string;
  currentActivity?: string;
  schedule?: Record<string, string>; // Lịch trình của NPC
}

export interface GameState {
  readonly id: string;
  readonly userId: string;
  readonly settings: GameSettings;
  readonly characterStats: GameStats;
  readonly inventoryItems: InventoryItem[];
  readonly characterSkills: CharacterSkill[];
  readonly loreFragments: LoreFragment[];
  readonly storyHistory: StoryHistoryEntry[];
  readonly currentPrompt: string;
  readonly currentChoices: GameChoice[];
  readonly currentGenericChoices: GameChoice[];
  readonly karmaScore: number;
  readonly reputation: ReputationChanges;
  readonly active: boolean;
  readonly deathDate: Date | null;
  readonly deathCause: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  // Thêm các trường mới
  readonly worldState: WorldState; // Trạng thái thế giới game
  readonly npcRelationships: NpcRelationship[]; // Mối quan hệ với NPC
  readonly questLog?: Array<{
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly status: 'active' | 'completed' | 'failed' | 'hidden';
    readonly progress: number; // 0-100
    readonly objectives: Array<{
      readonly description: string;
      readonly completed: boolean;
      readonly optional?: boolean;
    }>;
    readonly rewards?: string[];
    readonly relatedNpcs?: string[];
    readonly deadline?: Date;
  }>; // Nhật ký nhiệm vụ
  readonly playerChoiceHistory?: Array<{
    readonly choiceId: string;
    readonly choiceText: string;
    readonly timestamp: Date;
    readonly consequences: string[];
    readonly alternativePaths?: string[];
  }>; // Lịch sử lựa chọn của người chơi
  readonly worldEvolution?: Array<{
    readonly timestamp: Date;
    readonly aspect: string;
    readonly change: string;
    readonly playerInfluence: number; // 0-100
  }>; // Theo dõi sự tiến hóa của thế giới
}

export interface GameCreationResult {
  readonly game: GameState;
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
}

export interface GameActionResult {
  readonly game: GameState;
  readonly success: boolean;
  readonly message?: string;
  readonly error?: string;
  readonly isGameOver?: boolean;
}

export interface LifeSummary {
  readonly totalDays: number;
  readonly majorEvents: string[];
  readonly finalStats: GameStats;
  readonly achievements: string[];
  readonly karmaScore: number;
  readonly reputation: ReputationChanges;
  readonly deathCause: string | null;
  readonly legacy: string;
}

export interface ResurrectionOptions {
  readonly available: boolean;
  readonly skillName?: string;
  readonly cost?: string;
  readonly penalty?: string;
  readonly description?: string;
}

export interface GameMetrics {
  readonly totalGames: number;
  readonly activeGames: number;
  readonly completedGames: number;
  readonly averageSessionLength: number;
  readonly popularChoices: Array<{
    readonly text: string;
    readonly count: number;
  }>;
}

export interface AIPromptContext {
  readonly gameSettings: GameSettings;
  readonly currentStats: GameStats;
  readonly recentHistory: StoryHistoryEntry[];
  readonly playerAction: GameAction;
  readonly worldState: string;
  readonly characterBackground: string;
}
