import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';
import { eq, inArray, like, or, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function removeProducts() {
  console.log('Fetching all necklaces...');
  const allNecklaces = await db.select().from(products).where(
    eq(products.category, 'necklaces')
  );
  
  console.log(`\nFound ${allNecklaces.length} total necklaces:`);
  allNecklaces.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
  });
  
  // Find duplicates and "Amritha Lakshmi Necklace set"
  const nameCounts = {};
  allNecklaces.forEach(p => {
    const name = p.name.toLowerCase().trim();
    if (!nameCounts[name]) {
      nameCounts[name] = [];
    }
    nameCounts[name].push(p);
  });
  
  const toRemove = [];
  
  // Find "Amritha Lakshmi Necklace set"
  Object.entries(nameCounts).forEach(([name, items]) => {
    if (name.includes('amritha lakshmi')) {
      toRemove.push(...items);
    }
  });
  
  // Find duplicates (keep first, remove rest)
  Object.entries(nameCounts).forEach(([name, items]) => {
    if (items.length > 1 && !name.includes('amritha lakshmi')) {
      console.log(`\nDuplicate found: "${items[0].name}" (${items.length} copies)`);
      toRemove.push(...items.slice(1)); // Keep first, remove rest
    }
  });
  
  console.log(`\n\nProducts to remove (${toRemove.length}):`);
  toRemove.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
  });
  
  if (toRemove.length > 0) {
    console.log('\nRemoving products...');
    const idsToRemove = toRemove.map(p => p.id);
    await db.delete(products).where(
      inArray(products.id, idsToRemove)
    );
    console.log('✅ Products removed successfully!');
  } else {
    console.log('No products found to remove.');
  }
  
  process.exit(0);
}

removeProducts().catch((error) => {
  console.error('Error removing products:', error);
  process.exit(1);
});
