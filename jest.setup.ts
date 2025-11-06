// Jest setup file
import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { AppDataSource } from './src/data-source';

// Global setup: Initialize database connection once before all tests
beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();

    // Force synchronize to recreate tables with correct constraints
    await AppDataSource.synchronize(true);

    // Ensure the foreign key constraint has CASCADE
    // TypeORM should create it with CASCADE based on the entity definition,
    // but we'll verify and fix it if needed
    try {
      // Drop all existing foreign key constraints on refresh_token referencing user
      await AppDataSource.query(`
        DO $$ 
        DECLARE
          r RECORD;
        BEGIN
          FOR r IN (
            SELECT conname
            FROM pg_constraint
            WHERE contype = 'f'
            AND conrelid = 'refresh_token'::regclass
            AND confrelid = 'user'::regclass
          ) LOOP
            EXECUTE 'ALTER TABLE refresh_token DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
          END LOOP;
        END $$;
      `);

      // Recreate the constraint with CASCADE
      await AppDataSource.query(`
        ALTER TABLE refresh_token
        ADD CONSTRAINT refresh_token_userId_fkey
        FOREIGN KEY ("userId")
        REFERENCES "user"(id)
        ON DELETE CASCADE;
      `);
    } catch {
      // If constraint already exists, try to alter it
      try {
        await AppDataSource.query(`
          ALTER TABLE refresh_token
          DROP CONSTRAINT IF EXISTS refresh_token_userId_fkey,
          ADD CONSTRAINT refresh_token_userId_fkey
          FOREIGN KEY ("userId")
          REFERENCES "user"(id)
          ON DELETE CASCADE;
        `);
      } catch {
        // Ignore - constraint setup might vary
      }
    }
  }
});

// Ensure connection is ready before each test
beforeEach(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

// Global teardown: Clean up database connection after all tests
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
