import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';
import { eq, like, and } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function removeProduct() {
  try {
    // Find the product
    const found = await db.select().from(products)
      .where(and(
        like(products.name, '%Crossover Crystal Band%'),
        eq(products.category, 'rings')
      ));
    
    console.log('Found products:', found);
    
    if (found.length > 0) {
      // Delete the product
      await db.delete(products)
        .where(and(
          like(products.name, '%Crossover Crystal Band%'),
          eq(products.category, 'rings')
        ));
      
      console.log(`✓ Removed ${found[0].name}`);
    } else {
      console.log('Product not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

removeProduct();
