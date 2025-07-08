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
  CharacterSkill,
  LoreFragment,
  GameChoice,
  StoryHistoryEntry,
  WorldState,
  NpcRelationship,
} from '../../common/types/game-engine.types';

import {
  Achievement,
  ChatHistoryItem,
  ImportantEvent,
  ItemUsageRecord,
  KnowledgeBaseItem,
  NpcInfo,
} from 'src/common/types';

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
  storyHistory!: StoryHistoryEntry[];

  @Column({ type: 'jsonb', name: 'character_stats' })
  characterStats!: GameStats;

  @Column({ type: 'jsonb', name: 'inventory_items' })
  inventoryItems!: InventoryItem[];

  @Column({ type: 'jsonb', name: 'character_skills' })
  characterSkills!: CharacterSkill[];

  @Column({ type: 'jsonb', name: 'lore_fragments' })
  loreFragments!: LoreFragment[];

  @Column({ type: 'text', name: 'current_prompt', nullable: true })
  currentPrompt!: string;

  @Column({ type: 'jsonb', name: 'current_choices', nullable: true })
  currentChoices!: GameChoice[];

  @Column({ type: 'jsonb', name: 'current_generic_choices', nullable: true })
  currentGenericChoices!: GameChoice[];

  // Thêm trường mới cho trạng thái thế giới
  @Column({ type: 'jsonb', name: 'world_state', nullable: true })
  worldState!: WorldState;

  // Thêm trường mới cho mối quan hệ với NPC
  @Column({ type: 'jsonb', name: 'npc_relationships', nullable: true })
  npcRelationships!: NpcRelationship[];

  // Thêm trường mới cho nhật ký nhiệm vụ
  @Column({ type: 'jsonb', name: 'quest_log', nullable: true })
  questLog!: Array<{
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'failed' | 'hidden';
    progress: number;
    objectives: Array<{
      description: string;
      completed: boolean;
      optional?: boolean;
    }>;
    rewards?: string[];
    relatedNpcs?: string[];
    deadline?: Date;
  }>;

  // Thêm trường mới cho lịch sử lựa chọn của người chơi
  @Column({ type: 'jsonb', name: 'player_choice_history', nullable: true })
  playerChoiceHistory!: Array<{
    choiceId: string;
    choiceText: string;
    timestamp: Date;
    consequences: string[];
    alternativePaths?: string[];
  }>;

  // Thêm trường mới cho sự tiến hóa của thế giới
  @Column({ type: 'jsonb', name: 'world_evolution', nullable: true })
  worldEvolution!: Array<{
    timestamp: Date;
    aspect: string;
    change: string;
    playerInfluence: number;
  }>;

  // Thêm trường mới cho hiệu ứng trạng thái người chơi
  @Column({ type: 'jsonb', name: 'player_status_effects', nullable: true })
  playerStatusEffects!: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    remainingDuration: number;
    intensity?: number;
    source?: string;
    type?: string;
    effects: Record<string, number | string>;
    visualEffects?: string[];
    cures?: string[];
    appliedAt: Date;
  }>;

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
