import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { GameSession } from './game-session.entity';
import { StoryNode } from './story-node.entity';

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  autoSummary: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  gameSessionId: string;

  @Column()
  storyNodeId: string;

  @ManyToOne(() => GameSession)
  @JoinColumn({ name: 'gameSessionId' })
  gameSession: GameSession;

  @ManyToOne(() => StoryNode)
  @JoinColumn({ name: 'storyNodeId' })
  storyNode: StoryNode;
}