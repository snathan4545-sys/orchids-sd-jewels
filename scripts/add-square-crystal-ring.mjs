import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const enhance = (url) => {
  const base = url.split('?')[0];
  return `${base}?width=1200&height=1200&resize=contain&quality=90`;
};

const ring = {
  name: 'Square Crystal Filigree Adjustable Ring (Rose Gold)',
  description:
    'Rose gold adjustable ring with square filigree centerpiece featuring a crystal stone and pavé crystal band.',
  image: enhance(
    'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/77-1766953533142.jpeg'
  ),
};

async function addRing() {
  const now = new Date().toISOString();

  try {
    await db.execute({
      sql: `INSERT INTO products (name, description, price, original_price, category, images, colors, in_stock, featured, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        ring.name,
        ring.description,
        62,
        62,
        'rings',
        JSON.stringify([ring.image]),
        JSON.stringify(['Rose Gold']),
        1,
        0,
        now,
        now,
      ],
    });
    console.log(`✓ Added ${ring.name}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addRing();
