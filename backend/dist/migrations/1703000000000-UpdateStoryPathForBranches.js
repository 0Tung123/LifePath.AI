"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStoryPathForBranches1703000000000 = void 0;
class UpdateStoryPathForBranches1703000000000 {
    constructor() {
        this.name = 'UpdateStoryPathForBranches1703000000000';
    }
    async up(queryRunner) {
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
        await queryRunner.query(`
      UPDATE "story_path" 
      SET "isActive" = true, "branchId" = CONCAT('main-branch-', "gameSessionId")
      WHERE "branchId" IS NULL
    `);
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
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_story_path_gameSession_isActive"`);
        await queryRunner.query(`DROP INDEX "IDX_story_path_branchId"`);
        await queryRunner.query(`DROP INDEX "IDX_story_path_isActive"`);
        await queryRunner.query(`ALTER TABLE "story_path" DROP COLUMN "parentPathId"`);
        await queryRunner.query(`ALTER TABLE "story_path" DROP COLUMN "branchId"`);
        await queryRunner.query(`ALTER TABLE "story_path" DROP COLUMN "isActive"`);
    }
}
exports.UpdateStoryPathForBranches1703000000000 = UpdateStoryPathForBranches1703000000000;
//# sourceMappingURL=1703000000000-UpdateStoryPathForBranches.js.map