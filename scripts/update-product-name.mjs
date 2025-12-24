import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const FALLBACK_URL = 'libsql://db-46282aba-8dd0-473b-a403-c4e269b9df9b-orchids.aws-us-west-2.turso.io';
const FALLBACK_TOKEN =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjU2MTMxODEsImlkIjoiMWFlNWY2MDEtMjZhNy00MTM4LWJlODctMjA3NGMwOTE0ZDQ5IiwicmlkIjoiNDc2NGRlNWYtNWFmZi00NjA3LWJiYjEtOWU3MmUwNzMxYTNlIn0.jMz9D-O9qin6Fvejep4X8X_YKGRqoT2FbEmJkplZv4MZGfiWf04zcr39wz2DVYdW1eeduYkqOnm5nlge6LeMAw';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL ?? FALLBACK_URL,
  authToken: process.env.TURSO_AUTH_TOKEN ?? FALLBACK_TOKEN,
});

const db = drizzle(client);

async function updateLvGoldenKadasBracelet() {
  const productId = 112;

  // Remove the specific pic the user referenced (and any matching variant)
  const explicitRemoveUrls = new Set([
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-24-at-23.14.07-1766600553763.jpeg?width=8000&height=8000&resize=contain',
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-24-at-23.14.07-1766600406742.jpeg?width=8000&height=8000&resize=contain',
  ]);

  const now = new Date().toISOString();

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (existing.length === 0) {
    throw new Error(`Product not found (id: ${productId})`);
  }

  const current = existing[0];
  const currentImages = Array.isArray(current.images) ? current.images : [];

  const nextImages = currentImages.filter((url) => {
    if (explicitRemoveUrls.has(url)) return false;
    // Also remove any URL that contains this filename prefix
    if (url.includes('WhatsApp-Image-2025-12-24-at-23.14.07')) return false;
    return true;
  });

  const finalImages = nextImages.length > 0 ? nextImages : currentImages;

  const updated = await db
    .update(products)
    .set({
      price: 299,
      images: finalImages,
      updatedAt: now,
    })
    .where(eq(products.id, productId))
    .returning();

  console.log('Product updated:', updated[0]);
}

updateLvGoldenKadasBracelet().catch((error) => {
  console.error('Error updating product:', error);
  process.exit(1);
});
