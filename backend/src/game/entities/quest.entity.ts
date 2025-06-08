import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Character } from './character.entity';
import { GameSession } from './game-session.entity';

export enum QuestStatus {
  AVAILABLE = 'available',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum QuestType {
  MAIN = 'main',
  SIDE = 'side',
  DYNAMIC = 'dynamic',
  HIDDEN = 'hidden',
}

@Entity()
export class Quest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  completionCriteria: string;

  @Column({
    type: 'enum',
    enum: QuestStatus,
    default: QuestStatus.AVAILABLE,
  })
  status: QuestStatus;

  @Column({
    type: 'enum',
    enum: QuestType,
    default: QuestType.DYNAMIC,
  })
  type: QuestType;

  @Column({ nullable: true })
  characterId: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column({ nullable: true })
  gameSessionId: string;

  @ManyToOne(() => GameSession)
  @JoinColumn({ name: 'gameSessionId' })
  gameSession: GameSession;

  @Column('simple-json', { nullable: true })
  rewards: {
    experience?: number;
    gold?: number;
    items?: string[];
    other?: string;
  };

  @Column('simple-array', { nullable: true })
  triggers: string[];

  @Column('simple-array', { nullable: true })
  relatedItems: string[];

  @Column('simple-array', { nullable: true })
  relatedLocations: string[];

  @Column('simple-array', { nullable: true })
  relatedNpcs: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}