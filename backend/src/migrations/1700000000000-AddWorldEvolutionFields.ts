import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorldEvolutionFields1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm các trường mới vào bảng games
    await queryRunner.query(`
      ALTER TABLE games
      ADD COLUMN IF NOT EXISTS world_state JSONB,
      ADD COLUMN IF NOT EXISTS npc_relationships JSONB,
      ADD COLUMN IF NOT EXISTS quest_log JSONB,
      ADD COLUMN IF NOT EXISTS player_choice_history JSONB,
      ADD COLUMN IF NOT EXISTS world_evolution JSONB
    `);

    // Cập nhật các trường hiện có để sử dụng cấu trúc mới
    await queryRunner.query(`
      UPDATE games
      SET world_state = jsonb_build_object(
        'gameTime', jsonb_build_object(
          'day', 1,
          'hour', 12,
          'minute', 0,
          'season', 'spring',
          'year', 1
        ),
        'environment', jsonb_build_object(
          'weather', 'clear',
          'temperature', 20,
          'conditions', jsonb_build_array('normal')
        ),
        'society', jsonb_build_object(
          'politicalState', 'stable',
          'economicState', 'normal'
        ),
        'discoveredRegions', jsonb_build_array(),
        'activeEvents', jsonb_build_array()
      )
      WHERE world_state IS NULL AND active = true
    `);

    // Khởi tạo mảng mối quan hệ NPC trống
    await queryRunner.query(`
      UPDATE games
      SET npc_relationships = jsonb_build_array()
      WHERE npc_relationships IS NULL AND active = true
    `);

    // Khởi tạo nhật ký nhiệm vụ trống
    await queryRunner.query(`
      UPDATE games
      SET quest_log = jsonb_build_array()
      WHERE quest_log IS NULL AND active = true
    `);

    // Khởi tạo lịch sử lựa chọn trống
    await queryRunner.query(`
      UPDATE games
      SET player_choice_history = jsonb_build_array()
      WHERE player_choice_history IS NULL AND active = true
    `);

    // Khởi tạo lịch sử tiến hóa thế giới trống
    await queryRunner.query(`
      UPDATE games
      SET world_evolution = jsonb_build_array()
      WHERE world_evolution IS NULL AND active = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các trường mới
    await queryRunner.query(`
      ALTER TABLE games
      DROP COLUMN IF EXISTS world_state,
      DROP COLUMN IF EXISTS npc_relationships,
      DROP COLUMN IF EXISTS quest_log,
      DROP COLUMN IF EXISTS player_choice_history,
      DROP COLUMN IF EXISTS world_evolution
    `);
  }
}
