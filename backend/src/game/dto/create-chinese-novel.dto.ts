import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChineseNovelDto {
  @ApiProperty({ description: 'Tiêu đề tiểu thuyết' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Chủ đề/thể loại',
    enum: [
      'tu-tien',
      'vo-hiep',
      'hien-dai',
      'trinh-tham',
      'kinh-di',
      'gia-tuong',
      'fantasy',
      'huyen-huyen',
    ],
  })
  @IsString()
  @IsIn([
    'tu-tien',
    'vo-hiep',
    'hien-dai',
    'trinh-tham',
    'kinh-di',
    'gia-tuong',
    'fantasy',
    'huyen-huyen',
  ])
  theme: string;

  @ApiProperty({ description: 'Bối cảnh câu chuyện' })
  @IsString()
  @IsNotEmpty()
  setting: string;

  @ApiProperty({ description: 'Tên nhân vật chính' })
  @IsString()
  @IsNotEmpty()
  characterName: string;

  @ApiProperty({
    description: 'Giới tính nhân vật chính',
    enum: ['nam', 'nu'],
  })
  @IsString()
  @IsIn(['nam', 'nu'])
  characterGender: string;

  @ApiProperty({ description: 'Mô tả sơ lược về nhân vật chính' })
  @IsString()
  @IsNotEmpty()
  characterDescription: string;

  @ApiProperty({ description: 'Có công khai không', required: false })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ description: 'Tags cho tiểu thuyết', required: false })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'ID người dùng (tùy chọn)' })
  @IsOptional()
  @IsString()
  userId?: string;
}
