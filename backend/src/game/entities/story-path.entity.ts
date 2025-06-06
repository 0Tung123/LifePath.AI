import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { GameSession } from './game-session.entity';
import { StoryNode } from './story-node.entity';

@Entity()
export class StoryPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nodeId: string;

  @Column()
  choiceId: string;

  @Column()
  choiceText: string;

  @Column({ default: 0 })
  stepOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  branchId: string; // Để nhóm các paths thuộc cùng một nhánh

  @Column({ nullable: true })
  parentPathId: string; // Path cha để tạo cây nhánh

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => GameSession, (gameSession) => gameSession.storyPaths)
  @JoinColumn()
  gameSession: GameSession;

  @ManyToOne(() => StoryNode)
  @JoinColumn({ name: 'nodeId' })
  storyNode: StoryNode;
}