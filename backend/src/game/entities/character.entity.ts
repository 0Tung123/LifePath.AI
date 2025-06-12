import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { GameSession } from './game-session.entity';

export enum GameGenre {
  FANTASY = 'fantasy',
  MODERN = 'modern',
  SCIFI = 'scifi',
  XIANXIA = 'xianxia', // Tiên Hiệp
  WUXIA = 'wuxia', // Võ Hiệp
  HORROR = 'horror',
  CYBERPUNK = 'cyberpunk',
  STEAMPUNK = 'steampunk',
  POSTAPOCALYPTIC = 'postapocalyptic',
  HISTORICAL = 'historical',
}

// Định nghĩa interface cho attributes để tránh lỗi TypeScript
export interface CharacterAttributes {
  // Thuộc tính cơ bản (có ở tất cả các thể loại)
  strength: number;
  intelligence: number;
  dexterity: number;
  charisma: number;
  health: number;
  mana: number;

  // Thuộc tính Tiên Hiệp/Võ Hiệp
  cultivation?: number;
  qi?: number;
  perception?: number;

  // Thuộc tính Sci-Fi
  tech?: number;
  hacking?: number;
  piloting?: number;

  // Thuộc tính Horror
  sanity?: number;
  willpower?: number;

  // Thuộc tính hiện đại
  education?: number;
  wealth?: number;
  influence?: number;

  // Cho phép thêm thuộc tính động
  [key: string]: number | undefined;
}

@Entity()
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  characterClass: string;

  @Column({
    type: 'enum',
    enum: GameGenre,
    default: GameGenre.FANTASY,
  })
  primaryGenre: GameGenre;

  @Column('simple-array', { nullable: true })
  secondaryGenres: GameGenre[];

  @Column({ nullable: true })
  customGenreDescription: string;

  @Column('simple-json')
  attributes: CharacterAttributes;

  @Column('simple-array')
  skills: string[];

  @Column('simple-json', { nullable: true })
  specialAbilities: {
    name: string;
    description: string;
    cooldown?: number;
    cost?: {
      type: string;
      amount: number;
    };
  }[];

  @Column('simple-json', { nullable: true })
  inventory: {
    items: {
      id: string;
      name: string;
      description: string;
      quantity: number;
      type?: string;
      effects?: Record<string, any>;
      value?: number;
      rarity?: string;
    }[];
    currency: {
      gold?: number;
      credits?: number;
      yuan?: number;
      spirit_stones?: number;
      [key: string]: number | undefined;
    };
  };

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ nullable: true })
  backstory: string;

  @Column('simple-json', { nullable: true })
  relationships: {
    npcId: string;
    name: string;
    relation: number; // -100 to 100
    type: string; // friend, enemy, mentor, etc.
  }[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ default: false })
  isDead: boolean;

  @Column({ nullable: true })
  deathDate: Date;

  @Column({ nullable: true })
  epitaph: string;

  @Column({ nullable: true })
  legacyId: string;

  @Column('simple-json', { nullable: true })
  survivalStats: {
    daysSurvived: number;
    dangerousSituationsOvercome: number;
    nearDeathExperiences: number;
    majorDecisionsMade: number;
  };

  @Column('simple-json', { nullable: true })
  settings: {
    permadeathEnabled: boolean;
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'hardcore';
    [key: string]: any;
  };

  @Column('simple-json', { nullable: true })
  history: {
    event: string;
    timestamp: Date;
    details?: Record<string, any>;
  }[];

  @ManyToOne(() => User, (user) => user.characters)
  @JoinColumn()
  user: User;

  @OneToMany(() => GameSession, (gameSession) => gameSession.character)
  gameSessions: GameSession[];
}
