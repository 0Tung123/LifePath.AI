import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryColumn()
  email: string;

  @Column()
  token: string;

  @CreateDateColumn()
  createdAt: Date;
}