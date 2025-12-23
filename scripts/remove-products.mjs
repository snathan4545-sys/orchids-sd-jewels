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
  console.log('Fetching necklaces to remove...');
  const productsToRemove = await db.select().from(products).where(
    and(
      eq(products.category, 'necklaces'),
      or(
        like(products.name, '%Ruby Stone%'),
        like(products.name, '%Antique Temple%')
      )
    )
  );
  
  console.log(`Found ${productsToRemove.length} products to remove:`);
  productsToRemove.forEach(p => {
    console.log(`  - ${p.name} (${p.category})`);
  });
  
  if (productsToRemove.length > 0) {
    console.log('\nRemoving products...');
    const idsToRemove = productsToRemove.map(p => p.id);
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
