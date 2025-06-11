import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface GenerationRequest {
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GenerationResponse {
  content: string;
  finishReason: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly generativeAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';

    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is not set in environment variables');
    }

    this.generativeAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.generativeAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
  }

  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('API key is not configured');
      }

      const generationConfig = {
        temperature: request.temperature || 0.7,
        maxOutputTokens: request.maxOutputTokens || 800,
      };

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
        generationConfig,
      });

      const response = result.response;

      return {
        content: response.text(),
        finishReason: response.promptFeedback?.blockReason || 'STOP',
      };
    } catch (error) {
      this.logger.error(
        `Error generating AI content: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
