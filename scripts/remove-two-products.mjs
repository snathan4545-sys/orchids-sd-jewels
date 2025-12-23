import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';
import { inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const namesToRemove = ['Ruby Stone Necklace Set', 'Antique Temple Necklace'];

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function main() {
  console.log('Fetching products to remove...');

  const rows = await db
    .select({ id: products.id, name: products.name, category: products.category })
    .from(products)
    .where(inArray(products.name, namesToRemove));

  console.log(`Found ${rows.length} products:`);
  rows.forEach((p) => console.log(`  - ${p.id}: ${p.name} (${p.category})`));

  if (rows.length === 0) {
    console.log('No matching products found.');
    process.exit(0);
  }

  console.log('\nRemoving products...');
  await db.delete(products).where(inArray(products.name, namesToRemove));
  console.log('✅ Products removed successfully!');

  process.exit(0);
}

main().catch((error) => {
  console.error('Error removing products:', error);
  process.exit(1);
});
