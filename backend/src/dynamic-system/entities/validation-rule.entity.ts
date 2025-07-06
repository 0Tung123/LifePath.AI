import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  ValidationRule as IValidationRule,
  DynamicTypeCategory,
  ValidationCondition,
} from '../../common/types/dynamic-system.types';

@Entity('validation_rules')
@Index(['category', 'isActive'])
@Index(['severity', 'isActive'])
export class ValidationRule implements IValidationRule {
  @ApiProperty({ example: 'uuid', description: 'Validation Rule ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Fire-Water Conflict Check',
    description: 'Rule name',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    example: 'Prevents fire and water tags from being combined',
    description: 'Rule description',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    example: 'equipment',
    description: 'Applicable category',
    enum: DynamicTypeCategory,
  })
  @Column({ type: 'enum', enum: DynamicTypeCategory })
  category: DynamicTypeCategory;

  @ApiProperty({
    description: 'Validation conditions',
    type: 'array',
  })
  @Column({ type: 'jsonb' })
  conditions: ValidationCondition[];

  @ApiProperty({
    example: 'error',
    description: 'Rule severity',
    enum: ['error', 'warning', 'info'],
  })
  @Column({ type: 'enum', enum: ['error', 'warning', 'info'] })
  severity: 'error' | 'warning' | 'info';

  @ApiProperty({ example: true, description: 'Is rule active' })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({
    example: 1,
    description: 'Rule priority (higher = more important)',
  })
  @Column({ type: 'integer', default: 1 })
  priority: number;

  @ApiProperty({ example: 150, description: 'Times this rule was triggered' })
  @Column({ type: 'integer', default: 0 })
  triggerCount: number;

  @ApiProperty({ description: 'Rule metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    createdBy?: string;
    version?: string;
    tags?: string[];
    notes?: string;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
