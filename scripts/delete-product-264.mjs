import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function deleteProduct() {
  try {
    const idToDelete = 264;
    console.log(`Attempting to delete product with ID: ${idToDelete}`);
    
    const result = await db.delete(products).where(eq(products.id, idToDelete)).returning();
    
    if (result.length > 0) {
      console.log('Successfully deleted product:', result[0]);
    } else {
      console.log('No product found with ID:', idToDelete);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteProduct();
