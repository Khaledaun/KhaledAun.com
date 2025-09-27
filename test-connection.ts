import pg from 'pg';

async function testConnection() {
  console.log('Attempting to connect to the database...');
  const { Client } = pg;
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ Successfully connected to the database!');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

testConnection();
