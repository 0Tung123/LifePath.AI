import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Character } from './character.entity';
import { GameSession } from './game-session.entity';

@Entity()
export class CharacterDeath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  characterId: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column()
  gameSessionId: string;

  @ManyToOne(() => GameSession)
  @JoinColumn({ name: 'gameSessionId' })
  gameSession: GameSession;

  @Column('text')
  deathDescription: string;

  @Column({ nullable: true })
  deathCause: string;

  @Column({ nullable: true })
  lastNodeId: string;

  @Column({ nullable: true })
  lastDecision: string;

  @Column('simple-json', { nullable: true })
  stats: {
    level: number;
    daysSurvived: number;
    questsCompleted: number;
    significantChoices: number;
  };

  @Column('simple-array', { nullable: true })
  lastWords: string[];

  @CreateDateColumn()
  timestamp: Date;
}