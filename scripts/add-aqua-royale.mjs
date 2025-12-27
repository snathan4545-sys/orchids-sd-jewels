import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

await db.insert(products).values({
  name: 'Aqua Royale Necklace Set',
  description: 'Exquisite gold-toned necklace set with aqua blue teardrop stones, featuring intricate crystal work and matching earrings.',
  price: 859,
  discountedPrice: 769,
  category: 'necklaces',
  images: JSON.stringify([
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.55-PM-1766856168453.jpeg?width=8000&height=8000&resize=contain',
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.56-PM-1766856168723.jpeg?width=8000&height=8000&resize=contain',
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.47.00-PM-1766856168540.jpeg?width=8000&height=8000&resize=contain'
  ]),
  color: 'Blue',
  stockQuantity: 10,
  featured: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

console.log('✓ Added Aqua Royale Necklace Set to database');
process.exit(0);
