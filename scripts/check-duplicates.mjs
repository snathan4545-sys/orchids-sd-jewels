import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  // Find duplicate names
  const duplicateNames = await db.execute(`
    SELECT name, COUNT(*) as count 
    FROM products 
    GROUP BY name 
    HAVING COUNT(*) > 1
  `);

  console.log('Duplicate product names:');
  console.log(duplicateNames.rows);

  // Get all products to check
  const allProducts = await db.execute('SELECT id, name FROM products ORDER BY name');
  console.log('\nAll products:');
  allProducts.rows.forEach(row => {
    console.log(`ID: ${row.id}, Name: ${row.name}`);
  });

  // Check for duplicate IDs
  const duplicateIds = await db.execute(`
    SELECT id, COUNT(*) as count 
    FROM products 
    GROUP BY id 
    HAVING COUNT(*) > 1
  `);

  console.log('\nDuplicate IDs:');
  console.log(duplicateIds.rows);

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
