import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { products } from '../src/db/schema.js';

const client = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(client);

const now = new Date().toISOString();

const ringsToAdd = [
  {
    name: "Elegant Filigree Adjustable Ring (Gold)",
    description: "Beautiful gold-toned adjustable ring with intricate filigree design and sparkling crystal accents.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-1767026868545.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Wave Crystal Filigree Adjustable Ring (Gold)",
    description: "Gold-toned adjustable ring featuring elegant wave-like filigree pattern with crystal embellishments.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-1767026868137.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Classic Floral Filigree Adjustable Ring (Gold)",
    description: "Adjustable gold ring with classic floral-inspired filigree work and delicate crystal details.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/5-1767026868578.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Crystal Studded Band Adjustable Ring (Gold)",
    description: "Gold adjustable ring with layered band design featuring crystal-studded center accent.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/6-1767026868176.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Ornate Scroll Filigree Adjustable Ring (Gold)",
    description: "Adjustable gold ring with ornate scroll pattern filigree design and sparkling crystal center.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/8-1767026868137.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Delicate Curve Filigree Adjustable Ring (Gold)",
    description: "Gold adjustable ring with delicate curved filigree pattern and crystal wave accent.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/9-1767026868143.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Leaf Cutout Filigree Adjustable Ring (Gold)",
    description: "Adjustable gold ring featuring leaf-inspired cutout filigree design with crystal embellishment.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/13-1767026868553.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Layered Crystal Band Adjustable Ring (Gold)",
    description: "Gold adjustable ring with elegant layered band design and dual crystal-studded rows.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/22-1767026868143.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Infinity Scroll Adjustable Ring (Gold)",
    description: "Adjustable gold ring with infinity-inspired scroll design and sparkling crystal centerpiece.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/23-1767026868213.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    name: "Heart Crystal V-Band Adjustable Ring (Gold)",
    description: "Gold adjustable ring with V-shaped band design featuring heart centerpiece and crystal accents.",
    price: 62,
    originalPrice: 62,
    category: "rings",
    images: [
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/33-1767026868540.jpeg?width=1000&height=1000&resize=contain"
    ],
    createdAt: now,
    updatedAt: now
  }
];

async function addProducts() {
  try {
    for (const ring of ringsToAdd) {
      await db.insert(products).values(ring);
      console.log(`✓ Added ${ring.name}`);
    }
    console.log(`\n✅ Successfully added ${ringsToAdd.length} rings to the rings category`);
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    client.close();
  }
}

addProducts();
