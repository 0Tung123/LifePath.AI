import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { GeminiService } from './gemini.service';
import { NPCService } from './services/npc.service';
import { NPCController } from './controllers/npc.controller';
import { Game } from './entities/game.entity';
import { NPC, NPCInteraction, NPCNotification } from './entities/npc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, NPC, NPCInteraction, NPCNotification]),
    ConfigModule,
  ],
  controllers: [GamesController, NPCController],
  providers: [GamesService, GeminiService, NPCService],
  exports: [GamesService, NPCService],
})
export class GamesModule {}
