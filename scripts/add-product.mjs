import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';

async function addProduct() {
  try {
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const db = drizzle(client);

    const now = new Date().toISOString();
    const result = await db.insert(products).values({
      name: 'Noor-E-Kundan Necklace',
      description: 'Noor-E-Kundan Necklace',
      price: 449,
      originalPrice: 599,
      category: 'necklaces',
      images: [
        'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-18-at-15.43.54-1-1766597161375.jpeg?width=8000&height=8000&resize=contain',
        'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-18-at-15.43.54-1766597161328.jpeg?width=8000&height=8000&resize=contain',
      ],
      colors: [],
      sizes: [],
      inStock: true,
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
