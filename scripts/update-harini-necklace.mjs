import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io',
  authToken:
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKG RqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw'.replace(/\s+/g, ''),
});

const db = drizzle(client);

const NEW_IMAGES = [
  'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-13-at-13.57.34-1767213269803.jpeg?width=8000&height=8000&resize=contain',
  'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-13-at-13.57.35-1767213270074.jpeg?width=8000&height=8000&resize=contain',
];

const NEW_COLORS = ['Green', 'Pink'];

function uniqStrings(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

async function updateHariniNecklace() {
  try {
    const now = new Date().toISOString();

    const current = await db.select().from(products).where(eq(products.id, 58));
    const product = current[0];

    if (!product) {
      console.error('Product 58 not found');
      process.exit(1);
    }

    const currentImages = uniqStrings(product.images);
    const currentColors = uniqStrings(product.colors);

    const mergedImages = uniqStrings([...currentImages, ...NEW_IMAGES]);
    const mergedColors = uniqStrings([...currentColors, ...NEW_COLORS]);

    console.log('Current images:', currentImages.length);
    console.log('Appending images:', NEW_IMAGES.length);
    console.log('Result images:', mergedImages.length);

    const result = await db
      .update(products)
      .set({
        images: mergedImages,
        colors: mergedColors,
        updatedAt: now,
      })
      .where(eq(products.id, 58))
      .returning();

    console.log('Product updated:', {
      id: result[0]?.id,
      name: result[0]?.name,
      images: result[0]?.images,
      colors: result[0]?.colors,
      updatedAt: result[0]?.updatedAt,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating product:', error);
    process.exit(1);
  }
}

updateHariniNecklace();
