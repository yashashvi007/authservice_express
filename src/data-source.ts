import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Config } from './config';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: Config.DB_HOST || 'localhost',
  port: parseInt(Config.DB_PORT || '5432'),
  username: Config.DB_USERNAME || 'postgres',
  password: Config.DB_PASSWORD || 'password',
  database: Config.DB_NAME || 'postgres',
  // dont use this in production
  synchronize: Config.NODE_ENV === 'dev',
  logging: false,
  entities: ['src/entity/*.ts'],
  migrations: ['src/migration/*.ts'],
  subscribers: [],
});
