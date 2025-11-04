import { Client } from 'pg';
import { Config } from '../config';

const initDatabase = async () => {
  const dbName = Config.DB_NAME || 'postgres';
  const host = Config.DB_HOST || 'localhost';
  const port = parseInt(Config.DB_PORT || '5432');
  const username = Config.DB_USERNAME || 'postgres';
  const password = Config.DB_PASSWORD || 'password';

  // Connect to default postgres database to create the target database
  const adminClient = new Client({
    host,
    port,
    user: username,
    password,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL');

    // Check if database exists
    const result = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);

    if (result.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await adminClient.end();
  }
};

initDatabase()
  .then(() => {
    console.log('Database initialization complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
