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

const rings = [
  {
    name: 'Clover Ribbon Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a clover-inspired top and a sleek ribbon-style loop accent. Finished with subtle crystal sparkle.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Im44age-2025-12-29-at-12.53.47-AM-1766951772114.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Swirl Heart Link Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring featuring a swirl silhouette with heart-link details and a line of sparkling crystals.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-29-at-12.53.45-AM-1766951782725.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Interlocked Hearts Sparkle Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with interlocked heart motifs and crystal accents for a clean, elegant look.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766951782843.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Heart V-Curve Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a centered heart and a V-curve crystal line for a minimal, modern style.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-29-at-12.531.46-AM-1766951782840.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Chain Link Crystal Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a chain-link inspired centerpiece and crystal detailing for subtle sparkle.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-291-at-12.53.46-AM-1766951782818.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
];

async function addRings() {
  const now = new Date().toISOString();

  try {
    for (const ring of rings) {
      await db.execute({
        sql: `INSERT INTO products (name, description, price, original_price, category, images, colors, in_stock, featured, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          ring.name,
          ring.description,
          60,
          60,
          'rings',
          JSON.stringify([ring.image]),
          JSON.stringify(['Silver']),
          1,
          0,
          now,
          now,
        ],
      });
      console.log(`✓ Added ${ring.name}`);
    }

    console.log(`\n✓ Successfully added ${rings.length} rings to the rings category`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addRings();
