import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptService } from './prompt.service';
import { GeminiService } from './gemini.service';
import { StoryService } from './story.service';
import { StoryController } from './story.controller';
import { Story } from './entities/story.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Story]),
  ],
  controllers: [StoryController],
  providers: [PromptService, GeminiService, StoryService],
  exports: [PromptService, GeminiService, StoryService],
})
export class AIModule {}