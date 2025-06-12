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
import { StoryNode } from './story-node.entity';

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

  @Column('simple-json', { nullable: true })
  gameState: {
    currentLocation: string;
    visitedLocations: string[];
    discoveredLocations: string[];
    completedQuests: string[];
    questLog: string[];
    acquiredItems: string[];
    npcRelations: Record<string, number>; // NPC ID to relation score
    flags: Record<string, any>; // Game flags for story branching
    time?: {
      day: number;
      hour: number;
      minute: number;
    };
    weather?: string;
    // Permadeath related fields
    dangerLevel: number; // Current danger level from 0-10
    survivalChance: number; // Current chance of survival as a percentage
    dangerWarnings: string[]; // Array of warning messages
    nearDeathExperiences: number; // Counter of close calls
    pendingConsequences: Array<{
      id: string;
      title: string;
      triggerTime: string;
      severity: string;
      description: string;
    }>; // Pending consequences that will trigger
  };

  @Column({ default: 'normal' })
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'hardcore';

  @Column({ default: false })
  permadeathEnabled: boolean;

  @Column({ nullable: true })
  deathReason: string;

  @ManyToOne(() => Character, (character) => character.gameSessions)
  @JoinColumn()
  character: Character;

  @ManyToOne(() => StoryNode, { nullable: true })
  @JoinColumn({ name: 'currentStoryNodeId' })
  currentStoryNode: StoryNode;

  @OneToMany(() => StoryNode, (storyNode) => storyNode.gameSession)
  storyNodes: StoryNode[];
}
