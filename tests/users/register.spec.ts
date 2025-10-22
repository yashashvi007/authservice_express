import request from 'supertest';
import app from '../../src/app';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { beforeEach } from 'node:test';
import { truncateTables } from '../../utils';

describe('POST /auth/register', () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    await truncateTables(connection);
  });

  afterAll(async () => {
    await connection.destroy();
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
      // Clean the database before this specific test
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.clear(); // Use clear() instead of delete({})

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password',
      };

      await request(app).post('/auth/register').send(userData);

      const users = await userRepository.find();
      expect(users.length).toBe(1);
      expect(users[0]?.firstName).toBe(userData.firstName);
      expect(users[0]?.lastName).toBe(userData.lastName);
      expect(users[0]?.email).toBe(userData.email);
      expect(users[0]?.password).toBe(userData.password);
    });
  });

  describe('Given invalid fields', () => {});
});
