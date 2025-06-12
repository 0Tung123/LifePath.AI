import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class GameActionDto {
  @ApiPropertyOptional({
    description: 'The choice number (1-4) selected by the player',
    example: 2,
    type: Number,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  @ValidateIf((o) => !o.action && !o.think && !o.communication)
  choiceNumber?: number;

  @ApiPropertyOptional({
    description: 'Custom action input by the player',
    example: 'Investigate the strange sound coming from the bushes',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.choiceNumber && !o.think && !o.communication)
  action?: string;

  @ApiPropertyOptional({
    description: "The character's thoughts or internal monologue",
    example: 'I wonder if I should trust this merchant...',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.choiceNumber && !o.action && !o.communication)
  think?: string;

  @ApiPropertyOptional({
    description: 'Communication with other characters',
    example: 'Hello stranger, where can I find the nearest inn?',
    type: String,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.choiceNumber && !o.action && !o.think)
  communication?: string;
}
