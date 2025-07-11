import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { DynamicType } from '../entities/dynamic-type.entity';
import { ValidationRule } from '../entities/validation-rule.entity';
import { AIGenerationService } from './ai-generation.service';
import { CreateTagDto, UpdateTagDto } from '../dto/create-tag.dto';
import {
  CreateDynamicTypeDto,
  GenerateDynamicTypeDto,
  TagCombinationRequestDto,
} from '../dto/create-dynamic-type.dto';
import {
  TagCombinationResult,
  TagSynergy,
  TagRarity,
  TagCategory,
  TagCreator,
  DynamicTypeCategory,
  AIGenerationRequest,
  AIGenerationContext,
} from '../../common/types/dynamic-system.types';

@Injectable()
export class DynamicSystemService {
  private readonly logger = new Logger(DynamicSystemService.name);

  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(DynamicType)
    private dynamicTypeRepository: Repository<DynamicType>,
    @InjectRepository(ValidationRule)
    private validationRuleRepository: Repository<ValidationRule>,
    private aiGenerationService: AIGenerationService,
  ) {}

  // ==================== TAG MANAGEMENT ====================

  async createTag(createTagDto: CreateTagDto): Promise<Tag> {
    this.logger.log(`Creating new tag: ${createTagDto.name}`);

    // Check if tag name already exists
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new BadRequestException(
        `Tag with name "${createTagDto.name}" already exists`,
      );
    }

    // Create new tag
    const tag = this.tagRepository.create({
      ...createTagDto,
      rarity: createTagDto.rarity || TagRarity.COMMON,
      isActive:
        createTagDto.isActive !== undefined ? createTagDto.isActive : true,
    });

    const savedTag = await this.tagRepository.save(tag);
    this.logger.log(`Tag created successfully: ${savedTag.id}`);

    return savedTag;
  }

  async findAllTags(
    category?: string,
    rarity?: TagRarity,
    isActive?: boolean,
    search?: string,
  ): Promise<Tag[]> {
    const queryBuilder = this.tagRepository.createQueryBuilder('tag');

    if (category) {
      queryBuilder.andWhere('tag.category = :category', { category });
    }

    if (rarity) {
      queryBuilder.andWhere('tag.rarity = :rarity', { rarity });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('tag.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(tag.name ILIKE :search OR tag.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('tag.usageCount', 'DESC');
    queryBuilder.addOrderBy('tag.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findTagById(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['relatedTags'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  async findTagsByNames(names: string[]): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { name: In(names), isActive: true },
    });
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findTagById(id);

    // Check name uniqueness if name is being updated
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name },
      });

      if (existingTag) {
        throw new BadRequestException(
          `Tag with name "${updateTagDto.name}" already exists`,
        );
      }
    }

    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  async deleteTag(id: string): Promise<void> {
    const tag = await this.findTagById(id);

    // Soft delete by setting isActive to false
    tag.isActive = false;
    await this.tagRepository.save(tag);

    this.logger.log(`Tag soft deleted: ${id}`);
  }

  // ==================== DYNAMIC TYPE MANAGEMENT ====================

  async createDynamicType(
    createDynamicTypeDto: CreateDynamicTypeDto,
  ): Promise<DynamicType> {
    this.logger.log(`Creating dynamic type: ${createDynamicTypeDto.name}`);

    // Validate and get tags
    const tags = await this.findTagsByNames(createDynamicTypeDto.tags);
    if (tags.length !== createDynamicTypeDto.tags.length) {
      const foundTagNames = tags.map((t) => t.name);
      const missingTags = createDynamicTypeDto.tags.filter(
        (name) => !foundTagNames.includes(name),
      );
      throw new BadRequestException(
        `Tags not found: ${missingTags.join(', ')}`,
      );
    }

    // Validate tag combination
    const combinationResult = await this.validateTagCombination(
      createDynamicTypeDto.tags,
      createDynamicTypeDto.category,
    );

    if (!combinationResult.isValid) {
      throw new BadRequestException(
        `Invalid tag combination: ${combinationResult.conflicts.join(', ')}`,
      );
    }

    // Compute properties from tags and synergies
    const computedProperties = this.computePropertiesFromTags(
      tags,
      createDynamicTypeDto.baseProperties,
      combinationResult.synergies,
    );

    // Create dynamic type
    const dynamicType = this.dynamicTypeRepository.create({
      ...createDynamicTypeDto,
      tags: createDynamicTypeDto.tags,
      computedProperties,
      activeSynergies: combinationResult.synergies,
      isActive:
        createDynamicTypeDto.isActive !== undefined
          ? createDynamicTypeDto.isActive
          : true,
    });

    const savedDynamicType = await this.dynamicTypeRepository.save(dynamicType);

    // Update tag usage counts
    await this.updateTagUsageCounts(createDynamicTypeDto.tags);

    this.logger.log(`Dynamic type created: ${savedDynamicType.id}`);
    return savedDynamicType;
  }

  async findAllDynamicTypes(
    category?: DynamicTypeCategory,
    rarity?: TagRarity,
    isTemplate?: boolean,
    isActive?: boolean,
    search?: string,
  ): Promise<DynamicType[]> {
    const queryBuilder =
      this.dynamicTypeRepository.createQueryBuilder('dynamicType');

    if (category) {
      queryBuilder.andWhere('dynamicType.category = :category', { category });
    }

    if (rarity) {
      queryBuilder.andWhere('dynamicType.rarity = :rarity', { rarity });
    }

    if (isTemplate !== undefined) {
      queryBuilder.andWhere('dynamicType.isTemplate = :isTemplate', {
        isTemplate,
      });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('dynamicType.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(dynamicType.name ILIKE :search OR dynamicType.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('dynamicType.powerLevel', 'DESC');
    queryBuilder.addOrderBy('dynamicType.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findDynamicTypeById(id: string): Promise<DynamicType> {
    const dynamicType = await this.dynamicTypeRepository.findOne({
      where: { id },
      relations: ['associatedTags'],
    });

    if (!dynamicType) {
      throw new NotFoundException(`Dynamic type with ID "${id}" not found`);
    }

    return dynamicType;
  }

  // ==================== TAG COMBINATION & VALIDATION ====================

  async validateTagCombination(
    tagNames: string[],
    category: DynamicTypeCategory,
  ): Promise<TagCombinationResult> {
    const tags = await this.findTagsByNames(tagNames);
    const conflicts: string[] = [];
    const synergies: TagSynergy[] = [];

    // Check for conflicts
    for (const tag of tags) {
      if (tag.conflicts) {
        const conflictingTags = tagNames.filter((name) =>
          tag.conflicts!.includes(name),
        );
        if (conflictingTags.length > 0) {
          conflicts.push(
            `${tag.name} conflicts with: ${conflictingTags.join(', ')}`,
          );
        }
      }
    }

    // Find synergies
    for (const tag of tags) {
      if (tag.synergies) {
        for (const synergy of tag.synergies) {
          const hasAllRequiredTags = synergy.requiredTags.every((reqTag) =>
            tagNames.includes(reqTag),
          );

          if (hasAllRequiredTags) {
            synergies.push(synergy);
          }
        }
      }
    }

    // Calculate power level and rarity
    const powerLevel = this.calculatePowerLevel(tags, synergies);
    const rarity = this.calculateRarity(tags, synergies);

    // Get validation rules for category
    const validationRules = await this.validationRuleRepository.find({
      where: { category, isActive: true },
    });

    // Apply validation rules
    const warnings: string[] = [];
    for (const rule of validationRules) {
      const ruleResult = this.applyValidationRule(rule, tagNames);
      if (!ruleResult.isValid) {
        if (rule.severity === 'error') {
          conflicts.push(ruleResult.message);
        } else {
          warnings.push(ruleResult.message);
        }
      }
    }

    return {
      isValid: conflicts.length === 0,
      conflicts,
      synergies,
      suggestedProperties: this.suggestPropertiesFromTags(tags),
      powerLevel,
      rarity,
      warnings,
    };
  }

  async combineTagsPreview(
    request: TagCombinationRequestDto,
  ): Promise<TagCombinationResult> {
    return this.validateTagCombination(request.tagNames, request.category);
  }

  // ==================== AI GENERATION ====================

  async generateDynamicType(
    generateDto: GenerateDynamicTypeDto,
  ): Promise<DynamicType[]> {
    this.logger.log(
      `Generating dynamic type for category: ${generateDto.category}`,
    );

    // Prepare context with proper types
    const context: AIGenerationContext = {
      gameId: generateDto.gameId,
      storyContext: generateDto.storyContext || '',
      requiredCategories: [generateDto.category as unknown as TagCategory], // Convert DynamicTypeCategory to TagCategory
      existingTags: generateDto.requiredTags || [],
    };

    // Add optional properties only if they exist
    if (generateDto.powerLevelRange) {
      context.powerLevelRange = generateDto.powerLevelRange;
    }

    if (generateDto.allowedRarities) {
      context.rarityConstraints = generateDto.allowedRarities;
    }

    if (generateDto.customPrompt) {
      context.customPrompt = generateDto.customPrompt;
    }

    const aiRequest: AIGenerationRequest = {
      type: 'dynamic_type',
      context,
      count: generateDto.count || 1,
    };

    try {
      // Use AI generation service
      const aiResponse =
        await this.aiGenerationService.generateDynamicContent(aiRequest);

      if (!aiResponse.success) {
        this.logger.warn(`AI generation failed: ${aiResponse.error}`);
        // Fallback to mock generation
        return this.createFallbackDynamicTypes(generateDto);
      }

      const generatedTypes: DynamicType[] = [];

      // Process AI-generated types
      for (const aiType of aiResponse.data as DynamicType[]) {
        try {
          // Validate and create tags if they don't exist
          // Make sure createdBy has the right structure
          const creator: TagCreator = {
            type: aiType.createdBy.type || 'ai',
            aiModel: aiType.createdBy.aiModel || 'gemini-2.5-pro',
            context: aiType.createdBy.context || '',
          };
          await this.ensureTagsExist(aiType.tags, creator);

          // Create the dynamic type
          const createDto: CreateDynamicTypeDto = {
            name: aiType.name,
            description: aiType.description,
            category: aiType.category,
            tags: aiType.tags,
            baseProperties: aiType.baseProperties,
            rarity: aiType.rarity,
            powerLevel: aiType.powerLevel,
            createdBy: aiType.createdBy,
            isTemplate: false,
            isActive: true,
          };

          const createdType = await this.createDynamicType(createDto);

          // Add generation metadata with proper types
          interface GenerationMetadata {
            aiModel: string;
            processingTime: number;
            confidence: number;
            version: string;
            context?: string;
          }

          const metadata: GenerationMetadata = {
            aiModel: 'gemini-2.5-pro',
            processingTime: aiResponse.metadata.processingTime,
            confidence: aiResponse.metadata.confidence,
            version: '1.0',
          };

          // Add context only if it exists
          if (generateDto.storyContext) {
            metadata.context = generateDto.storyContext;
          }

          createdType.generationMetadata = metadata;

          await this.dynamicTypeRepository.save(createdType);
          generatedTypes.push(createdType);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to create AI-generated type: ${errorMessage}`,
          );
          // Continue with other types
        }
      }

      if (generatedTypes.length === 0) {
        this.logger.warn(
          'No types were successfully generated, using fallback',
        );
        return this.createFallbackDynamicTypes(generateDto);
      }

      this.logger.log(
        `Successfully generated ${generatedTypes.length} dynamic types`,
      );
      return generatedTypes;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`AI generation error: ${errorMessage}`);
      return this.createFallbackDynamicTypes(generateDto);
    }
  }

  // Helper method to ensure tags exist
  private async ensureTagsExist(
    tagNames: string[],
    createdBy: TagCreator,
  ): Promise<void> {
    for (const tagName of tagNames) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: tagName },
      });

      if (!existingTag) {
        // Create a basic tag
        const newTag = this.tagRepository.create({
          name: tagName,
          category: TagCategory.CUSTOM,
          description: `Auto-generated tag: ${tagName}`,
          rarity: TagRarity.COMMON,
          createdBy,
          isActive: true,
        });

        await this.tagRepository.save(newTag);
        this.logger.log(`Auto-created tag: ${tagName}`);
      }
    }
  }

  // Fallback method for when AI generation fails
  private async createFallbackDynamicTypes(
    generateDto: GenerateDynamicTypeDto,
  ): Promise<DynamicType[]> {
    const fallbackTypes: DynamicType[] = [];

    for (let i: number = 0; i < (generateDto.count || 1); i++) {
      const fallbackType = await this.createMockDynamicType(generateDto);
      fallbackTypes.push(fallbackType);
    }

    return fallbackTypes;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private computePropertiesFromTags(
    tags: Tag[],
    baseProperties: Record<string, any>,
    synergies: TagSynergy[],
  ): Record<string, any> {
    const computed = { ...baseProperties };

    // Apply tag properties
    for (const tag of tags) {
      if (tag.properties) {
        for (const [key, value] of Object.entries(tag.properties)) {
          if (typeof value === 'number' && typeof computed[key] === 'number') {
            computed[key] = (computed[key] || 0) + value;
          } else if (computed[key] === undefined) {
            computed[key] = value;
          }
        }
      }
    }

    // Apply synergy effects
    for (const synergy of synergies) {
      if (synergy.effect.effects) {
        for (const [key, value] of Object.entries(synergy.effect.effects)) {
          if (typeof value === 'number' && typeof computed[key] === 'number') {
            computed[key] = (computed[key] || 0) * (1 + value);
          } else if (computed[key] === undefined) {
            computed[key] = value;
          }
        }
      }
    }

    return computed;
  }

  private calculatePowerLevel(tags: Tag[], synergies: TagSynergy[]): number {
    const basePower = tags.reduce((sum, tag) => {
      const rarityMultiplier = this.getRarityMultiplier(tag.rarity);
      return sum + 10 * rarityMultiplier;
    }, 0);

    // Add synergy bonus
    const synergyBonus = synergies.length * 15;

    return Math.min(100, Math.max(1, basePower + synergyBonus));
  }

  private calculateRarity(tags: Tag[], synergies: TagSynergy[]): TagRarity {
    const rarityValues = {
      [TagRarity.COMMON]: 1,
      [TagRarity.UNCOMMON]: 2,
      [TagRarity.RARE]: 3,
      [TagRarity.EPIC]: 4,
      [TagRarity.LEGENDARY]: 5,
      [TagRarity.MYTHICAL]: 6,
      [TagRarity.DIVINE]: 7,
      [TagRarity.UNIQUE]: 8,
    };

    const maxTagRarity = Math.max(
      ...tags.map((tag) => rarityValues[tag.rarity]),
    );
    const synergyBonus = synergies.length > 0 ? 1 : 0;
    const finalRarity = Math.min(8, maxTagRarity + synergyBonus);

    return Object.keys(rarityValues).find(
      (key) => rarityValues[key as TagRarity] === finalRarity,
    ) as TagRarity;
  }

  private getRarityMultiplier(rarity: TagRarity): number {
    const multipliers = {
      [TagRarity.COMMON]: 1,
      [TagRarity.UNCOMMON]: 1.2,
      [TagRarity.RARE]: 1.5,
      [TagRarity.EPIC]: 2,
      [TagRarity.LEGENDARY]: 3,
      [TagRarity.MYTHICAL]: 4,
      [TagRarity.DIVINE]: 5,
      [TagRarity.UNIQUE]: 6,
    };
    return multipliers[rarity] || 1;
  }

  private suggestPropertiesFromTags(tags: Tag[]): Record<string, any> {
    const suggested: Record<string, any> = {};

    for (const tag of tags) {
      if (tag.properties) {
        for (const [key, value] of Object.entries(tag.properties)) {
          if (suggested[key] === undefined) {
            suggested[key] = value;
          }
        }
      }
    }

    return suggested;
  }

  private applyValidationRule(
    rule: ValidationRule,
    // Remove unused parameter
    tagNames: string[],
  ): { isValid: boolean; message: string } {
    // Simplified validation rule application
    // In a real implementation, this would be more sophisticated

    for (const condition of rule.conditions) {
      switch (condition.type) {
        case 'tag_required':
          // Ensure we're working with a string
          const requiredTagValue = condition.parameters.tagName;
          const requiredTag =
            typeof requiredTagValue === 'string'
              ? requiredTagValue
              : String(requiredTagValue);

          // Check if the tag is in the array
          if (!tagNames.some((tag) => tag === requiredTag)) {
            return {
              isValid: false,
              message:
                condition.errorMessage ||
                `Required tag "${requiredTag}" is missing`,
            };
          }
          break;

        case 'tag_forbidden':
          // Ensure we're working with a string
          const forbiddenTagValue = condition.parameters.tagName;
          const forbiddenTag =
            typeof forbiddenTagValue === 'string'
              ? forbiddenTagValue
              : String(forbiddenTagValue);

          // Check if the tag is in the array
          if (tagNames.some((tag) => tag === forbiddenTag)) {
            return {
              isValid: false,
              message:
                condition.errorMessage ||
                `Forbidden tag "${forbiddenTag}" is present`,
            };
          }
          break;

        case 'tag_limit':
          // Ensure we're working with a number
          const maxTagsValue = condition.parameters.maxCount;
          const maxTags =
            typeof maxTagsValue === 'number'
              ? maxTagsValue
              : Number(maxTagsValue);

          // Compare the length
          if (tagNames.length > maxTags) {
            return {
              isValid: false,
              message:
                condition.errorMessage || `Too many tags (max: ${maxTags})`,
            };
          }
          break;
      }
    }

    return { isValid: true, message: '' };
  }

  private async updateTagUsageCounts(tagNames: string[]): Promise<void> {
    await this.tagRepository
      .createQueryBuilder()
      .update(Tag)
      .set({ usageCount: () => 'usage_count + 1' })
      .where('name IN (:...tagNames)', { tagNames })
      .execute();
  }

  private async createMockDynamicType(
    generateDto: GenerateDynamicTypeDto,
  ): Promise<DynamicType> {
    // This is a placeholder for AI generation
    // In real implementation, this would call your Gemini AI service

    // Create a properly typed dynamic type with explicit handling of optional fields
    const creator: TagCreator = {
      type: 'ai' as const,
      aiModel: 'gemini-2.5-pro',
      // Initialize context as empty string to avoid undefined
      context: generateDto.storyContext || '',
    };

    const dynamicTypeData: Partial<DynamicType> = {
      name: `Generated ${generateDto.category}`,
      description: `AI-generated ${generateDto.category} based on context`,
      category: generateDto.category,
      tags: generateDto.requiredTags || ['common'],
      baseProperties: { power: 50 },
      rarity: TagRarity.COMMON,
      powerLevel: 50,
      createdBy: creator,
      isTemplate: false,
      isActive: true,
    };

    // Create the entity
    const mockType = this.dynamicTypeRepository.create(dynamicTypeData);

    // Save and return a single entity
    return this.dynamicTypeRepository.save(mockType) as Promise<DynamicType>;
  }
}
