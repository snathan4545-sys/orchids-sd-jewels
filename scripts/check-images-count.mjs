import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { inArray } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function checkImages() {
  try {
    const results = await db.select().from(products).where(inArray(products.id, [263, 264]));
    results.forEach(p => {
      console.log(`ID: ${p.id}, Name: ${p.name}, Images Count: ${p.images.length}`);
      console.log(`Images: ${JSON.stringify(p.images)}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkImages();
