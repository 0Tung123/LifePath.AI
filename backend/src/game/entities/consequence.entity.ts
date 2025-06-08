import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Character } from './character.entity';
import { GameSession } from './game-session.entity';

export enum ConsequenceSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

@Entity()
export class Consequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameSessionId: string;

  @ManyToOne(() => GameSession)
  @JoinColumn({ name: 'gameSessionId' })
  gameSession: GameSession;

  @Column()
  characterId: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column('text')
  description: string;

  @Column({ type: 'timestamptz', nullable: true })
  triggerTime: Date;

  @Column('enum', { enum: ConsequenceSeverity })
  severity: ConsequenceSeverity;

  @Column()
  isPermanent: boolean;

  @Column('simple-array', { nullable: true })
  affectedEntities: string[];

  @Column({ default: false })
  isTriggered: boolean;

  @Column({ nullable: true })
  sourceActionId: string;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}