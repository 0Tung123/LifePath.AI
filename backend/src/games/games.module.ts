import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GeminiService } from './gemini.service';
import { Game } from './entities/game.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    ConfigModule,
  ],
  controllers: [GamesController],
  providers: [GamesService, GeminiService],
  exports: [GamesService],
})
export class GamesModule {}