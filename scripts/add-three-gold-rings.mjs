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
    name: "Heart Lock Crystal Adjustable Ring (Gold)",
    description: "Elegant gold adjustable ring featuring a heart-shaped lock design with sparkling crystal accents.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1223-1767028347570.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Swirl Crystal Band Adjustable Ring (Gold)",
    description: "Gold adjustable ring with elegant swirl pattern and horizontal crystal accent band.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/6666-1767028469435.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Double Heart Crystal Adjustable Ring (Gold)",
    description: "Gold adjustable ring with double heart design and crystal-studded decorative elements.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/345-1767028506341.jpeg?width=1000&height=1000&resize=contain"
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
