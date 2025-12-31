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
      name: 'Gold-Tone Leaf Pearl Necklace Set',
      description: 'Beautiful gold-tone necklace set with intricate leaf motifs and sparkling stone embellishments. Features a stunning centerpiece pendant with pearl drop. Comes with matching earrings. Perfect for traditional occasions and festive celebrations.',
      price: 499,
      originalPrice: 599,
      category: 'necklaces',
      images: [
        'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-31-at-2.34.05-PM-1767211114159.jpeg?width=1200&height=1200&resize=contain&quality=95',
        'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-31-at-2.34.24-PM-1767211114288.jpeg?width=1200&height=1200&resize=contain&quality=95'
      ],
      colors: null,
      inStock: 8,
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

