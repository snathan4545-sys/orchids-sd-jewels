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
    name: 'Twin Star Trail Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a sleek twin-star design and sparkling crystal accents. Lightweight and comfortable for daily wear.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/122-1766951211710.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Leaf Curve Adjustable Ring (Silver)',
    description:
      'Elegant silver-toned adjustable ring featuring a leaf-inspired cutout with a curved row of sparkling crystals. Minimal and modern.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/122WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766951211744.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Beaded Heart Crest Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a heart crest motif, beaded detailing, and crystal accents for a delicate shine.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/145WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766951211648.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Crystal Heart Spark Adjustable Ring (Silver)',
    description:
      'Charming silver-toned adjustable ring with a crystal-studded top detail and twin heart accents. A cute everyday style.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/233-1766951211731.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Heart Halo Bow Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring featuring a heart-shaped crystal halo with a petite bow-style detail for a sweet, polished look.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/255-1766951211760.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Oval Twist Accent Adjustable Ring (Silver)',
    description:
      'Modern silver-toned adjustable ring with an oval twist centerpiece and shimmering crystal accents. Sleek and versatile.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/644-1766951211743.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Sparkle Knot Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a knot-inspired centerpiece and crystal detailing for subtle sparkle.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1324WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766951211767.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Double Heart Swirl Adjustable Ring (Silver)',
    description:
      'Elegant silver-toned adjustable ring with a flowing double-heart swirl and crystal accents. Romantic and lightweight.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1344WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766951211769.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Circular Sparkle Drop Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a circular crystal setting and sleek openwork details. Clean, modern finish.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/65554-1766951211759.jpeg?width=8000&height=8000&resize=contain'
    ),
  },
  {
    name: 'Clover Charm Adjustable Ring (Silver)',
    description:
      'Silver-toned adjustable ring with a clover-inspired top and crystal accents. Simple, elegant, and easy to style.',
    image: enhance(
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Im44age-2025-12-29-at-12.53.47-AM-1766951211763.jpeg?width=8000&height=8000&resize=contain'
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
