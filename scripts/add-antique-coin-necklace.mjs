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
        'Antique Coin Drop Necklace',
        'Elegant antique coin drop necklace featuring intricate gold detailing with a stunning coin pendant. Perfect for traditional occasions.',
        899,
        999,
        'necklace',
        JSON.stringify([
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.16.59-PM-1766858541864.jpeg?width=8000&height=8000&resize=contain',
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.17.00-PM-1766858541841.jpeg?width=8000&height=8000&resize=contain'
        ]),
        JSON.stringify(['Gold']),
        1,
        1,
        now,
        now
      ],
    });

    console.log('✓ Added Antique Coin Drop Necklace to necklace category');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addProduct();
