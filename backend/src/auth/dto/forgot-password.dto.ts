import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}