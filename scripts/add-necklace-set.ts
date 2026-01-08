
import { db } from '../src/db';
import { products } from '../src/db/schema';

async function main() {
    const newProduct = {
        name: 'Graceful Fan-Shaped Gemstone Necklace Set',
        description: 'An elegant fan-shaped gemstone necklace set featuring vibrant stones and matching earrings. Perfect for traditional and festive occasions.',
        price: 549,
        originalPrice: null,
        category: 'necklaces',
        images: [
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-09-at-12.30.21-AM-resized-1767899017540.jpeg?width=8000&height=8000&resize=contain',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-09-at-12.30.23-AM-resized-1767899017540.jpeg?width=8000&height=8000&resize=contain'
        ],
        colors: ['Green', 'Red'],
        sizes: ['Standard'],
        inStock: 1,
        featured: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct);
    
    console.log('✅ Added Graceful Fan-Shaped Gemstone Necklace Set');
}

main().catch((error) => {
    console.error('❌ Failed to add product:', error);
    process.exit(1);
});
