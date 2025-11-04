import { describe, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { AppDataSource } from '../../src/data-source';

describe('POST /auth/login', () => {
  beforeAll(async () => {
    // Initialize AppDataSource if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create tables manually for tests
    await AppDataSource.query(`
          CREATE TABLE IF NOT EXISTS "user" (
            "id" SERIAL PRIMARY KEY,
            "firstName" VARCHAR NOT NULL,
            "lastName" VARCHAR NOT NULL,
            "email" VARCHAR NOT NULL,
            "password" VARCHAR NOT NULL,
            "role" VARCHAR NOT NULL
          )
        `);

    await AppDataSource.query(`
          CREATE TABLE IF NOT EXISTS "refresh_token" (
            "id" SERIAL PRIMARY KEY,
            "expires_at" TIMESTAMP NOT NULL,
            "userId" INTEGER,
            "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "FK_refresh_token_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
          )
        `);
  });

  beforeEach(async () => {
    // Clear the tables in correct order to handle foreign key constraints
    await AppDataSource.query('TRUNCATE TABLE "refresh_token", "user" CASCADE');
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Given all fields', () => {
    it('should return 200 status code', async () => {});
  });
});
