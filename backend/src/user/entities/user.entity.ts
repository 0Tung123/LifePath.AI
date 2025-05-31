import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Character } from '../../game/entities/character.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'test@example.com', description: 'Email address' })
  @Column({ unique: true, length: 255 })
  email: string;

  @ApiProperty({ example: 'hashed_password', description: 'Password' })
  @Column({ length: 255, select: false })
  password: string;

  @ApiProperty({ example: 'John', description: 'First name', nullable: true })
  @Column({ length: 100, nullable: true })
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', nullable: true })
  @Column({ length: 100, nullable: true })
  lastName?: string;

  @ApiProperty({ example: false, description: 'Is active' })
  @Column({ default: false })
  isActive: boolean; // Có thể dùng để xác thực email sau này

  @ApiProperty({
    example: 'reset_token',
    description: 'Reset password token',
    nullable: true,
  })
  @Column({ nullable: true, type: 'varchar', length: 255 })
  resetPasswordToken?: string | null;

  @ApiProperty({
    example: '2025-05-30T00:00:00.000Z',
    description: 'Reset password expires',
    nullable: true,
  })
  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordExpires?: Date | null;

  @ApiProperty({
    example: 'email_verification_token',
    description: 'Email verification token',
    nullable: true,
  })
  @Column({ nullable: true, type: 'varchar', length: 255 })
  emailVerificationToken?: string | null;

  @ApiProperty({
    example: '2025-05-30T00:00:00.000Z',
    description: 'Email verification expires',
    nullable: true,
  })
  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationExpires?: Date | null;

  @ApiProperty({
    example: '2025-05-29T12:00:00.000Z',
    description: 'Created at',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-05-29T12:00:00.000Z',
    description: 'Updated at',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    example: 'google_id',
    description: 'Google ID',
    nullable: true,
  })
  @Column({ nullable: true, type: 'varchar', length: 255 })
  googleId?: string | null;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile picture URL',
    nullable: true,
  })
  @Column({ nullable: true, type: 'varchar', length: 255 })
  profilePicture?: string | null;

  @OneToMany(() => Character, (character) => character.user)
  characters: Character[];
}
