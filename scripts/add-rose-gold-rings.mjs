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
    name: 'Floral Filigree Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring featuring delicate floral filigree design with crystal embellishments along split band.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/123-1766952963042.jpeg'
    ),
  },
  {
    name: 'Sunburst Crystal Panel Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring with sunburst centerpiece and crystal-studded panel design.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/234-1766952963044.jpeg'
    ),
  },
  {
    name: 'Heart Flower Cluster Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring with heart-shaped flower cluster center and crystal accents.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/458-1766952963048.jpeg'
    ),
  },
  {
    name: 'Infinity Loop Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring featuring infinity loop design with crystal detailing.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/467-1766952963349.jpeg'
    ),
  },
  {
    name: 'Crown Tiara Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring with elegant crown tiara design adorned with double-row crystals.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3553-1766952963339.jpeg'
    ),
  },
  {
    name: 'Scalloped Wave Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring featuring scalloped wave pattern with alternating crystal stones.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/g-1766952963052.jpeg'
    ),
  },
  {
    name: 'Geometric Prong Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring with geometric prong-set center crystal and pavé side details.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-29-at-1.15.05-AM-1766952963588.jpeg'
    ),
  },
  {
    name: 'Wave Heart Infinity Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring with flowing wave and heart infinity motif accented with crystals.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-29-at-1.15.11-AM-1766952963330.jpeg'
    ),
  },
  {
    name: 'Clover Bow Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring featuring clover-inspired bow centerpiece with crystal detailing.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-29-at-1.15.12-AM-1766952963077.jpeg'
    ),
  },
  {
    name: 'Ribbon Knot Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold adjustable ring with ribbon knot design and triple-row crystal embellishments.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-202667-1766952963062.jpeg'
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
    }

    console.log(`\n✓ Successfully added ${rings.length} rose gold rings to the rings category`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addRings();
