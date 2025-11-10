import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenants1762541308798 implements MigrationInterface {
  name = 'CreateTenants1762541308798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN "address"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" ADD "address" character varying(255) NOT NULL`);
  }
}
