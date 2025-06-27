"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddKarmaAndReputationFields1734700000001 = void 0;
class AddKarmaAndReputationFields1734700000001 {
    constructor() {
        this.name = 'AddKarmaAndReputationFields1734700000001';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "games" ADD "karma_score" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "games" ADD "reputation" jsonb`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "reputation"`);
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "karma_score"`);
    }
}
exports.AddKarmaAndReputationFields1734700000001 = AddKarmaAndReputationFields1734700000001;
//# sourceMappingURL=1734700000001-AddKarmaAndReputationFields.js.map