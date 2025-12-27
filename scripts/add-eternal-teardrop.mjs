import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

await db.insert(products).values({
  name: 'Eternal Teardrop Necklace',
  description: 'Elegant gold-toned necklace featuring a stunning teardrop design with intricate circular and infinity patterns adorned with stones.',
  price: 759,
  originalPrice: 569,
  category: 'necklaces',
  images: [
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.55-PM-1-1766855159317.jpeg?width=8000&height=8000&resize=contain',
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.55-PM-1766855159420.jpeg?width=8000&height=8000&resize=contain'
  ],
  colors: ['Gold'],
  inStock: true,
  featured: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

console.log('✓ Added Eternal Teardrop Necklace to database');
process.exit(0);
