import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTables1762539009373 implements MigrationInterface {
  name = 'RenameTables1762539009373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('user', 'users');
    await queryRunner.renameTable('refresh_token', 'refreshTokens');
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refreshTokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
    await queryRunner.renameTable('users', 'user');
    await queryRunner.renameTable('refresh_tokens', 'refresh_token');
  }
}
