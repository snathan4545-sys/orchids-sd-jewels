import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function checkRingsDuplicates() {
  try {
    const allRings = await db.select().from(products).where(eq(products.category, 'rings'));
    console.log(`\nTotal rings found: ${allRings.length}\n`);
    
    // Group by name
    const nameMap = new Map();
    allRings.forEach(ring => {
      if (!nameMap.has(ring.name)) {
        nameMap.set(ring.name, []);
      }
      nameMap.get(ring.name).push(ring);
    });
    
    // Find duplicates
    const duplicates = Array.from(nameMap.entries())
      .filter(([name, rings]) => rings.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate ring names:\n`);
      duplicates.forEach(([name, rings]) => {
        console.log(`"${name}" - ${rings.length} copies:`);
        rings.forEach(r => console.log(`  ID ${r.id}: ${r.image_url}`));
        console.log('');
      });
    } else {
      console.log('No duplicates found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkRingsDuplicates();
