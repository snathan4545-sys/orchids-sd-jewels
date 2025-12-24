import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw',
});

const db = drizzle(client);

async function removeDuplicates() {
  try {
    // Remove duplicate LV Golden Kadas Bracelet (ID 113)
    await db.delete(products).where(eq(products.id, 113));
    console.log('Removed duplicate: LV Golden Kadas Bracelet (ID: 113)');

    // Remove duplicate Arrowside Golden Kadas Bracelet (ID 115)
    await db.delete(products).where(eq(products.id, 115));
    console.log('Removed duplicate: Arrowside Golden Kadas Bracelet (ID: 115)');

    console.log('Duplicates removed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

removeDuplicates();
