import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StoryNode } from './story-node.entity';
import { ChoiceMetadata } from '../interfaces/story-node-metadata.interface';

@Entity()
export class Choice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  text: string;

  @Column({ default: 0 })
  order: number;

  @Column({ nullable: true })
  requiredAttribute: string;

  @Column({ nullable: true })
  requiredAttributeValue: number;

  @Column({ nullable: true })
  requiredSkill: string;

  @Column({ nullable: true })
  requiredItem: string;

  @Column({ nullable: true })
  storyNodeId: string;

  @Column('simple-json', { nullable: true })
  metadata: ChoiceMetadata;

  @Column('simple-json', { nullable: true })
  consequences: {
    attributeChanges: Record<string, number>;
    skillGains: string[];
    itemGains: {
      id: string;
      name: string;
      quantity: number;
      description?: string;
      type?: string;
      rarity?: string;
      value?: number;
    }[];
    itemLosses: { id: string; name: string; quantity: number }[];
    relationChanges: Record<string, number>;
    flagChanges: Record<string, boolean>;
    currencyChanges?: Record<string, number>;
    flags?: Record<string, any>;
    locationChange?: string;
  };

  @ManyToOne(() => StoryNode, (storyNode) => storyNode.choices)
  @JoinColumn()
  storyNode: StoryNode;

  @Column({ nullable: true })
  nextPrompt: string;
}
