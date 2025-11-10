import request from 'supertest';
import { expect, describe, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { AppDataSource } from '../../src/data-source';
import app from '../../src/app';

describe('POST /tenants', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    await AppDataSource.query('TRUNCATE TABLE "tenants" CASCADE');
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      const tenantData = {
        name: 'Test Tenant',
        address: '123 Main St, Anytown, USA',
      };
      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.status).toBe(201);
    });
  });
});
