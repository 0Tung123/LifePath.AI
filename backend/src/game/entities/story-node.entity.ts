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

export enum TimeOfDay {
  DAWN = 'dawn',
  MORNING = 'morning',
  NOON = 'noon',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  NIGHT = 'night',
  MIDNIGHT = 'midnight',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

export enum BranchType {
  MAIN = 'main',
  VARIANT = 'variant',
  SIDE = 'side',
}

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
  
  @Column({ default: false })
  isRoot: boolean;
  
  @Column({ nullable: true })
  parentNodeId: string;
  
  @Column({ nullable: true })
  gameSessionId: string;
  
  @Column({
    type: 'enum',
    enum: TimeOfDay,
    nullable: true,
  })
  timeOfDay: TimeOfDay;

  @Column({
    type: 'enum',
    enum: Season,
    nullable: true,
  })
  season: Season;

  @Column({
    type: 'enum',
    enum: BranchType,
    default: BranchType.MAIN,
  })
  branchType: BranchType;

  @Column('simple-array', { nullable: true })
  requiredFlags: string[];
  
  @Column('simple-json', { nullable: true })
  requiredStats: Record<string, number>;
  
  @Column('simple-json', { nullable: true })
  statsEffects: Record<string, number>;
  
  @Column('simple-json', { nullable: true })
  metadata: {
    inputType?: string;
    userInput?: string;
    dangerLevel?: number;
    tags?: string[];
    mood?: string;
    weight?: number; // Trọng số quyết định (2-10)
    bookmarkable?: boolean; // Có thể đặt bookmark tại node này
    [key: string]: any;
  };

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
  
  @Column({ nullable: true })
  endingType: string; // Loại kết thúc nếu là node kết thúc

  @ManyToOne(() => GameSession, (gameSession) => gameSession.storyNodes)
  @JoinColumn()
  gameSession: GameSession;

  @OneToMany(() => Choice, (choice) => choice.storyNode, { cascade: true })
  choices: Choice[];
}
