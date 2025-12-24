import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import { products } from "../src/db/schema.ts";

dotenv.config();

async function main() {
  try {
    const client = createClient({
      url: process.env.TURSO_CONNECTION_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const db = drizzle(client);

    const now = new Date().toISOString();
    const result = await db.insert(products).values({
      name: 'Nila Halfmoon Design Necklace',
      description: 'Nila Halfmoon Design Necklace',
      price: 499,
      originalPrice: 659,
      category: 'necklaces',
      images: [
        'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-18-at-15.43.56-2-1766596070097.jpeg?width=8000&height=8000&resize=contain',
        'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-18-at-15.43.56-1-1766596070107.jpeg?width=8000&height=8000&resize=contain',
      ],
      colors: [],
      sizes: [],
      inStock: true,
      featured: false,
      createdAt: now,
      updatedAt: now,
    }).returning();

    console.log("Product added:", result[0]);
    process.exit(0);
  } catch (error) {
    console.error("Error adding product:", error);
    process.exit(1);
  }
}

main();
