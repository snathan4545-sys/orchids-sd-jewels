import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  // Find and delete duplicates (keep lower ID)
  const duplicates = [
    { name: 'Elegant Gold-Tone Necklace with Blue Gemstone Pendant', ids: [220, 221] },
    { name: 'Gold-Tone Leaf Pearl Necklace Set', ids: [217, 218] },
    { name: 'Luxe Emerald Teardrop Statement Necklace Set', ids: [222, 223] },
    { name: 'Peacock Pendant Chain Necklace Set', ids: [211, 212] },
    { name: 'Traditional Deity Pearl Necklace Set', ids: [213, 214] },
  ];

  for (const dup of duplicates) {
    // Keep the first ID, delete the rest
    const [keep, ...deleteIds] = dup.ids;
    console.log(`Keeping ID ${keep} for "${dup.name}", deleting:`, deleteIds);
    
    for (const id of deleteIds) {
      await db.execute({
        sql: 'DELETE FROM products WHERE id = ?',
        args: [id]
      });
      console.log(`  Deleted ID ${id}`);
    }
  }

  console.log('\n✅ Successfully removed all duplicates');

  // Verify
  const remaining = await db.execute(`
    SELECT name, COUNT(*) as count 
    FROM products 
    GROUP BY name 
    HAVING COUNT(*) > 1
  `);

  console.log('\nRemaining duplicates:', remaining.rows);

} catch (error) {
  console.error('Error:', error);
} finally {
  db.close();
}
