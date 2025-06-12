import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { GameSettingsDto } from '../dto/create-game.dto';
import {
  GameStats,
  InventoryItem,
  Skill,
  LoreFragment,
  Choice,
} from '../interfaces/game-content.interface';

interface StorySegment {
  text: string;
  timestamp: Date;
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb' })
  settings: GameSettingsDto;

  @Column({ type: 'jsonb', name: 'story_history' })
  storyHistory: StorySegment[];

  @Column({ type: 'jsonb', name: 'character_stats' })
  characterStats: GameStats;

  @Column({ type: 'jsonb', name: 'inventory_items' })
  inventoryItems: InventoryItem[];

  @Column({ type: 'jsonb', name: 'character_skills' })
  characterSkills: Skill[];

  @Column({ type: 'jsonb', name: 'lore_fragments' })
  loreFragments: LoreFragment[];

  @Column({ type: 'text', name: 'current_prompt', nullable: true })
  currentPrompt: string;

  @Column({ type: 'jsonb', name: 'current_choices', nullable: true })
  currentChoices: Choice[];

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
