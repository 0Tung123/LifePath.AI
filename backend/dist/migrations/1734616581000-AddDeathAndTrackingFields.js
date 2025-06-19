"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDeathAndTrackingFields1734616581000 = void 0;
class AddDeathAndTrackingFields1734616581000 {
    constructor() {
        this.name = 'AddDeathAndTrackingFields1734616581000';
    }
    async up(queryRunner) {
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
    async down(queryRunner) {
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
exports.AddDeathAndTrackingFields1734616581000 = AddDeathAndTrackingFields1734616581000;
//# sourceMappingURL=1734616581000-AddDeathAndTrackingFields.js.map