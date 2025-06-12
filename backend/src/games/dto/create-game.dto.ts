import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export interface AdditionalSettings {
  style?: string;
  difficulty?: string;
  gameLength?: string;
  combatStyle?: string;
  [key: string]: string | number | boolean | object | undefined;
}

export class GameSettingsDto {
  @ApiProperty({ description: 'Theme of the game', example: 'Fantasy' })
  @IsString()
  @IsNotEmpty()
  theme: string;

  @ApiProperty({
    description: 'Setting of the game',
    example: 'Medieval Kingdom',
  })
  @IsString()
  @IsNotEmpty()
  setting: string;

  @ApiProperty({
    description: 'Name of the main character',
    example: 'Sir Galahad',
  })
  @IsString()
  @IsNotEmpty()
  characterName: string;

  @ApiProperty({
    description: 'Backstory of the main character',
    example: 'A knight from a fallen kingdom searching for redemption',
  })
  @IsString()
  @IsNotEmpty()
  characterBackstory: string;

  @ApiProperty({
    description: 'Additional game details and preferences',
    required: false,
    example: {
      difficulty: 'medium',
      gameLength: 'medium',
      combatStyle: 'balanced',
    },
  })
  @IsObject()
  @IsOptional()
  additionalSettings?: AdditionalSettings;
}

export class CreateGameDto {
  @ApiProperty({
    description: 'Settings for the game',
    type: GameSettingsDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => GameSettingsDto)
  gameSettings: GameSettingsDto;
}
