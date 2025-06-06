import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Character } from './character.entity';
import { StoryNode } from './story-node.entity';
import { StoryPath } from './story-path.entity';

@Entity()
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

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
  };

  @ManyToOne(() => Character, (character) => character.gameSessions)
  @JoinColumn()
  character: Character;

  @ManyToOne(() => StoryNode, { nullable: true })
  @JoinColumn({ name: 'currentStoryNodeId' })
  currentStoryNode: StoryNode;

  @OneToMany(() => StoryNode, (storyNode) => storyNode.gameSession)
  storyNodes: StoryNode[];

  @OneToMany(() => StoryPath, (storyPath) => storyPath.gameSession)
  storyPaths: StoryPath[];
}
