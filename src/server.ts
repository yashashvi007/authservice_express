import app from './app';
import { Config } from './config';
import logger from './config/logger';
import { AppDataSource } from './data-source';
import { Client } from 'pg';

const createDatabaseIfNotExists = async () => {
  const dbName = Config.DB_NAME || 'postgres';
  const host = Config.DB_HOST || 'localhost';
  const port = parseInt(Config.DB_PORT || '5432');
  const username = Config.DB_USERNAME || 'postgres';
  const password = Config.DB_PASSWORD || 'password';

  if (dbName === 'postgres') {
    // Skip creation for default postgres database
    return;
  }

  const adminClient = new Client({
    host,
    port,
    user: username,
    password,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    const result = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

    if (result.rows.length === 0) {
      logger.info(`Creating database: ${dbName}`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`Database ${dbName} created successfully`);
    }
  } catch (error) {
    logger.warn(
      `Could not create database (may already exist): ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    await adminClient.end();
  }
};

const startServer = async () => {
  const PORT = Config.PORT;

  try {
    await createDatabaseIfNotExists();
    await AppDataSource.initialize();
    app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
};

void startServer();
