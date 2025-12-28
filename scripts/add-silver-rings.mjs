import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const rings = [
  {
    name: 'Floral Heart Adjustable Ring (Silver)',
    description: 'Beautiful silver-toned adjustable ring featuring an elegant floral design with a heart motif and sparkling crystal embellishments. Perfect for everyday wear.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766950751161.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Heart Swirl Adjustable Ring (Silver)',
    description: 'Elegant silver-toned adjustable ring with a delicate heart and swirl design, adorned with sparkling crystals. Comfortable and stylish.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-1766950751308.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Circle Pearl Adjustable Ring (Silver)',
    description: 'Chic silver-toned adjustable ring featuring a circular design with pearl center and crystal accents. Modern and versatile.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/11WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766950751252.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Double Band Beaded Adjustable Ring (Silver)',
    description: 'Stylish silver-toned adjustable ring with double band design and beaded detailing. Contemporary and eye-catching.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/12WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766950751294.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Butterfly Heart Adjustable Ring (Silver)',
    description: 'Charming silver-toned adjustable ring with butterfly and heart design, featuring crystal embellishments. Playful and elegant.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/24-1766950751168.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Double Heart Wave Adjustable Ring (Silver)',
    description: 'Romantic silver-toned adjustable ring with double heart and wave pattern, adorned with sparkling crystals. Perfect gift.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/33-1766950751306.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Interlocking Circles Adjustable Ring (Silver)',
    description: 'Modern silver-toned adjustable ring featuring interlocking circle design with crystal accents. Sophisticated and timeless.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/53-1766950751175.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Clover Heart Adjustable Ring (Silver)',
    description: 'Elegant silver-toned adjustable ring with clover and heart motifs, embellished with sparkling crystals. Lucky charm design.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/65-1766950751254.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Dual Hearts Adjustable Ring (Silver)',
    description: 'Delicate silver-toned adjustable ring featuring dual heart design with crystal accents. Sweet and romantic.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/67-1766950751208.jpeg?width=8000&height=8000&resize=contain'
  },
  {
    name: 'Triple Band Crystal Adjustable Ring (Silver)',
    description: 'Stunning silver-toned adjustable ring with triple band design, featuring rows of sparkling crystals. Elegant statement piece.',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/111WhatsApp-Image-2025-12-29-at-12.53.46-AM-1766950751215.jpeg?width=8000&height=8000&resize=contain'
  }
];

async function addRings() {
  try {
    const now = new Date().toISOString();
    
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
          now
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
