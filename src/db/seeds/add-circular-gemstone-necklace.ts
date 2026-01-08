import { db } from '../index';
import { products } from '../schema';

async function main() {
    const newProduct = {
        name: 'Circular Gemstone Filigree Necklace Set',
        description: 'This exquisite gold-plated necklace set features intricate circular filigree work accented with vibrant gemstones. The set includes a beautifully crafted necklace and matching drop earrings, offering a timeless and elegant look for special occasions.',
        price: 699,
        originalPrice: 999,
        category: 'necklaces',
        images: [
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-resized-1767902475257.jpeg?width=8000&height=8000&resize=contain',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-09-at-12.30.22-2-resized-1767902475258.jpeg?width=8000&height=8000&resize=contain',
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-09-at-12.30.22-AM-resized-1767902475826.jpeg?width=8000&height=8000&resize=contain'
        ],
        colors: ['Green', 'Purple'],
        sizes: ['Standard'],
        inStock: 10,
        featured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct);
    
    console.log('✅ Circular Gemstone Filigree Necklace Set added successfully');
}

main().catch((error) => {
    console.error('❌ Failed to add product:', error);
    process.exit(1);
});
