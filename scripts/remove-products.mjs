import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function removeProducts() {
  const categoriesToRemove = ['earrings', 'bracelets', 'rings', 'impon', 'guarantee-chains'];
  
  console.log('Fetching products to remove...');
  const productsToRemove = await db.select().from(products).where(
    inArray(products.category, categoriesToRemove)
  );
  
  console.log(`Found ${productsToRemove.length} products to remove:`);
  productsToRemove.forEach(p => {
    console.log(`  - ${p.name} (${p.category})`);
  });
  
  if (productsToRemove.length > 0) {
    console.log('\nRemoving products...');
    await db.delete(products).where(
      inArray(products.category, categoriesToRemove)
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
