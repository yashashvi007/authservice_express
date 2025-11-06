import { describe, it, beforeEach } from '@jest/globals';
import { AppDataSource } from '../../src/data-source';

describe('POST /auth/login', () => {
  beforeEach(async () => {
    // Ensure connection is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Clear the tables using TRUNCATE CASCADE to handle foreign key constraints
    await AppDataSource.query('TRUNCATE TABLE refresh_token, "user" CASCADE');
  });

  describe('Given all fields', () => {
    it('should return 200 status code', async () => {});
  });
});
