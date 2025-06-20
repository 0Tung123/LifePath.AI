import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKarmaAndReputationFields1734700000001
  implements MigrationInterface
{
  name = 'AddKarmaAndReputationFields1734700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "games" ADD "karma_score" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD "reputation" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "reputation"`);
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "karma_score"`);
  }
}