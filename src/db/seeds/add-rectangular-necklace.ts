import { db } from '../index';
import { products } from '../schema';

async function main() {
    const newProduct = {
        name: 'Rectangular Gemstone Gold Necklace Set',
        description: 'An elegant gold-plated necklace set featuring sophisticated rectangular gemstones in vibrant colors. This set includes a necklace with beautifully set stones and matching rectangular drop earrings, perfect for adding a touch of color to any outfit.',
        price: 549,
        originalPrice: 799,
        category: 'necklaces',
        images: [
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-resized-1767901247369.jpeg?width=8000&height=8000&resize=contain',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/5-resized-1767901276187.jpeg?width=8000&height=8000&resize=contain',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/6-resized-1767901327137.jpeg?width=8000&height=8000&resize=contain',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/7-resized-1767901327080.jpeg?width=8000&height=8000&resize=contain',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/8-resized-1767901327067.jpeg?width=8000&height=8000&resize=contain'
        ],
        colors: ['White', 'Mint green', 'Green', 'Pink'],
        sizes: ['Standard'],
        inStock: 10,
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct);
    
    console.log('✅ Rectangular Gemstone Gold Necklace Set added successfully');
}

main().catch((error) => {
    console.error('❌ Failed to add product:', error);
    process.exit(1);
});
