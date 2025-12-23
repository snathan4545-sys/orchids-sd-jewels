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

async function removeColors() {
  console.log('Fetching all necklaces...');
  const allNecklaces = await db.select().from(products).where(
    eq(products.category, 'necklaces')
  );
  
  // Product names to remove colors from
  const targetNames = [
    'golden daisy line',
    'green leaf bash',
    'grape necklace',
    'binge necklace',
    'single stone fred',
    'leaf stone',
    'basket necklace',
    'snowflake necklace',
    'floral white stone drop',
    'stone droplet',
    'lakshmi dollor round pearl',
    'lakshmi dollar round pearl',
    'multi stone',
    'twinkle star',
    'square gold look',
    'elephant necklace large',
    'elephant necklace small',
    'elephant pearl'
  ];
  
  const matchedProducts = allNecklaces.filter(p => 
    targetNames.some(name => p.name.toLowerCase().includes(name))
  );
  
  console.log(`\nFound ${matchedProducts.length} products to remove colors from:`);
  matchedProducts.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
    console.log(`    Current colors: ${p.colors}`);
  });
  
  if (matchedProducts.length > 0) {
    console.log('\nRemoving colors...');
    for (const product of matchedProducts) {
      await db.update(products).set({ colors: '[]' }).where(eq(products.id, product.id));
    }
    console.log(`✅ Removed colors from ${matchedProducts.length} products!`);
  } else {
    console.log('No matching products found.');
  }
  
  process.exit(0);
}

removeColors().catch((error) => {
  console.error('Error removing colors:', error);
  process.exit(1);
});
