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
  Tag as ITag,
  TagCategory,
  TagRarity,
  TagCreator,
  TagSynergy,
} from '../../common/types/dynamic-system.types';

@Entity('tags')
@Index(['category', 'isActive'])
@Index(['rarity', 'isActive'])
@Index(['name'], { unique: true })
export class Tag implements ITag {
  @ApiProperty({ example: 'uuid', description: 'Tag ID' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Fire Elemental', description: 'Tag name' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @ApiProperty({
    example: 'element',
    description: 'Tag category',
    enum: TagCategory,
  })
  @Column({ type: 'enum', enum: TagCategory })
  category!: TagCategory;

  @ApiProperty({
    example: 'Grants fire-based abilities and resistance',
    description: 'Tag description',
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    example: { damage_bonus: 25, fire_resistance: 50 },
    description: 'Tag properties',
  })
  @Column({ type: 'jsonb', nullable: true })
  properties?: Record<string, any>;

  @ApiProperty({
    example: 'rare',
    description: 'Tag rarity',
    enum: TagRarity,
  })
  @Column({ type: 'enum', enum: TagRarity, default: TagRarity.COMMON })
  rarity!: TagRarity;

  @ApiProperty({
    example: ['water', 'ice'],
    description: 'Conflicting tags',
  })
  @Column({ type: 'jsonb', nullable: true })
  conflicts?: string[];

  @ApiProperty({
    description: 'Tag synergies',
    type: 'array',
  })
  @Column({ type: 'jsonb', nullable: true })
  synergies?: TagSynergy[];

  @ApiProperty({
    example: { type: 'ai', aiModel: 'gemini-2.5-pro' },
    description: 'Tag creator info',
  })
  @Column({ type: 'jsonb' })
  createdBy!: TagCreator;

  @ApiProperty({ example: true, description: 'Is tag active' })
  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ApiProperty({ example: 0, description: 'Usage count' })
  @Column({ type: 'integer', default: 0 })
  usageCount?: number;

  @ApiProperty({ example: 4.5, description: 'Average rating' })
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averageRating?: number;

  @ApiProperty({ description: 'Related tags for synergies' })
  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'tag_relationships',
    joinColumn: { name: 'tag_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'related_tag_id', referencedColumnName: 'id' },
  })
  relatedTags?: Tag[];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({ description: 'Update timestamp' })
  @UpdateDateColumn()
  updatedAt!: Date;
}
