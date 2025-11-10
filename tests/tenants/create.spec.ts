import request from 'supertest';
import { expect, describe, it, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { AppDataSource } from '../../src/data-source';
import app from '../../src/app';
import { Tenant } from '../../src/entity/Tenant';
import createJWKSMock from 'mock-jwks';
import { ROLES } from '../../src/constants';

describe('POST /tenants', () => {
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken;

  beforeAll(async () => {
    jwks = createJWKSMock('http://localhost:5001');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  beforeEach(async () => {
    await AppDataSource.query('TRUNCATE TABLE "tenants" CASCADE');
    jwks?.start();

    adminToken = jwks.token({
      sub: '1',
      role: ROLES.ADMIN,
    });
  });

  afterEach(() => {
    jwks?.stop();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    jwks?.stop();
  });

  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      const tenantData = {
        name: 'Test Tenant',
        address: '123 Main St, Anytown, USA',
      };
      const response = await request(app)
        .post('/tenants')
        .set('Cookie', [`accessToken=${adminToken}`])
        .send(tenantData);
      expect(response.status).toBe(201);
      const tenantRepository = AppDataSource.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(1);
      expect(tenants[0]?.name).toBe(tenantData.name);
      expect(tenants[0]?.address).toBe(tenantData.address);
    });

    it('should return 401 if user is not authenticated', async () => {
      const tenantData = {
        name: 'Test Tenant',
        address: '123 Main St, Anytown, USA',
      };
      const response = await request(app).post('/tenants').send(tenantData);
      expect(response.statusCode).toBe(401);
      const tenantRepository = AppDataSource.getRepository(Tenant);
      const tenants = await tenantRepository.find();
      expect(tenants).toHaveLength(0);
    });
  });
});
