import { db } from '@/db';
import { products } from '@/db/schema';

async function main() {
    const newProduct = {
        name: 'Elegant Gift box combo - 5',
        description: 'Contains 6 Rings, 3 Earring, 1 2nd stud, 2 bracelets',
        price: 899,
        originalPrice: null,
        category: 'combo',
        images: [
            'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-01-at-9.36.58-PM-1767285290342.jpeg'
        ],
        colors: ['Mixed Gold & Rose Gold'],
        sizes: ['Standard'],
        inStock: true,
        featured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await db.insert(products).values(newProduct);
    
    console.log('✅ Added Elegant Gift box combo - 5 to combo category');
    process.exit(0);
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
});
