import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { inArray } from 'drizzle-orm';

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw',
});

const db = drizzle(client);

async function updatePrices() {
  try {
    const productNames = [
      'Butterfly Golden Kadas Bracelet',
      'Kadas Bracelet 101',
      'Kadas Bracelet 102',
      'Kadas Bracelet 103',
      'Kadas Bracelet 104'
    ];

    console.log('Updating prices to 219 for:', productNames);

    const result = await db.update(products)
      .set({ price: 219, updatedAt: new Date().toISOString() })
      .where(inArray(products.name, productNames));

    console.log('Update result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Error updating prices:', error);
    process.exit(1);
  }
}

updatePrices();
