import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw',
});

const db = drizzle(client);

async function addProduct() {
  try {
    const now = new Date().toISOString();
        const result = await db.insert(products).values({
          name: 'Luxe Emerald Teardrop Statement Necklace Set',
          description: 'Opulent gold-tone necklace featuring cascading emerald green teardrop gemstones encased in sparkling crystal halos. Elegant chain design with crystal embellishments. Dramatic statement piece with matching teardrop earrings. Ideal for weddings, receptions, and upscale events.',
          price: 759,
          originalPrice: 899,
          category: 'necklaces',
          images: [
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-1767212215433.jpeg?width=1200&height=1200&resize=contain&quality=95',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-01-at-1.38.31-AM-1767212215550.jpeg?width=1200&height=1200&resize=contain&quality=95'
          ],
          colors: null,
          inStock: true,
          featured: false,
          createdAt: now,
          updatedAt: now,
        }).returning();


    console.log('Product added:', result[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error adding product:', error);
    process.exit(1);
  }
}

addProduct();

