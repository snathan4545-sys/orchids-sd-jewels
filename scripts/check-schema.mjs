import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

try {
  const result = await db.execute("PRAGMA table_info(products)");
  console.log('Products table schema:');
  console.log(result.rows);
} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
