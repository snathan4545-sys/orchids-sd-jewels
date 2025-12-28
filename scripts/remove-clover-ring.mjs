import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function removeCloverRing() {
  try {
    // Find the product
    const result = await db.execute({
      sql: `SELECT id, name FROM products WHERE name LIKE ? AND category = ?`,
      args: ['%Clover%Ribbon%', 'rings'],
    });

    if (result.rows.length === 0) {
      console.log('No Clover Ribbon ring found');
      return;
    }

    // Delete the product
    for (const row of result.rows) {
      await db.execute({
        sql: `DELETE FROM products WHERE id = ?`,
        args: [row.id],
      });
      console.log(`✓ Removed: ${row.name} (ID: ${row.id})`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

removeCloverRing();
