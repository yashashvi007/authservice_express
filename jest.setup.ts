// Jest setup file
import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { AppDataSource } from './src/data-source';

// Global setup: Initialize database connection once before all tests
beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();

    // Force synchronize to recreate tables with correct constraints
    await AppDataSource.synchronize(true);

    // Tables are created by synchronize with correct constraints from entity definitions
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
