import { Module } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoryRecord } from './entities/memory-record.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemoryRecord]),
    ConfigModule,
  ],
  providers: [MemoryService],
  exports: [MemoryService],
})
export class MemoryModule {}