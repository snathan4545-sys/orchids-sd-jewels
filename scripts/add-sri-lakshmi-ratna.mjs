import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

await db.insert(products).values({
  name: 'Sri Lakshmi Ratna Haaram',
  description: 'Exquisite traditional gold-toned necklace featuring Goddess Lakshmi centerpiece with ruby and emerald stones, adorned with intricate peacock and floral motifs.',
  price: 849,
  discountedPrice: 649,
  category: 'necklaces',
  images: [
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.57-PM-1-1766856551018.jpeg?width=8000&height=8000&resize=contain',
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.57-PM-1766856550924.jpeg?width=8000&height=8000&resize=contain',
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.58-PM-1766856551025.jpeg?width=8000&height=8000&resize=contain'
  ],
  color: null,
  stockQuantity: 10,
  featured: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

console.log('✓ Added Sri Lakshmi Ratna Haaram to database');
process.exit(0);
