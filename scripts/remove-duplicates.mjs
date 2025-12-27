import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

const duplicateIds = [100, 106, 107, 109];

for (const id of duplicateIds) {
  await db.delete(products).where(eq(products.id, id));
  console.log(`Deleted product ID: ${id}`);
}

console.log(`Removed ${duplicateIds.length} duplicate products`);
process.exit(0);
