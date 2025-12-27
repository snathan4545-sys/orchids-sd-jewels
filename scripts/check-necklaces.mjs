import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

const necklaces = await db.select().from(products).where(eq(products.category, 'necklaces'));
console.log('Total necklaces:', necklaces.length);
console.log(JSON.stringify(necklaces.map(p => ({ id: p.id, name: p.name })), null, 2));
process.exit(0);
