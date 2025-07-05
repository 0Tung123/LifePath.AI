import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Game } from './game.entity';

@Entity('npcs')
@Index(['gameId', 'name'])
@Index(['gameId', 'discoveryStage'])
@Index(['gameId', 'importance'])
export class NPC {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  role?: string;

  @Column({ length: 255, nullable: true })
  faction?: string;

  @Column({
    type: 'enum',
    enum: ['hidden', 'mentioned', 'detailed', 'familiar'],
    default: 'hidden',
  })
  discoveryStage: 'hidden' | 'mentioned' | 'detailed' | 'familiar';

  @Column({ type: 'timestamp', nullable: true })
  firstMentionedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  firstInteractionAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalInteractions: number;

  @Column({
    type: 'enum',
    enum: [
      'unknown',
      'stranger',
      'acquaintance',
      'friend',
      'ally',
      'enemy',
      'rival',
      'romantic',
    ],
    default: 'unknown',
  })
  relationshipStatus:
    | 'unknown'
    | 'stranger'
    | 'acquaintance'
    | 'friend'
    | 'ally'
    | 'enemy'
    | 'rival'
    | 'romantic';

  @Column({ type: 'int', default: 0 })
  relationshipScore: number;

  @Column({ type: 'json', default: () => "'[]'" })
  knownAttributes: string[];

  @Column({ type: 'json', default: () => "'[]'" })
  hiddenAttributes: string[];

  @Column({ length: 255, nullable: true })
  lastSeenAt?: string;

  @Column({ type: 'int', nullable: true })
  lastSeenChapter?: number;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'missing', 'deceased'],
    default: 'active',
  })
  currentStatus: 'active' | 'inactive' | 'missing' | 'deceased';

  @Column({
    type: 'enum',
    enum: ['minor', 'major', 'critical'],
    default: 'minor',
  })
  importance: 'minor' | 'major' | 'critical';

  @Column({ type: 'json', nullable: true })
  loreData?: any;

  @Column({ type: 'json', default: () => "'{}'" })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Game, (game) => game.npcs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @OneToMany(() => NPCInteraction, (interaction) => interaction.npc, {
    cascade: true,
  })
  interactions: NPCInteraction[];
}

@Entity('npc_interactions')
@Index(['npcId', 'chapterNumber'])
@Index(['npcId', 'interactionType'])
@Index(['createdAt'])
export class NPCInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  npcId: string;

  @Column()
  gameId: string;

  @Column({ type: 'int' })
  chapterNumber: number;

  @Column({
    type: 'enum',
    enum: ['mentioned', 'dialogue', 'combat', 'trade', 'quest', 'observation'],
  })
  interactionType:
    | 'mentioned'
    | 'dialogue'
    | 'combat'
    | 'trade'
    | 'quest'
    | 'observation';

  @Column({ type: 'text' })
  context: string;

  @Column({ type: 'int', default: 0 })
  relationshipChange: number;

  @Column({ type: 'json', default: () => "'[]'" })
  discoveredAttributes: string[];

  @Column({ type: 'json', default: () => "'{}'" })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => NPC, (npc) => npc.interactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'npcId' })
  npc: NPC;

  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;
}

@Entity('npc_notifications')
@Index(['gameId', 'isRead'])
@Index(['priority', 'createdAt'])
export class NPCNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @Column()
  npcId: string;

  @Column({ length: 255 })
  npcName: string;

  @Column({
    type: 'enum',
    enum: [
      'relationship-change',
      'faction-change',
      'status-change',
      'discovery',
      'important-update',
    ],
  })
  type:
    | 'relationship-change'
    | 'faction-change'
    | 'status-change'
    | 'discovery'
    | 'important-update';

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  })
  priority: 'low' | 'medium' | 'high';

  @Column({ type: 'boolean', default: true })
  autoClose: boolean;

  @Column({ type: 'int', default: 5000 })
  autoCloseDelay: number;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ type: 'json', default: () => "'{}'" })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @ManyToOne(() => NPC, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'npcId' })
  npc: NPC;
}
