import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenants1762779578013 implements MigrationInterface {
  name = 'CreateTenants1762779578013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" ADD "address" character varying(255) NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "address"`);
  }
}
