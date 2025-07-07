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
  StorySegment,
  NpcInfo,
  ItemUsageRecord,
  ImportantEvent,
  Achievement,
  ChatHistoryItem,
  KnowledgeBaseItem,
} from '../../common/types/game.types';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'jsonb' })
  settings!: GameSettingsDto;

  @Column({ type: 'jsonb', name: 'story_history' })
  storyHistory!: StorySegment[];

  @Column({ type: 'jsonb', name: 'character_stats' })
  characterStats!: GameStats;

  @Column({ type: 'jsonb', name: 'inventory_items' })
  inventoryItems!: InventoryItem[];

  @Column({ type: 'jsonb', name: 'character_skills' })
  characterSkills!: Skill[];

  @Column({ type: 'jsonb', name: 'lore_fragments' })
  loreFragments!: LoreFragment[];

  @Column({ type: 'text', name: 'current_prompt', nullable: true })
  currentPrompt!: string;

  @Column({ type: 'jsonb', name: 'current_choices', nullable: true })
  currentChoices!: Choice[];

  @Column({ type: 'jsonb', name: 'chat_history_for_gemini', nullable: true })
  chatHistoryForGemini!: ChatHistoryItem[];

  @Column({ type: 'jsonb', name: 'knowledge_base', nullable: true })
  knowledgeBase!: KnowledgeBaseItem[];

  @Column({ type: 'text', name: 'current_objective', nullable: true })
  currentObjective!: string | null;

  @Column({ type: 'jsonb', name: 'npcs_met', nullable: true })
  npcsMet!: NpcInfo[];

  @Column({ type: 'jsonb', name: 'items_used', nullable: true })
  itemsUsed!: ItemUsageRecord[];

  @Column({ type: 'jsonb', name: 'important_events', nullable: true })
  importantEvents!: ImportantEvent[];

  @Column({ type: 'jsonb', name: 'achievements', nullable: true })
  achievements!: Achievement[];

  @Column({ type: 'integer', name: 'karma_score', default: 0 })
  karmaScore!: number;

  @Column({ type: 'jsonb', name: 'reputation', nullable: true })
  reputation!: { [key: string]: number };

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'timestamp', name: 'death_date', nullable: true })
  deathDate!: Date | null;

  @Column({ type: 'text', name: 'death_cause', nullable: true })
  deathCause!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
