
import { db } from '../src/db';
import { products } from '../src/db/schema';

async function addProduct() {
  try {
    await db.insert(products).values({
      name: 'Single Stone Fred Necklace',
      description: 'Elegant Single Stone Fred Necklace with purple stone.',
      price: 1349,
      originalPrice: 1499,
      category: 'necklaces',
      images: [
        "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-18-at-15.44.04-1-1766260812769.jpeg?width=8000&height=8000&resize=contain",
        "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2025-12-18-at-15.44.04-1766260812668.jpeg?width=8000&height=8000&resize=contain"
      ],
      colors: ["Purple"],
      sizes: [],
      inStock: true,
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Product added successfully');
  } catch (error) {
    console.error('Error adding product:', error);
  } finally {
    process.exit(0);
  }
}

addProduct();
