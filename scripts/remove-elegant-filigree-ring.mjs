import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

async function removeProduct() {
  try {
    const result = await db.delete(products)
      .where(eq(products.name, "Elegant Filigree Adjustable Ring (Gold)"))
      .returning();
    
    if (result.length > 0) {
      console.log('✓ Removed Elegant Filigree Adjustable Ring (Gold)');
    } else {
      console.log('Product not found');
    }
  } catch (error) {
    console.error('Error removing product:', error);
  } finally {
    client.close();
  }
}

removeProduct();
