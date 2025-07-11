import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  DynamicType as IDynamicType,
  DynamicTypeCategory,
  TagRarity,
  TagCreator,
  TagSynergy,
} from '../../common/types/dynamic-system.types';
import { Tag } from './tag.entity';

@Entity('dynamic_types')
@Index(['category', 'isTemplate'])
@Index(['rarity', 'powerLevel'])
@Index(['name'])
export class DynamicType implements IDynamicType {
  @ApiProperty({ example: 'uuid', description: 'Dynamic Type ID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'Flame Sword of the Phoenix',
    description: 'Dynamic type name',
  })
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @ApiProperty({
    example: 'A legendary sword imbued with phoenix fire...',
    description: 'Dynamic type description',
  })
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({
    example: 'equipment',
    description: 'Dynamic type category',
    enum: DynamicTypeCategory,
  })
  @Column({ type: 'enum', enum: DynamicTypeCategory })
  category!: DynamicTypeCategory;

  @ApiProperty({
    example: ['fire', 'weapon', 'legendary'],
    description: 'Associated tag IDs',
  })
  @Column({ type: 'jsonb' })
  tags!: string[];

  @ApiProperty({
    example: { damage: 100, durability: 500 },
    description: 'Base properties',
  })
  @Column({ type: 'jsonb' })
  baseProperties!: Record<string, any>;

  @ApiProperty({
    example: { total_damage: 150, fire_damage: 50 },
    description: 'Computed properties from tags',
  })
  @Column({ type: 'jsonb', nullable: true })
  computedProperties?: Record<string, any>;

  @ApiProperty({
    description: 'Active synergies',
    type: 'array',
  })
  @Column({ type: 'jsonb', nullable: true })
  activeSynergies?: TagSynergy[];

  @ApiProperty({
    example: 'legendary',
    description: 'Dynamic type rarity',
    enum: TagRarity,
  })
  @Column({ type: 'enum', enum: TagRarity })
  rarity!: TagRarity;

  @ApiProperty({ example: 85, description: 'Power level (0-100)' })
  @Column({ type: 'integer', default: 1 })
  powerLevel!: number;

  @ApiProperty({
    example: { type: 'ai', aiModel: 'gemini-2.5-pro' },
    description: 'Creator info',
  })
  @Column({ type: 'jsonb' })
  createdBy!: TagCreator;

  @ApiProperty({ example: false, description: 'Is this a reusable template' })
  @Column({ type: 'boolean', default: false })
  isTemplate!: boolean;

  @ApiProperty({ example: 5, description: 'Usage count' })
  @Column({ type: 'integer', default: 0 })
  usageCount!: number;

  @ApiProperty({ example: true, description: 'Is active' })
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ example: 4.8, description: 'Average player rating' })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating?: number;

  @ApiProperty({ description: 'Associated tags' })
  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'dynamic_type_tags',
    joinColumn: { name: 'dynamic_type_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  associatedTags?: Tag[];

  @ApiProperty({ description: 'Generation metadata' })
  @Column({ type: 'jsonb', nullable: true })
  generationMetadata?: {
    aiModel?: string;
    processingTime?: number;
    confidence?: number;
    context?: string;
    version?: string;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Update timestamp' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
