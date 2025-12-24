import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

async function main() {
  try {
    const now = new Date().toISOString();
    
    const kadasBracelets = [
      {
        name: 'Kadas Bracelet 101',
        images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-24-at-23.14.13-1-1766601460788.jpeg?width=8000&height=8000&resize=contain']
      },
      {
        name: 'Kadas Bracelet 102',
        images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-24-at-23.14.13-2-1766601460700.jpeg?width=8000&height=8000&resize=contain']
      },
      {
        name: 'Kadas Bracelet 103',
        images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-24-at-23.14.14-1-1766601460701.jpeg?width=8000&height=8000&resize=contain']
      },
      {
        name: 'Kadas Bracelet 104',
        images: ['https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-24-at-23.14.14-2-1766601460798.jpeg?width=8000&height=8000&resize=contain']
      }
    ];

    for (const bracelet of kadasBracelets) {
      const result = await db.insert(products).values({
        name: bracelet.name,
        description: `${bracelet.name} - Elegant gold-toned Kadas bracelet with premium finish`,
        price: 249,
        originalPrice: 349,
        category: 'bracelets',
        images: bracelet.images,
        colors: ['Gold'],
        sizes: [],
        inStock: true,
        featured: false,
        createdAt: now,
        updatedAt: now,
      }).returning();

      console.log(`Added: ${result[0].name} (ID: ${result[0].id})`);
    }

    console.log('\nAll 4 Kadas Bracelets added successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
