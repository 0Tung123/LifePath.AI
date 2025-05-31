import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContinueChineseNovelDto {
  @ApiProperty({ description: 'ID của tiểu thuyết' })
  @IsString()
  @IsNotEmpty()
  novelId: string;

  @ApiProperty({ description: 'Lựa chọn được chọn (số thứ tự)' })
  @IsNumber()
  choiceIndex: number;

  @ApiProperty({ description: 'ID người dùng (tùy chọn)' })
  @IsOptional()
  @IsString()
  userId?: string;
}
