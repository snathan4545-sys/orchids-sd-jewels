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
        'Lakshmi Coral Necklace',
        'Exquisite gold-toned Lakshmi necklace featuring intricate traditional design with coral accents. Showcases detailed craftsmanship with Goddess Lakshmi motifs. Perfect for weddings and festive occasions. Comes with matching earrings.',
        799,
        899,
        'necklaces',
        JSON.stringify([
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.17.03-PM-1-1766860988281.jpeg?width=8000&height=8000&resize=contain',
          'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-27-at-10.17.03-PM-1766860988206.jpeg?width=8000&height=8000&resize=contain'
        ]),
        JSON.stringify(['Gold']),
        1,
        1,
        now,
        now
      ],
    });

    console.log('✓ Added Lakshmi Coral Necklace to necklaces category');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addProduct();
