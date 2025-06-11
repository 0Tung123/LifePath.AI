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

// Định nghĩa các đặc điểm tính cách (thang điểm 0-100)
export interface CharacterTraits {
  bravery: number;     // Dũng cảm (0-100)
  caution: number;     // Thận trọng (0-100)
  kindness: number;    // Nhân từ (0-100)
  ambition: number;    // Tham vọng (0-100)
  loyalty: number;     // Trung thành (0-100)
  [key: string]: number | undefined;
}

// Định nghĩa cấu trúc kỹ năng
export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;           // Cấp độ kỹ năng (1-10)
  maxLevel: number;
  experience: number;      // Kinh nghiệm kỹ năng hiện tại
  experienceToNextLevel: number;
  type: 'active' | 'passive';
  category: string;        // combat, magic, social, etc.
  effects: {
    statName: string;
    value: number;
    isPercentage: boolean;
  }[];
  requiredLevel?: number;  // Yêu cầu level nhân vật
  parentSkillId?: string;  // ID kỹ năng cha (nếu có)
  childSkillIds?: string[];  // ID các kỹ năng con
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

  @Column('simple-json', { default: { bravery: 50, caution: 50, kindness: 50, ambition: 50, loyalty: 50 } })
  traits: CharacterTraits;

  @Column('simple-array')
  skillIds: string[];

  @Column('simple-json', { nullable: true })
  skills: Skill[];

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

  @Column({ default: 100 })
  experienceToNextLevel: number;

  @Column({ default: 0 })
  skillPoints: number;

  @Column({ nullable: true })
  backstory: string;

  @Column('simple-json', { nullable: true })
  relationships: {
    npcId: string;
    name: string;
    relation: number; // -100 to 100
    type: string; // friend, enemy, mentor, etc.
  }[];

  @Column('simple-json', { nullable: true })
  factionReputations: {
    factionId: string;
    factionName: string;
    reputation: number; // -100 to 100
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

  @ManyToOne(() => User, (user) => user.characters)
  @JoinColumn()
  user: User;

  @OneToMany(() => GameSession, (gameSession) => gameSession.character)
  gameSessions: GameSession[];
}
