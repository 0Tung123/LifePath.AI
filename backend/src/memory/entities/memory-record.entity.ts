import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Character } from '../../game/entities/character.entity';
import { GameSession } from '../../game/entities/game-session.entity';

export enum MemoryType {
  EVENT = 'event',
  NPC = 'npc',
  LOCATION = 'location',
  ITEM = 'item',
  LORE = 'lore',
  QUEST = 'quest',
  CONSEQUENCE = 'consequence',
  LEGACY = 'legacy',
  ACTION = 'action',
  CONVERSATION = 'conversation',
  EXPERIENCE = 'experience',
  DEATH = 'death'
}

@Entity()
export class MemoryRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  characterId: string;

  @ManyToOne(() => Character, { nullable: true })
  @JoinColumn({ name: 'characterId' })
  character: Character;

  @Column({ nullable: true })
  gameSessionId: string;

  @ManyToOne(() => GameSession, { nullable: true })
  @JoinColumn({ name: 'gameSessionId' })
  gameSession: GameSession;

  @Column({
    type: 'enum',
    enum: MemoryType,
    default: MemoryType.EVENT,
  })
  type: MemoryType;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('float', { nullable: true, array: true })
  embedding: number[];

  @Column({ default: 1.0 })
  importance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}