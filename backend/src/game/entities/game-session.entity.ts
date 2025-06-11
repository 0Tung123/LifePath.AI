import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Character } from './character.entity';
import { StoryNode, TimeOfDay, Season } from './story-node.entity';
import { Bookmark } from './bookmark.entity';

export interface WorldLocation {
  id: string;
  name: string;
  description: string;
  timeOfDayDescription?: Record<TimeOfDay, string>;
  seasonDescription?: Record<Season, string>;
  originalState: string;
  currentState: string;
  connectedLocations: string[];
  npcIds: string[];
  pointsOfInterest?: {
    id: string;
    name: string;
    description: string;
    interactable: boolean;
  }[];
  requiredFlags?: string[];
}

export interface WorldNPC {
  id: string;
  name: string;
  description: string;
  factionIds: string[];
  reputation: number; // -100 to 100
  relationship: 'hostile' | 'neutral' | 'friendly' | 'allied';
  currentLocationId: string;
  schedule?: {
    [key in TimeOfDay]?: {
      locationId: string;
      activity: string;
    };
  };
  memory?: {
    interactionId: string;
    type: string;
    content: string;
    date: Date;
  }[];
}

export interface WorldFaction {
  id: string;
  name: string;
  description: string;
  reputation: number; // -100 to 100
  leaderNpcId?: string;
  alliedFactions?: string[];
  enemyFactions?: string[];
  territoriesIds?: string[];
}

@Entity()
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSavedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ nullable: true })
  currentStoryNodeId: string;

  @Column({
    type: 'enum',
    enum: TimeOfDay,
    default: TimeOfDay.MORNING,
  })
  timeOfDay: TimeOfDay;

  @Column({
    type: 'enum',
    enum: Season,
    default: Season.SPRING,
  })
  season: Season;

  @Column({ default: 1 })
  seasonDay: number;

  @Column('simple-json', { nullable: true })
  gameState: {
    currentLocation: string;
    visitedLocations: string[];
    discoveredLocations: string[];
    completedQuests: string[];
    activeQuests: string[];
    questLog: string[];
    acquiredItems: string[];
    flags: Record<string, any>; // Game flags for story branching
    weather?: string;
    // Permadeath related fields
    dangerLevel: number; // Current danger level from 0-10
    survivalChance: number; // Current chance of survival as a percentage
    dangerWarnings: string[]; // Array of warning messages
    nearDeathExperiences: number; // Counter of close calls
    pendingConsequences: string[]; // IDs of consequences that will trigger
  };

  @Column('simple-json', { nullable: true })
  worldState: {
    locations: WorldLocation[];
    npcs: WorldNPC[];
    factions: WorldFaction[];
    changedLocations: Record<string, {
      previousState: string;
      newState: string;
      reason: string;
      timestamp: Date;
    }>;
  };
  
  @Column({ default: 'normal' })
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'hardcore';
  
  @Column({ default: false })
  permadeathEnabled: boolean;
  
  @Column({ nullable: true })
  deathReason: string;

  @Column('simple-json', { default: [] })
  decisionHistory: {
    id: string;
    timestamp: Date;
    nodeId: string;
    decisionType: string;
    content: string;
    weight: number;
    affectedTraits?: Record<string, number>;
    affectedStats?: Record<string, number>;
    affectedFactions?: Record<string, number>;
    tags?: string[];
  }[];

  @Column('simple-json', { default: {
    combatPreference: 50,
    dialogueLength: 50,
    explorationTendency: 50,
    moralAlignment: 0,
    riskTolerance: 50,
    difficultyLevel: 3
  }})
  gameplayProfile: {
    combatPreference: number; // 0-100 (thấp: tránh, cao: thích)
    dialogueLength: number; // 0-100 (thấp: ngắn gọn, cao: chi tiết)
    explorationTendency: number; // 0-100 (thấp: tuyến tính, cao: khám phá)
    moralAlignment: number; // -100 đến 100 (âm: xấu, dương: tốt)
    riskTolerance: number; // 0-100 (thấp: thận trọng, cao: mạo hiểm)
    writingStyle?: Record<string, any>; // Phân tích phong cách viết
    difficultyLevel: number; // 1-5 (độ khó thích hợp)
    preferredThemes?: Record<string, number>; // Chủ đề ưa thích
  };

  @ManyToOne(() => Character, (character) => character.gameSessions)
  @JoinColumn()
  character: Character;

  @ManyToOne(() => StoryNode, { nullable: true })
  @JoinColumn({ name: 'currentStoryNodeId' })
  currentStoryNode: StoryNode;

  @OneToMany(() => StoryNode, (storyNode) => storyNode.gameSession)
  storyNodes: StoryNode[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.gameSession)
  bookmarks: Bookmark[];
}
