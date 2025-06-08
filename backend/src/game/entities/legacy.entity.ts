import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Character } from './character.entity';

export type LegacyItem = {
  id: string;
  name: string;
  description: string;
  rarity: string;
  type: string;
};

export type LegacyKnowledge = {
  title: string;
  content: string;
  importance: number;
};

@Entity()
export class Legacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originCharacterId: string;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'originCharacterId' })
  originCharacter: Character;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('simple-json')
  items: LegacyItem[];

  @Column('simple-json')
  knowledge: LegacyKnowledge[];

  @Column({ nullable: true })
  deathId: string;

  @Column('simple-json', { nullable: true })
  bonuses: Record<string, number>;

  @Column({ default: false })
  isInherited: boolean;

  @Column({ nullable: true })
  inheritorCharacterId: string;

  @CreateDateColumn()
  createdAt: Date;
}
