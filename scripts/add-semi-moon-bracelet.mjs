import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

const db = drizzle(client);

async function addProduct() {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(products).values({
      name: 'Semi-moon Golden Kadas Bracelet',
      description: 'Elegant semi-moon design golden kadas bracelet with intricate detailing',
      price: 299,
      originalPrice: 450,
      category: 'bracelets',
      images: [
        'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-24-at-23.14.07-1-1766601738292.jpeg?width=8000&height=8000&resize=contain'
      ],
      colors: ['Gold'],
      sizes: [],
      inStock: true,
      featured: false,
      createdAt: now,
      updatedAt: now,
    }).returning();

    console.log(`Added: ${result[0].name} (ID: ${result[0].id})`);
    process.exit(0);
  } catch (error) {
    console.error('Error adding product:', error);
    process.exit(1);
  }
}

addProduct();
