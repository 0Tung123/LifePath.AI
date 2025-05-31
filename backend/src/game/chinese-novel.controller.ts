import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Put,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChineseNovelService } from './chinese-novel.service';
import { CreateChineseNovelDto } from './dto/create-chinese-novel.dto';
import { ContinueChineseNovelDto } from './dto/continue-chinese-novel.dto';
import { ChineseNovel } from './entities/chinese-novel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@ApiTags('Chinese Novel')
@Controller('chinese-novel')
export class ChineseNovelController {
  constructor(
    private readonly chineseNovelService: ChineseNovelService,
    @InjectRepository(ChineseNovel)
    private chineseNovelRepository: Repository<ChineseNovel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo tiểu thuyết mạng Trung Quốc mới' })
  @ApiResponse({
    status: 201,
    description: 'Tiểu thuyết đã được tạo thành công',
  })
  async createChineseNovel(
    @Request() req,
    @Body() createDto: CreateChineseNovelDto,
  ): Promise<ChineseNovel> {
    try {
      // Get user for API key if available
      const user = await this.userRepository.findOne({
        where: { id: req.user.id },
      });

      // Generate the first chapter
      const novelResponse = await this.chineseNovelService.generateChineseNovel(
        {
          theme: createDto.theme,
          setting: createDto.setting,
          characterName: createDto.characterName,
          characterGender: createDto.characterGender,
          characterDescription: createDto.characterDescription,
        },
        user?.geminiApiKey || undefined,
      );

      // Create the novel entity
      const novel = this.chineseNovelRepository.create({
        title: createDto.title,
        theme: createDto.theme,
        setting: createDto.setting,
        characterName: createDto.characterName,
        characterGender: createDto.characterGender,
        characterDescription: createDto.characterDescription,
        isPublic: createDto.isPublic || false,
        tags: createDto.tags || [],
        userId: req.user.id,
        ...(user && { user }),
        chapters: [
          {
            id: '1',
            title: 'Chương 1: Khởi đầu',
            content: novelResponse.content,
            stats: novelResponse.stats,
            inventory: novelResponse.inventory || [],
            skills: novelResponse.skills || [],
            lore: novelResponse.lore || [],
            choices: novelResponse.choices,
            createdAt: new Date(),
          },
        ],
        currentStats: novelResponse.stats || {},
        currentInventory: novelResponse.inventory || [],
        currentSkills: novelResponse.skills || [],
        loreEntries: novelResponse.lore || [],
        currentChapterIndex: 0,
        totalWords: novelResponse.content.length,
      });

      return await this.chineseNovelRepository.save(novel);
    } catch (error) {
      throw new BadRequestException(`Failed to create novel: ${error.message}`);
    }
  }

  @Post(':id/continue')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tiếp tục tiểu thuyết với lựa chọn đã chọn' })
  @ApiResponse({
    status: 200,
    description: 'Chương mới đã được tạo thành công',
  })
  async continueChineseNovel(
    @Request() req,
    @Param('id') id: string,
    @Body() continueDto: ContinueChineseNovelDto,
  ): Promise<ChineseNovel> {
    try {
      // Get the novel
      const novel = await this.chineseNovelRepository.findOne({
        where: { id, userId: req.user.id },
        relations: ['user'],
      });

      if (!novel) {
        throw new BadRequestException('Novel not found or access denied');
      }

      // Get the current chapter
      const currentChapter = novel.chapters[novel.currentChapterIndex];
      if (!currentChapter) {
        throw new BadRequestException('Current chapter not found');
      }

      // Get the selected choice
      const selectedChoice =
        currentChapter.choices[continueDto.choiceIndex - 1];
      if (!selectedChoice) {
        throw new BadRequestException('Invalid choice index');
      }

      // Mark the choice as selected
      currentChapter.selectedChoice = continueDto.choiceIndex;

      // Generate the next chapter
      const novelResponse = await this.chineseNovelService.continueChineseNovel(
        {
          theme: novel.theme,
          setting: novel.setting,
          characterName: novel.characterName,
          characterGender: novel.characterGender,
          characterDescription: novel.characterDescription,
        },
        currentChapter.content,
        novel.currentStats || {},
        novel.currentInventory || [],
        novel.currentSkills || [],
        selectedChoice.text,
        novel.user?.geminiApiKey || undefined,
      );

      // Create new chapter
      const newChapterIndex = novel.chapters.length;
      const newChapter = {
        id: (newChapterIndex + 1).toString(),
        title: `Chương ${newChapterIndex + 1}`,
        content: novelResponse.content,
        stats: novelResponse.stats,
        inventory: novelResponse.inventory || [],
        skills: novelResponse.skills || [],
        lore: novelResponse.lore || [],
        choices: novelResponse.choices,
        createdAt: new Date(),
      };

      // Update novel
      novel.chapters.push(newChapter);
      novel.currentChapterIndex = newChapterIndex;

      // Update current state
      if (novelResponse.stats) {
        novel.currentStats = { ...novel.currentStats, ...novelResponse.stats };
      }
      if (novelResponse.inventory) {
        novel.currentInventory = [
          ...novel.currentInventory,
          ...novelResponse.inventory,
        ];
      }
      if (novelResponse.skills) {
        novel.currentSkills = [...novel.currentSkills, ...novelResponse.skills];
      }
      if (novelResponse.lore) {
        novel.loreEntries = [...novel.loreEntries, ...novelResponse.lore];
      }

      novel.totalWords += novelResponse.content.length;

      return await this.chineseNovelRepository.save(novel);
    } catch (error) {
      throw new BadRequestException(
        `Failed to continue novel: ${error.message}`,
      );
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tiểu thuyết của người dùng' })
  async getMyNovels(@Request() req): Promise<ChineseNovel[]> {
    return await this.chineseNovelRepository.find({
      where: { userId: req.user.id },
      order: { updatedAt: 'DESC' },
    });
  }

  @Get('public')
  @ApiOperation({ summary: 'Lấy danh sách tiểu thuyết công khai' })
  async getPublicNovels(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('theme') theme?: string,
  ): Promise<{
    novels: ChineseNovel[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const where: any = { isPublic: true };

    if (theme) {
      where.theme = theme;
    }

    const [novels, total] = await this.chineseNovelRepository.findAndCount({
      where,
      order: { views: 'DESC', updatedAt: 'DESC' },
      skip,
      take: limit,
      relations: ['user'],
    });

    return { novels, total, page, limit };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tiểu thuyết' })
  async getNovel(
    @Param('id') id: string,
    @Request() req?,
  ): Promise<ChineseNovel> {
    const novel = await this.chineseNovelRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!novel) {
      throw new BadRequestException('Novel not found');
    }

    // Check access permission
    if (!novel.isPublic && (!req?.user || novel.userId !== req.user.id)) {
      throw new BadRequestException('Access denied');
    }

    // Increment view count if it's a public novel and not the owner
    if (novel.isPublic && (!req?.user || novel.userId !== req.user.id)) {
      novel.views += 1;
      await this.chineseNovelRepository.save(novel);
    }

    return novel;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin tiểu thuyết' })
  async updateNovel(
    @Request() req,
    @Param('id') id: string,
    @Body() updateData: Partial<CreateChineseNovelDto>,
  ): Promise<ChineseNovel> {
    const novel = await this.chineseNovelRepository.findOne({
      where: { id, userId: req.user.id },
    });

    if (!novel) {
      throw new BadRequestException('Novel not found or access denied');
    }

    Object.assign(novel, updateData);
    return await this.chineseNovelRepository.save(novel);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tiểu thuyết' })
  async deleteNovel(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const novel = await this.chineseNovelRepository.findOne({
      where: { id, userId: req.user.id },
    });

    if (!novel) {
      throw new BadRequestException('Novel not found or access denied');
    }

    await this.chineseNovelRepository.remove(novel);
    return { message: 'Novel deleted successfully' };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like/Unlike tiểu thuyết' })
  async toggleLike(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ liked: boolean; likes: number }> {
    const novel = await this.chineseNovelRepository.findOne({
      where: { id, isPublic: true },
    });

    if (!novel) {
      throw new BadRequestException('Novel not found or not public');
    }

    // Simple like system - in a real app, you'd track individual user likes
    novel.likes += 1;
    await this.chineseNovelRepository.save(novel);

    return { liked: true, likes: novel.likes };
  }

  @Get('themes/list')
  @ApiOperation({ summary: 'Lấy danh sách các thể loại có sẵn' })
  async getThemes(): Promise<
    { id: string; name: string; description: string }[]
  > {
    return [
      {
        id: 'tu-tien',
        name: 'Tu Tiên',
        description:
          'Thế giới tu luyện, đột phá cảnh giới, thu thập linh thạch và linh dược',
      },
      {
        id: 'vo-hiep',
        name: 'Võ Hiệp',
        description: 'Thế giới võ thuật, giang hồ nghĩa khí, ân oán tình thù',
      },
      {
        id: 'hien-dai',
        name: 'Hiện Đại',
        description:
          'Bối cảnh thành phố hiện đại với công nghệ, xã hội đương đại',
      },
      {
        id: 'trinh-tham',
        name: 'Trinh Thám',
        description: 'Tập trung vào việc điều tra, suy luận, tìm kiếm manh mối',
      },
      {
        id: 'kinh-di',
        name: 'Kinh Dị',
        description:
          'Tạo không khí u ám, bí ẩn, đáng sợ với các yếu tố siêu nhiên',
      },
      {
        id: 'gia-tuong',
        name: 'Giả Tưởng',
        description:
          'Thế giới tưởng tượng với các luật lệ riêng, tự do sáng tạo',
      },
      {
        id: 'fantasy',
        name: 'Fantasy',
        description:
          'Thế giới phép thuật với các chủng tộc khác nhau, hệ thống level rõ ràng',
      },
      {
        id: 'huyen-huyen',
        name: 'Huyền Huyễn',
        description:
          'Kết hợp nhiều yếu tố huyền bí, phép thuật và thế giới song song',
      },
    ];
  }
}
