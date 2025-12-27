import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';
import { eq, desc } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function renameLakshmiCoral() {
  try {
    // Get the last added product
    const lastProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.id))
      .limit(1);

    if (lastProducts.length === 0) {
      console.log('No products found');
      return;
    }

    const lastProduct = lastProducts[0];
    console.log(`Found last product: ID ${lastProduct.id} - ${lastProduct.name}`);

    // Update the name
    await db
      .update(products)
      .set({ name: 'Antique Lakshmi Coral Necklace' })
      .where(eq(products.id, lastProduct.id));

    console.log(`✓ Renamed to "Antique Lakshmi Coral Necklace"`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

renameLakshmiCoral();
