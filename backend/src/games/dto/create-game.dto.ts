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
  @ApiProperty({ description: 'Thể loại của trò chơi', example: 'Fantasy' })
  @IsString()
  @IsNotEmpty()
  theme: string;

  @ApiProperty({
    description: 'Bối cảnh thế giới của trò chơi',
    example: 'Vương quốc thời trung cổ với phép thuật và rồng',
  })
  @IsString()
  @IsNotEmpty()
  setting: string;

  @ApiProperty({
    description: 'Tên của nhân vật chính',
    example: 'Hiệp sĩ Galahad',
  })
  @IsString()
  @IsNotEmpty()
  characterName: string;

  @ApiProperty({
    description: 'Tiểu sử và quá khứ của nhân vật chính',
    example: 'Một hiệp sĩ từ vương quốc sụp đổ, đang tìm kiếm sự cứu rỗi cho linh hồn mình',
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
