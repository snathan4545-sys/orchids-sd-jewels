import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.ts';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

const now = new Date().toISOString();

const ringsToAdd = [
  {
    name: "Double Loop Crystal Adjustable Ring (Gold)",
    description: "Elegant gold adjustable ring with double infinity loop design and sparkling crystal accents.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/43-1767026931771.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Floral Cutout Crystal Adjustable Ring (Gold)",
    description: "Gold adjustable ring featuring intricate floral cutout design with crystal embellishments.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/45-1767026931779.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Greek Key Pattern Adjustable Ring (Gold)",
    description: "Wide gold band with geometric Greek key pattern and crystal accent line.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/55-1767026931869.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Triple Layer Statement Adjustable Ring (Gold)",
    description: "Bold gold adjustable ring with triple layer design featuring crystal cluster centerpiece.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/66-1767026931954.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Multi-Row Crystal Band Adjustable Ring (Gold)",
    description: "Gold adjustable ring with elegant multi-row band design and crystal-studded center row.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/78-1767026931984.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Openwork Floral Adjustable Ring (Gold)",
    description: "Delicate gold adjustable ring with openwork floral cutout pattern and crystal accents.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/88-1767026931799.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Lattice Crystal Adjustable Ring (Gold)",
    description: "Gold adjustable ring with geometric lattice pattern and diagonal crystal accent line.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/99-1767026931780.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Chevron Stripe Adjustable Ring (Gold)",
    description: "Gold adjustable ring with stylish chevron stripe pattern and contrasting accents.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/664-1767026931775.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Leaf Wing Crystal Adjustable Ring (Gold)",
    description: "Gold adjustable ring with flowing leaf wing design and sparkling crystal embellishments.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-33-29-at-10.00.12-PM-1767026931939.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  }
];

async function addRings() {
  try {
    for (const ring of ringsToAdd) {
      await db.insert(products).values(ring);
      console.log(`✓ Added ${ring.name}`);
    }
    console.log('\n✅ All rings added successfully!');
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    client.close();
  }
}

addRings();
