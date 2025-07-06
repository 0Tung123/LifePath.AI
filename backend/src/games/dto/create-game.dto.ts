import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GameTheme,
  GameDifficulty,
  GameLength,
  CombatStyle,
  AdditionalSettings as IAdditionalSettings,
  GameSettings as IGameSettings,
  CreateGameDto as ICreateGameDto,
} from '../../common/types/game.types';

export class AdditionalSettingsDto implements IAdditionalSettings {
  @ApiProperty({
    description: 'Game style',
    example: 'Narrative-focused',
    required: false,
  })
  @IsString()
  @IsOptional()
  style?: string;

  @ApiProperty({
    description: 'Game difficulty',
    enum: GameDifficulty,
    example: GameDifficulty.MEDIUM,
    required: false,
  })
  @IsEnum(GameDifficulty)
  @IsOptional()
  difficulty?: GameDifficulty;

  @ApiProperty({
    description: 'Game length',
    enum: GameLength,
    example: GameLength.MEDIUM,
    required: false,
  })
  @IsEnum(GameLength)
  @IsOptional()
  gameLength?: GameLength;

  @ApiProperty({
    description: 'Combat style',
    enum: CombatStyle,
    example: CombatStyle.BALANCED,
    required: false,
  })
  @IsEnum(CombatStyle)
  @IsOptional()
  combatStyle?: CombatStyle;

  @ApiProperty({
    description: 'Enable permadeath',
    example: false,
    required: false,
  })
  @IsOptional()
  permadeath?: boolean;

  @ApiProperty({
    description: 'Enable realistic needs (hunger, thirst, sleep)',
    example: false,
    required: false,
  })
  @IsOptional()
  realisticNeeds?: boolean;

  @ApiProperty({
    description: 'Enable romance options',
    example: true,
    required: false,
  })
  @IsOptional()
  enableRomance?: boolean;

  @ApiProperty({
    description: 'Enable faction system',
    example: true,
    required: false,
  })
  @IsOptional()
  enableFactions?: boolean;

  [key: string]: string | number | boolean | object | undefined;
}

export class GameSettingsDto implements IGameSettings {
  @ApiProperty({
    description: 'Game theme',
    enum: GameTheme,
    example: GameTheme.FANTASY,
  })
  @IsEnum(GameTheme)
  @IsNotEmpty()
  theme: GameTheme;

  @ApiProperty({
    description: 'Game world setting',
    example: 'Vương quốc thời trung cổ với phép thuật và rồng',
  })
  @IsString()
  @IsNotEmpty()
  setting: string;

  @ApiProperty({
    description: 'Main character name',
    example: 'Hiệp sĩ Galahad',
  })
  @IsString()
  @IsNotEmpty()
  characterName: string;

  @ApiProperty({
    description: 'Main character backstory',
    example:
      'Một hiệp sĩ từ vương quốc sụp đổ, đang tìm kiếm sự cứu rỗi cho linh hồn mình',
  })
  @IsString()
  @IsNotEmpty()
  characterBackstory: string;

  @ApiProperty({
    description: 'Additional game settings and preferences',
    type: AdditionalSettingsDto,
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalSettingsDto)
  additionalSettings?: AdditionalSettingsDto;
}

export class CreateGameDto implements ICreateGameDto {
  @ApiProperty({
    description: 'Game settings',
    type: GameSettingsDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => GameSettingsDto)
  gameSettings: GameSettingsDto;
}
