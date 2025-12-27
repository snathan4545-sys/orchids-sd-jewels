import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function addProduct() {
  try {
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `INSERT INTO products (name, description, price, original_price, category, images, colors, in_stock, featured, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'Green Vine Pearl Chain',
        'Elegant green vine pearl chain necklace with intricate beadwork and a decorative pearl drop pendant. Features antique gold-toned vine design with green stone embellishments.',
        499,
        599,
        'necklace',
        JSON.stringify([
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.58-PM-1766858158253.jpeg?width=8000&height=8000&resize=contain',
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.17.00-PM-1766858158349.jpeg?width=8000&height=8000&resize=contain'
        ]),
        JSON.stringify(['Green']),
        1,
        0,
        now,
        now
      ],
    });

    console.log('✓ Added Green Vine Pearl Chain to necklace category');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addProduct();
