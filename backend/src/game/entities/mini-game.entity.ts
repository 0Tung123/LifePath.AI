import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StoryNode } from './story-node.entity';

export enum MiniGameType {
  PUZZLE = 'puzzle',
  REFLEX = 'reflex',
  ASSEMBLY = 'assembly',
}

export enum PuzzleType {
  LOGIC = 'logic',
  WORD = 'word',
  MATH = 'math',
  PATTERN = 'pattern',
}

export enum ReflexGameType {
  DODGE = 'dodge',
  RHYTHM = 'rhythm',
  REACTION = 'reaction',
}

@Entity()
export class MiniGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: MiniGameType,
  })
  type: MiniGameType;

  @Column({ default: 3 })
  difficulty: number; // 1-5

  @Column({ default: true })
  mandatory: boolean;

  @Column({ nullable: true })
  completionNodeId: string;

  @Column({ nullable: true })
  failureNodeId: string;

  @Column('simple-json', { nullable: true })
  rewards: {
    experience?: number;
    gold?: number;
    items?: {
      id: string;
      name: string;
      quantity: number;
    }[];
    skills?: {
      id: string;
      experience: number;
    }[];
    traits?: Record<string, number>;
  };

  @Column('simple-json')
  config: Record<string, any>;

  @ManyToOne(() => StoryNode, { nullable: true })
  @JoinColumn({ name: 'completionNodeId' })
  completionNode: StoryNode;

  @ManyToOne(() => StoryNode, { nullable: true })
  @JoinColumn({ name: 'failureNodeId' })
  failureNode: StoryNode;
}