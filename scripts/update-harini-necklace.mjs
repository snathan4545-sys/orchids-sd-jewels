import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw',
});

const db = drizzle(client);

async function updateHariniNecklace() {
  try {
    const now = new Date().toISOString();
    
    // First, get current product details
    const current = await db.select().from(products).where(eq(products.id, 58));
    console.log('Current product:', current[0]);
    
    // Update with new images and colors
    const result = await db.update(products)
      .set({
        images: [
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-1767212558209.jpeg?width=1200&height=1200&resize=contain&quality=95',
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-01-at-1.48.41-AM-1767212558221.jpeg?width=1200&height=1200&resize=contain&quality=95'
        ],
        colors: ['Green', 'Pink'],
        updatedAt: now,
      })
      .where(eq(products.id, 58))
      .returning();

    console.log('Product updated:', result[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error updating product:', error);
    process.exit(1);
  }
}

updateHariniNecklace();
