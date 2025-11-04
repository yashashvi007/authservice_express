import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Config } from './config';
import { RefreshToken } from './entity/RefreshToken';

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
  entities: [User, RefreshToken],
  migrations: [],
  subscribers: [],
});
