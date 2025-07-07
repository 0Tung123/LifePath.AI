import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusEffectsAndEvents1720000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add player_status_effects column
    await queryRunner.query(`
      ALTER TABLE games
      ADD COLUMN IF NOT EXISTS player_status_effects JSONB DEFAULT '[]'::jsonb
    `);

    // Update world_state column to ensure it has activeEvents field
    await queryRunner.query(`
      UPDATE games
      SET world_state = jsonb_set(
        COALESCE(world_state, '{}'::jsonb),
        '{activeEvents}',
        COALESCE(world_state->'activeEvents', '[]'::jsonb)
      )
      WHERE world_state IS NULL OR world_state->'activeEvents' IS NULL
    `);

    // Add indexes for better performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_games_player_status_effects ON games USING gin (player_status_effects)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_games_world_state_active_events ON games USING gin ((world_state->'activeEvents'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_games_player_status_effects
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_games_world_state_active_events
    `);

    // Remove player_status_effects column
    await queryRunner.query(`
      ALTER TABLE games
      DROP COLUMN IF EXISTS player_status_effects
    `);

    // We don't remove the activeEvents from world_state as it might contain user data
  }
}
