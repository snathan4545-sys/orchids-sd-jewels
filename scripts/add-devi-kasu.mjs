import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

await db.insert(products).values({
  name: 'Devi Kasu Necklace',
  description: 'Traditional Devi Kasu necklace featuring intricate mango-shaped motifs with deity embellishments in gold tone',
  price: 999,
  originalPrice: 999,
  category: 'necklaces',
  images: [
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.58-PM-1766857098021.jpeg?width=8000&height=8000&resize=contain',
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.59-PM-1766857098005.jpeg?width=8000&height=8000&resize=contain'
  ],
  colors: ['Gold'],
  stockQuantity: 10,
  featured: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

console.log('✓ Added Devi Kasu Necklace to database');
process.exit(0);
