import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DynamicSystemService } from '../services/dynamic-system.service';
import { CreateTagDto, UpdateTagDto } from '../dto/create-tag.dto';
import {
  CreateDynamicTypeDto,
  GenerateDynamicTypeDto,
  TagCombinationRequestDto,
} from '../dto/create-dynamic-type.dto';
import { Tag } from '../entities/tag.entity';
import { DynamicType } from '../entities/dynamic-type.entity';
import {
  TagRarity,
  DynamicTypeCategory,
  TagCombinationResult,
} from '../../common/types/dynamic-system.types';

@ApiTags('dynamic-system')
@Controller('dynamic-system')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DynamicSystemController {
  constructor(private readonly dynamicSystemService: DynamicSystemService) {}

  // ==================== TAG ENDPOINTS ====================

  @Post('tags')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: Tag,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or tag already exists',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTag(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.dynamicSystemService.createTag(createTagDto);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags with optional filtering' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'rarity',
    required: false,
    enum: TagRarity,
    description: 'Filter by rarity',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: 'boolean',
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in name and description',
  })
  @ApiResponse({
    status: 200,
    description: 'Tags retrieved successfully',
    type: [Tag],
  })
  async findAllTags(
    @Query('category') category?: string,
    @Query('rarity') rarity?: TagRarity,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ): Promise<Tag[]> {
    return this.dynamicSystemService.findAllTags(
      category,
      rarity,
      isActive,
      search,
    );
  }

  @Get('tags/:id')
  @ApiOperation({ summary: 'Get a tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag retrieved successfully',
    type: Tag,
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async findTagById(@Param('id') id: string): Promise<Tag> {
    return this.dynamicSystemService.findTagById(id);
  }

  @Patch('tags/:id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    type: Tag,
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  async updateTag(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<Tag> {
    return this.dynamicSystemService.updateTag(id, updateTagDto);
  }

  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 204,
    description: 'Tag deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async deleteTag(@Param('id') id: string): Promise<void> {
    return this.dynamicSystemService.deleteTag(id);
  }

  // ==================== DYNAMIC TYPE ENDPOINTS ====================

  @Post('dynamic-types')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new dynamic type' })
  @ApiResponse({
    status: 201,
    description: 'Dynamic type created successfully',
    type: DynamicType,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input or tag combination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDynamicType(
    @Body() createDynamicTypeDto: CreateDynamicTypeDto,
  ): Promise<DynamicType> {
    return this.dynamicSystemService.createDynamicType(createDynamicTypeDto);
  }

  @Get('dynamic-types')
  @ApiOperation({ summary: 'Get all dynamic types with optional filtering' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: DynamicTypeCategory,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'rarity',
    required: false,
    enum: TagRarity,
    description: 'Filter by rarity',
  })
  @ApiQuery({
    name: 'isTemplate',
    required: false,
    type: 'boolean',
    description: 'Filter by template status',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: 'boolean',
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in name and description',
  })
  @ApiResponse({
    status: 200,
    description: 'Dynamic types retrieved successfully',
    type: [DynamicType],
  })
  async findAllDynamicTypes(
    @Query('category') category?: DynamicTypeCategory,
    @Query('rarity') rarity?: TagRarity,
    @Query('isTemplate') isTemplate?: boolean,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ): Promise<DynamicType[]> {
    return this.dynamicSystemService.findAllDynamicTypes(
      category,
      rarity,
      isTemplate,
      isActive,
      search,
    );
  }

  @Get('dynamic-types/:id')
  @ApiOperation({ summary: 'Get a dynamic type by ID' })
  @ApiParam({ name: 'id', description: 'Dynamic Type ID' })
  @ApiResponse({
    status: 200,
    description: 'Dynamic type retrieved successfully',
    type: DynamicType,
  })
  @ApiResponse({ status: 404, description: 'Dynamic type not found' })
  async findDynamicTypeById(@Param('id') id: string): Promise<DynamicType> {
    return this.dynamicSystemService.findDynamicTypeById(id);
  }

  // ==================== TAG COMBINATION & VALIDATION ====================

  @Post('tags/validate-combination')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate tag combination and preview result' })
  @ApiResponse({
    status: 200,
    description: 'Tag combination validation result',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  async validateTagCombination(
    @Body() request: TagCombinationRequestDto,
  ): Promise<TagCombinationResult> {
    return this.dynamicSystemService.combineTagsPreview(request);
  }

  // ==================== AI GENERATION ENDPOINTS ====================

  @Post('generate/dynamic-types')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate dynamic types using AI' })
  @ApiResponse({
    status: 201,
    description: 'Dynamic types generated successfully',
    type: [DynamicType],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid generation parameters',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'AI generation failed' })
  async generateDynamicTypes(
    @Body() generateDto: GenerateDynamicTypeDto,
  ): Promise<DynamicType[]> {
    return this.dynamicSystemService.generateDynamicType(generateDto);
  }

  // ==================== UTILITY ENDPOINTS ====================

  @Get('categories')
  @ApiOperation({ summary: 'Get all available categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async getCategories(): Promise<{
    tagCategories: string[];
    dynamicTypeCategories: string[];
  }> {
    return {
      tagCategories: Object.values(
        require('../../common/types/dynamic-system.types').TagCategory,
      ),
      dynamicTypeCategories: Object.values(DynamicTypeCategory),
    };
  }

  @Get('rarities')
  @ApiOperation({ summary: 'Get all available rarities' })
  @ApiResponse({
    status: 200,
    description: 'Rarities retrieved successfully',
  })
  async getRarities(): Promise<{ rarities: string[] }> {
    return {
      rarities: Object.values(TagRarity),
    };
  }

  @Get('stats/tags')
  @ApiOperation({ summary: 'Get tag usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Tag statistics retrieved successfully',
  })
  async getTagStats(): Promise<{
    totalTags: number;
    activeTagsByCategory: Record<string, number>;
    topUsedTags: Array<{ name: string; usageCount: number }>;
  }> {
    // This would be implemented with proper aggregation queries
    return {
      totalTags: 0,
      activeTagsByCategory: {},
      topUsedTags: [],
    };
  }

  @Get('stats/dynamic-types')
  @ApiOperation({ summary: 'Get dynamic type statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dynamic type statistics retrieved successfully',
  })
  async getDynamicTypeStats(): Promise<{
    totalTypes: number;
    typesByCategory: Record<string, number>;
    typesByRarity: Record<string, number>;
    averagePowerLevel: number;
  }> {
    // This would be implemented with proper aggregation queries
    return {
      totalTypes: 0,
      typesByCategory: {},
      typesByRarity: {},
      averagePowerLevel: 0,
    };
  }
}
