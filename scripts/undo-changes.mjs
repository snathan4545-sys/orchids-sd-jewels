import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq, inArray } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function main() {
  try {
    // 1. Delete the "Tree of Life Golden Kadas Bracelet" added in the last turn
    const deleted = await db.delete(products)
      .where(eq(products.id, 258))
      .returning();
    
    if (deleted.length > 0) {
      console.log(`Deleted product: ${deleted[0].name} (ID: 258)`);
    } else {
      console.log('Product with ID 258 not found');
    }

    // 2. Restore prices for Kadas Bracelets 101-104 to 249
    const kadasIds = [117, 118, 119, 120];
    await db.update(products)
      .set({ price: 249 })
      .where(inArray(products.id, kadasIds));
    console.log(`Updated prices for IDs ${kadasIds.join(', ')} to 249`);

    // 3. Restore price for Butterfly Golden Kadas Bracelet to 249
    await db.update(products)
      .set({ price: 249 })
      .where(eq(products.id, 116));
    console.log('Updated price for ID 116 (Butterfly) to 249');

    // 4. Restore price for Semi-moon Golden Kadas Bracelet to 299
    await db.update(products)
      .set({ price: 299 })
      .where(eq(products.id, 121));
    console.log('Updated price for ID 121 (Semi-moon) to 299');

    console.log('Undo operations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during undo:', error);
    process.exit(1);
  }
}

main();
