import { db } from '../index';
import { products } from '../schema';

async function main() {
    const newProduct = {
        name: 'Heart Motif Gold Necklace Set',
        description: 'A beautiful gold-toned necklace set featuring elegant heart motif drops, perfect for traditional and modern occasions. Comes with matching heart-motif earrings.',
        price: 759,
        originalPrice: 999,
        category: 'necklaces',
        images: [
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-resized-1767900846916.jpeg?width=8000&height=8000&resize=contain'
        ],
        colors: ['Gold'],
        sizes: ['Standard'],
        inStock: 10,
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct);
    
    console.log('✅ Heart Motif Gold Necklace Set added successfully');
}

main().catch((error) => {
    console.error('❌ Failed to add product:', error);
    process.exit(1);
});
