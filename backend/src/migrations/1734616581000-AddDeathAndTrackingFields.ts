import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeathAndTrackingFields1734616581000
  implements MigrationInterface
{
  name = 'AddDeathAndTrackingFields1734616581000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "games" 
      ADD COLUMN "npcs_met" jsonb,
      ADD COLUMN "items_used" jsonb,
      ADD COLUMN "important_events" jsonb,
      ADD COLUMN "achievements" jsonb,
      ADD COLUMN "death_date" TIMESTAMP,
      ADD COLUMN "death_cause" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "games" 
      DROP COLUMN "npcs_met",
      DROP COLUMN "items_used",
      DROP COLUMN "important_events",
      DROP COLUMN "achievements",
      DROP COLUMN "death_date",
      DROP COLUMN "death_cause"
    `);
  }
}
