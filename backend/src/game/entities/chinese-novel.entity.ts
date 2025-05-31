import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export interface GameStats {
  [key: string]: string | number;
}

export interface InventoryItem {
  name: string;
  description: string;
  thuocTinh: string;
}

export interface Skill {
  name: string;
  description: string;
  thanhThuc: string;
  hieuQua: string;
  tienHoa?: string;
}

export interface LoreEntry {
  type: 'NPC' | 'ITEM' | 'LOCATION';
  name: string;
  description: string;
}

export interface StoryChoice {
  id: number;
  text: string;
  selected?: boolean;
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  stats?: GameStats;
  inventory?: InventoryItem[];
  skills?: Skill[];
  lore?: LoreEntry[];
  choices: StoryChoice[];
  selectedChoice?: number;
  createdAt: Date;
}

@Entity('chinese_novels')
export class ChineseNovel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: [
      'tu-tien',
      'vo-hiep',
      'hien-dai',
      'trinh-tham',
      'kinh-di',
      'gia-tuong',
      'fantasy',
      'huyen-huyen',
    ],
    default: 'tu-tien',
  })
  theme: string;

  @Column('text')
  setting: string;

  @Column()
  characterName: string;

  @Column({
    type: 'enum',
    enum: ['nam', 'nu'],
    default: 'nam',
  })
  characterGender: string;

  @Column('text')
  characterDescription: string;

  @Column('jsonb', { default: [] })
  chapters: StoryChapter[];

  @Column('jsonb', { nullable: true })
  currentStats: GameStats;

  @Column('jsonb', { default: [] })
  currentInventory: InventoryItem[];

  @Column('jsonb', { default: [] })
  currentSkills: Skill[];

  @Column('jsonb', { default: [] })
  loreEntries: LoreEntry[];

  @Column({ default: 0 })
  currentChapterIndex: number;

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'paused';

  @Column({ default: 0 })
  totalWords: number;

  @Column({ default: 0 })
  readingTime: number; // in minutes

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  views: number;

  @Column('simple-array', { default: [] })
  tags: string[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
