import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'your_reset_token', description: 'Reset token' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'new_password', description: 'New password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}