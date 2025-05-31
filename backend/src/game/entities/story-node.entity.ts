import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { GameSession } from './game-session.entity';
import { Choice } from './choice.entity';

@Entity()
export class StoryNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  sceneDescription: string;

  @Column({ default: false })
  isCombatScene: boolean;

  @Column('simple-json', { nullable: true })
  combatData: {
    enemies: {
      id: string;
      name: string;
      level: number;
      health: number;
      attributes: Record<string, number>;
      abilities: string[];
    }[];
    rewards: {
      experience: number;
      gold: number;
      items: {
        id: string;
        name: string;
        description?: string;
        quantity: number;
        dropChance: number;
        type?: string;
        value?: number;
        rarity?: string;
      }[];
    };
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: false })
  isEnding: boolean;

  @ManyToOne(() => GameSession, (gameSession) => gameSession.storyNodes)
  @JoinColumn()
  gameSession: GameSession;

  @OneToMany(() => Choice, (choice) => choice.storyNode, { cascade: true })
  choices: Choice[];
}
