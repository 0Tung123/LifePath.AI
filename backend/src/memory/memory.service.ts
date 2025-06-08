import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoryRecord, MemoryType } from './entities/memory-record.entity';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private geminiAi: any;
  private embeddingModel: any;

  constructor(
    @InjectRepository(MemoryRecord)
    private memoryRepository: Repository<MemoryRecord>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not set');
      return;
    }
    
    this.geminiAi = new GoogleGenerativeAI(apiKey);
    // Sử dụng Gemini để tạo embedding thay vì OpenAI
    this.embeddingModel = this.geminiAi.getGenerativeModel({ model: 'embedding-001' });
  }

  // Tạo embedding từ text sử dụng Gemini API
  async createEmbedding(text: string): Promise<number[]> {
    try {
      // Nếu không có mô hình nhúng thực tế, ta sẽ mô phỏng vector
      if (!this.embeddingModel) {
        // Tạo vector giả có 1536 chiều (như OpenAI)
        return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
      }
      
      const embeddingResult = await this.embeddingModel.embedContent(text);
      return embeddingResult.embedding.values;
    } catch (error) {
      this.logger.error(`Error creating embedding: ${error.message}`);
      // Trả về vector giả nếu có lỗi
      return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }
  }

  // Tạo memory record mới
  async createMemory(data: {
    title: string;
    content: string;
    type: MemoryType;
    characterId?: string;
    gameSessionId?: string;
    tags?: string[];
    importance?: number;
  }): Promise<MemoryRecord> {
    const embedding = await this.createEmbedding(
      `${data.title} ${data.content}`,
    );

    const newMemory = this.memoryRepository.create({
      ...data,
      embedding,
    });

    return this.memoryRepository.save(newMemory);
  }

  // Tìm kiếm các bản ghi bộ nhớ liên quan đến ngữ cảnh hiện tại
  async findRelevantMemories(
    context: string,
    characterId?: string,
    limit = 5,
  ): Promise<MemoryRecord[]> {
    // Trong thực tế, sẽ cần vector tương tự (cosine similarity) search
    // Nhưng với quy mô nhỏ, ta có thể làm đơn giản:
    const query = this.memoryRepository.createQueryBuilder('memory');
    
    if (characterId) {
      query.where('memory.characterId = :characterId', { characterId });
    }
    
    return query
      .orderBy('memory.importance', 'DESC')
      .addOrderBy('memory.updatedAt', 'DESC')
      .take(limit)
      .getMany();
  }

  // Tạo prompt với bộ nhớ liên quan
  async createPromptWithMemories(
    basePrompt: string,
    context: string,
    characterId?: string,
  ): Promise<string> {
    const relevantMemories = await this.findRelevantMemories(
      context,
      characterId,
    );

    let memorySection = '';
    
    if (relevantMemories.length > 0) {
      memorySection = `\n\nRELEVANT MEMORIES:\n`;
      
      relevantMemories.forEach((memory) => {
        memorySection += `[${memory.type}] ${memory.title}: ${memory.content}\n`;
      });
    }

    return `${basePrompt}${memorySection}`;
  }
}