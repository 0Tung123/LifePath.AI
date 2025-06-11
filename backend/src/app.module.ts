import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './user/users.module';
import { GameModule } from './game/game.module';
import { MemoryModule } from './memory/memory.module';
import { AiModule } from './ai/ai.module';
import { User } from './user/entities/user.entity';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';
import { Character } from './game/entities/character.entity';
import { GameSession } from './game/entities/game-session.entity';
import { StoryNode } from './game/entities/story-node.entity';
import { Choice } from './game/entities/choice.entity';
import { Quest } from './game/entities/quest.entity';
import { MemoryRecord } from './memory/entities/memory-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432'), 10),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'postgres'),
        entities: [
          User,
          PasswordResetToken,
          Character,
          GameSession,
          StoryNode,
          Choice,
          Quest,
          MemoryRecord,
        ],
        synchronize: true,
        autoLoadEntities: true,
        retryAttempts: 10,
        retryDelay: 3000,
        // Thêm logging để dễ debug
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    MailModule,
    UsersModule,
    MemoryModule,
    GameModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
