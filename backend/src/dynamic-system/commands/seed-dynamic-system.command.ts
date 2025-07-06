import { Injectable } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { DynamicSystemSeeder } from '../seeders/dynamic-system.seeder';

@Injectable()
@Command({
  name: 'seed:dynamic-system',
  description:
    'Seed the dynamic system with basic tags, validation rules, and example types',
})
export class SeedDynamicSystemCommand extends CommandRunner {
  constructor(private readonly seeder: DynamicSystemSeeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('🌱 Starting Dynamic System seeding...');

    try {
      await this.seeder.seedAll();
      console.log('✅ Dynamic System seeding completed successfully!');
    } catch (error) {
      console.error('❌ Dynamic System seeding failed:', error.message);
      throw error;
    }
  }
}
