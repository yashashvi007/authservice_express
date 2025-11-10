import request from 'supertest';
import { expect, describe, it, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { User } from '../../src/entity/User';
import { AppDataSource } from '../../src/data-source';
import { ROLES } from '../../src/constants';
import app from '../../src/app';
import { isJwt } from '../../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';

describe('POST /auth/register', () => {
  beforeAll(async () => {
    // Initialize AppDataSource if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Tables are created by synchronize in jest.setup.ts
  });

  beforeEach(async () => {
    // Clear the tables in correct order to handle foreign key constraints
    await AppDataSource.query('TRUNCATE TABLE "refreshTokens", "users", "tenants" CASCADE');
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Given all fields', () => {
    it('should return 201 status code', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };
      const response = await request(app).post('/auth/register').send(userData);
      expect(response.status).toBe(201);
    });

    it('should return valid json response', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);
      expect(response.headers['content-type']).toEqual(expect.stringContaining('json'));
    });

    it('should return the created user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(userData);

      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users.length).toBe(1);
      expect(users[0]?.firstName).toBe(userData.firstName);
      expect(users[0]?.lastName).toBe(userData.lastName);
      expect(users[0]?.email).toBe(userData.email);
      expect(users[0]?.password).not.toBe(userData.password);
    });

    it('should return id of the created user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const user = await request(app).post('/auth/register').send(userData);
      expect((user.body as { id?: number })?.id).toBeDefined();
    });

    it('should assign a customer a role', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(userData);
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty('role');
      expect(users[0]?.role).toBe('customer');
    });

    it('should store the hashed password in the database', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(userData);
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]?.password).not.toBe(userData.password);
      expect(users[0]?.password).toHaveLength(60);
      expect(users[0]?.password).toMatch(/^\$2b\$10\$/);
    });

    it('should retur 400 status code if email is already in use', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save({ ...userData, role: ROLES.CUSTOMER });

      const response = await request(app).post('/auth/register').send(userData);
      const users = await userRepository.find();
      expect(response.status).toBe(400);
      expect(users).toHaveLength(1);
    });
  });

  describe('Given invalid fields', () => {
    it('should return 400 status code if email is not provided', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);
      expect(response.status).toBe(400);
      // expect(response.body.errors).toHaveLength(1);
    });

    it('should return the access token and refresh token inside a cookie', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);

      interface Headers {
        'set-cookie': string[];
      }

      const cookies = (response.headers as Headers)['set-cookie'] || [];

      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      cookies.forEach((cookie) => {
        if (cookie.startsWith('accessToken=')) {
          accessToken = cookie.split(';')[0]?.split('=')[1] || null;
        }

        if (cookie.startsWith('refreshToken=')) {
          refreshToken = cookie.split(';')[0]?.split('=')[1] || null;
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();
      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it('should store the refresh token in the database', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);
      const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);
      const token = await refreshTokenRepo
        .createQueryBuilder('refreshToken')
        .leftJoinAndSelect('refreshToken.user', 'user')
        .where('user.id = :userId', { userId: (response.body as Record<string, number>).id })
        .getMany();
      expect(token).toHaveLength(1);
    });
  });

  describe('Fields are not in proper format', () => {
    it('should trim the email field', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: ' john.doe@example.com ',
        password: 'password',
      };

      await request(app).post('/auth/register').send(userData);
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();
      const user = users[0];
      expect(user?.email).toBe(userData.email.trim());
    });
  });
});
