import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function fixCategory() {
  try {
    await db.execute({
      sql: `UPDATE products SET category = 'necklaces' WHERE category = 'necklace'`,
      args: [],
    });

    console.log('✓ Updated necklace category to necklaces');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

fixCategory();
