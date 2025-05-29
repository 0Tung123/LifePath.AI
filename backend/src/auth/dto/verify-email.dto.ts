import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'verification-token-123',
    description: 'Email verification token',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
