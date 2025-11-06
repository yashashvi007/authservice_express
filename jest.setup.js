// Jest setup file
const { AppDataSource } = require('../dist/data-source');

// Global setup: Initialize database connection once before all tests
beforeAll(async () => {
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

// Global teardown: Clean up database connection after all tests
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
