import { describe, it, beforeAll, afterAll, beforeEach, afterEach, expect } from '@jest/globals';
import { AppDataSource } from '../../src/data-source';
import app from '../../src/app';
import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import { User } from '../../src/entity/User';
import { ROLES } from '../../src/constants';

describe('POST /auth/self', () => {
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(() => {
    jwks = createJWKSMock('http://localhost:5001');
  });

  beforeEach(async () => {
    // Ensure connection is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    jwks?.start();
    // Clear the tables using TRUNCATE CASCADE to handle foreign key constraints
    await AppDataSource.query('TRUNCATE TABLE "refreshTokens", "users", "tenants" CASCADE');
  });

  afterEach(() => {
    jwks?.stop();
  });

  afterAll(() => {
    jwks?.stop();
  });

  describe('Given all fields', () => {
    it('should return 200 status code', async () => {
      const accessToken = jwks.token({ sub: '1', role: ROLES.CUSTOMER });
      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it('should return the user data', async () => {
      const userRepository = AppDataSource.getRepository(User);
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };
      const data = await userRepository.save({ ...userData, role: ROLES.CUSTOMER });

      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get('/auth/self')
        .set('Cookie', [`accessToken=${accessToken}`]);
      expect((response.body as Record<string, unknown>).id).toBe(data.id);
    });

    it('should return 401 status code if access token is provided', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save({ ...userData, role: ROLES.CUSTOMER });

      const response = await request(app).get('/auth/self').send();
      expect(response.statusCode).toBe(401);
    });
  });
});
