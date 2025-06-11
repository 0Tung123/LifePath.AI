import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService, GenerationRequest, GenerationResponse } from './ai.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export class GenerateContentDto {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate AI content based on a prompt' })
  @ApiBody({ type: GenerateContentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The generated content',
    schema: {
      properties: {
        content: { type: 'string' },
        finishReason: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request or AI model error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateContent(@Body() generateContentDto: GenerateContentDto): Promise<GenerationResponse> {
    try {
      if (!generateContentDto.prompt || generateContentDto.prompt.trim() === '') {
        throw new HttpException('Prompt cannot be empty', HttpStatus.BAD_REQUEST);
      }

      return await this.aiService.generate({
        prompt: generateContentDto.prompt,
        temperature: generateContentDto.temperature,
        maxOutputTokens: generateContentDto.maxOutputTokens,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to generate content: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}