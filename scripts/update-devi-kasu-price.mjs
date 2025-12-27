import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

await db.update(products)
  .set({ 
    price: 899,
    originalPrice: 999,
    updatedAt: new Date().toISOString()
  })
  .where(eq(products.name, 'Devi Kasu Necklace'));

console.log('✓ Updated Devi Kasu Necklace price to ₹899');
process.exit(0);
