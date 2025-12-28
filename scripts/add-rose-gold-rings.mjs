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
    name: 'Wave Heart Crown Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with a wave-style crown design adorned with heart motifs and sparkling crystal accents.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-1766952799331.jpeg'
    ),
  },
  {
    name: 'Leaf Cluster Flower Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring featuring a clustered flower centerpiece with intricate leaf detailing and crystal embellishments.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/5-1766952799442.jpeg'
    ),
  },
  {
    name: 'Geometric Crystal Panel Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with a geometric rectangular panel filled with sparkling crystals for a modern, structured look.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/12-1766952799418.jpeg'
    ),
  },
  {
    name: 'Interlaced Curve Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with interlaced curved bands and a row of sparkling crystals for an elegant, flowing design.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/22-1766952799428.jpeg'
    ),
  },
  {
    name: 'Flower Cluster Halo Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with a delicate flower cluster centerpiece surrounded by a halo of crystals.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/23-1766952799416.jpeg'
    ),
  },
  {
    name: 'Braided Wave Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring featuring a braided wave pattern with sparkling crystal embellishments.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/33-1766952799453.jpeg'
    ),
  },
  {
    name: 'Cluster Wave Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with a wave-inspired design featuring a cluster of crystals for added sparkle.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/44-1766952799417.jpeg'
    ),
  },
  {
    name: 'Heart Arrow Crystal Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with a heart-shaped crystal centerpiece and arrow-inspired detailing.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/76-1766952799619.jpeg'
    ),
  },
  {
    name: 'Sparkle Branch Leaf Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with delicate branch and leaf motifs adorned with crystal sparkle.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/78-1766952799433.jpeg'
    ),
  },
  {
    name: 'Crossover Crystal Band Adjustable Ring (Rose Gold)',
    description:
      'Rose gold-toned adjustable ring with a crossover band design featuring two rows of sparkling crystals.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/90-1766952799425.jpeg'
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

    console.log(`\n✓ Successfully added ${rings.length} rose gold adjustable rings to the rings category`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

addRings();
