import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddDeathAndTrackingFields1734616581000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
