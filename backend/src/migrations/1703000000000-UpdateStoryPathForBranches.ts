import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStoryPathForBranches1703000000000 implements MigrationInterface {
  name = 'UpdateStoryPathForBranches1703000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to story_path table
    await queryRunner.query(`
      ALTER TABLE "story_path" 
      ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
    `);

    await queryRunner.query(`
      ALTER TABLE "story_path" 
      ADD COLUMN "branchId" varchar
    `);

    await queryRunner.query(`
      ALTER TABLE "story_path" 
      ADD COLUMN "parentPathId" varchar
    `);

    // Update existing records to have default values
    await queryRunner.query(`
      UPDATE "story_path" 
      SET "isActive" = true, "branchId" = CONCAT('main-branch-', "gameSessionId")
      WHERE "branchId" IS NULL
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_story_path_isActive" ON "story_path" ("isActive")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_path_branchId" ON "story_path" ("branchId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_story_path_gameSession_isActive" ON "story_path" ("gameSessionId", "isActive")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_story_path_gameSession_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_story_path_branchId"`);
    await queryRunner.query(`DROP INDEX "IDX_story_path_isActive"`);

    // Drop columns
    await queryRunner.query(`ALTER TABLE "story_path" DROP COLUMN "parentPathId"`);
    await queryRunner.query(`ALTER TABLE "story_path" DROP COLUMN "branchId"`);
    await queryRunner.query(`ALTER TABLE "story_path" DROP COLUMN "isActive"`);
  }
}