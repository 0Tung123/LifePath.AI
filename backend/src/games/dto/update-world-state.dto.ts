import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GameTimeDto {
  @ApiPropertyOptional({ description: 'Day in game time', example: 5 })
  @IsOptional()
  @IsNumber()
  day?: number;

  @ApiPropertyOptional({ description: 'Hour in game time', example: 14 })
  @IsOptional()
  @IsNumber()
  hour?: number;

  @ApiPropertyOptional({ description: 'Minute in game time', example: 30 })
  @IsOptional()
  @IsNumber()
  minute?: number;

  @ApiPropertyOptional({
    description: 'Season in game time',
    example: 'summer',
  })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({ description: 'Year in game time', example: 1 })
  @IsOptional()
  @IsNumber()
  year?: number;
}

class EnvironmentDto {
  @ApiPropertyOptional({ description: 'Current weather', example: 'rainy' })
  @IsOptional()
  @IsString()
  weather?: string;

  @ApiPropertyOptional({ description: 'Current temperature', example: 25 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Environmental conditions',
    example: ['foggy', 'windy'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @ApiPropertyOptional({
    description: 'Special environmental effects',
    example: ['blood moon', 'aurora'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialEffects?: string[];
}

class SocietyDto {
  @ApiPropertyOptional({
    description: 'Political state of the world',
    example: 'unstable',
  })
  @IsOptional()
  @IsString()
  politicalState?: string;

  @ApiPropertyOptional({
    description: 'Economic state of the world',
    example: 'recession',
  })
  @IsOptional()
  @IsString()
  economicState?: string;

  @ApiPropertyOptional({
    description: 'Dominant faction in the area',
    example: 'Merchant Guild',
  })
  @IsOptional()
  @IsString()
  dominantFaction?: string;

  @ApiPropertyOptional({
    description: 'Tensions between factions (0-100)',
    example: { 'Merchants vs Nobles': 75, 'Commoners vs Guards': 60 },
  })
  @IsOptional()
  @IsObject()
  tensions?: Record<string, number>;
}

class ActiveEventDto {
  @ApiProperty({ description: 'Event ID', example: 'evt_123' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'Event name', example: 'Festival of Lights' })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Event description',
    example: 'A celebration of the winter solstice',
  })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description: 'Regions affected by the event',
    example: ['Town Square', 'Market District'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedRegions?: string[];

  @ApiPropertyOptional({
    description: 'Potential consequences of the event',
    example: ['Increased merchant prices', 'More guards on patrol'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  consequences?: string[];
}

export class UpdateWorldStateDto {
  @ApiPropertyOptional({ description: 'Game time update' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GameTimeDto)
  gameTime?: GameTimeDto;

  @ApiPropertyOptional({ description: 'Environment update' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnvironmentDto)
  environment?: EnvironmentDto;

  @ApiPropertyOptional({ description: 'Society update' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocietyDto)
  society?: SocietyDto;

  @ApiPropertyOptional({
    description: 'Newly discovered regions',
    example: ['Ancient Ruins', 'Hidden Valley'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  discoveredRegions?: string[];

  @ApiPropertyOptional({ description: 'Active events in the world' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActiveEventDto)
  activeEvents?: ActiveEventDto[];

  @ApiPropertyOptional({ description: 'Custom world state attributes' })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;
}
