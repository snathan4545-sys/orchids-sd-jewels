import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';
import { eq } from 'drizzle-orm';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

// Get current product
const [product] = await db.select().from(products).where(eq(products.name, 'Devi Kasu Necklace'));

if (!product) {
  console.error('Product not found');
  process.exit(1);
}

// Add new image to existing images
const updatedImages = [
  ...product.images,
  'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-11.14.30-PM-1766857563145.jpeg?width=8000&height=8000&resize=contain'
];

// Update product
await db.update(products)
  .set({ 
    images: updatedImages,
    updatedAt: new Date().toISOString()
  })
  .where(eq(products.id, product.id));

console.log('✓ Added new image to Devi Kasu Necklace');
process.exit(0);
