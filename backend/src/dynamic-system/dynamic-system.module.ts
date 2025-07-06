import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DynamicSystemController } from './controllers/dynamic-system.controller';
import { DynamicSystemService } from './services/dynamic-system.service';
import { AIGenerationService } from './services/ai-generation.service';
import { DynamicSystemSeeder } from './seeders/dynamic-system.seeder';
import { SeedDynamicSystemCommand } from './commands/seed-dynamic-system.command';
import { Tag } from './entities/tag.entity';
import { DynamicType } from './entities/dynamic-type.entity';
import { ValidationRule } from './entities/validation-rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, DynamicType, ValidationRule]),
    ConfigModule,
  ],
  controllers: [DynamicSystemController],
  providers: [
    DynamicSystemService,
    AIGenerationService,
    DynamicSystemSeeder,
    SeedDynamicSystemCommand,
  ],
  exports: [
    DynamicSystemService,
    AIGenerationService,
    DynamicSystemSeeder,
    TypeOrmModule,
  ],
})
export class DynamicSystemModule {}
