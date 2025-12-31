import { db } from '@/db';
import { products } from '@/db/schema';
import { like, and, eq } from 'drizzle-orm';

async function main() {
  // Find all Basket necklaces
  const basketNecklaces = await db.select()
    .from(products)
    .where(
      and(
        like(products.name, '%Basket%'),
        eq(products.category, 'necklaces')
      )
    );

  console.log('Found Basket necklaces:', basketNecklaces.length);
  basketNecklaces.forEach((p, i) => {
    console.log(`${i + 1}. ID: ${p.id}, Name: ${p.name}`);
  });

  if (basketNecklaces.length > 1) {
    // Keep the first one, delete the rest
    const toDelete = basketNecklaces.slice(1);
    for (const product of toDelete) {
      await db.delete(products).where(eq(products.id, product.id));
      console.log(`✓ Deleted duplicate: ${product.name} (ID: ${product.id})`);
    }
  }
}

main().catch(console.error);
