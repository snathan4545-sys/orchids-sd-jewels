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
        'Vendaka Necklace',
        'Exquisite gold-toned necklace featuring a stunning star-flower design with intricate detailing. Perfect for weddings, festivals, and special occasions. Complete with matching earrings.',
        599,
        699,
        'necklaces',
        JSON.stringify([
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.17.01-PM-1766860457421.jpeg?width=8000&height=8000&resize=contain',
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.17.02-PM-1766860457437.jpeg?width=8000&height=8000&resize=contain'
        ]),
        JSON.stringify(['Gold']),
        1,
        1,
        now,
        now
      ],
    });

    console.log('✓ Added Vendaka Necklace to necklaces category');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addProduct();
