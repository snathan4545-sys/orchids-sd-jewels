import { db } from '@/db';
import { products } from '@/db/schema';

async function main() {
    const newProducts = [
        // Combo Category Products - Gift Box Sets
        {
            name: 'Elegant Combo Gift Box',
            description: 'Products Listed: 6 rings, 4 earrings, 2 bracelets',
            price: 899,
            originalPrice: null,
            category: 'combo',
            images: [
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-1767283857904.jpeg',
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-1767283858340.jpeg',
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-1767283857930.jpeg'
            ],
            colors: ['Mixed Gold & Silver'],
            sizes: ['Standard'],
            inStock: true,
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Premium Combo Gift Box',
            description: 'Products Listed: 6 rings, 4 earrings, 2 bracelets',
            price: 899,
            originalPrice: null,
            category: 'combo',
            images: [
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/5-1767283857978.jpeg',
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/WhatsApp-Image-2026-01-01-at-9.36.58-PM-1767283857936.jpeg',
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-1767283857904.jpeg'
            ],
            colors: ['Mixed Gold & Rose Gold'],
            sizes: ['Standard'],
            inStock: true,
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Deluxe Combo Gift Box',
            description: 'Products Listed: 6 rings, 4 earrings, 2 bracelets',
            price: 899,
            originalPrice: null,
            category: 'combo',
            images: [
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-1767283857930.jpeg',
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-1767283858340.jpeg',
                'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/5-1767283857978.jpeg'
            ],
            colors: ['Mixed Gold Tones'],
            sizes: ['Standard'],
            inStock: true,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        
        // Guarantee-Chains Category Products (2 products)
        {
            name: 'Lifetime Guarantee Gold Chain',
            description: 'Premium quality gold-plated chain with lifetime guarantee against tarnishing. Made with superior brass base and thick gold coating. Perfect for daily wear with traditional and modern outfits.',
            price: 2999,
            originalPrice: 3999,
            category: 'guarantee-chains',
            images: [
                'https://images.unsplash.com/photo-1599643477877-530eb83abc8e-jewelry',
                '/images/products/lifetime-guarantee-gold-chain.jpg'
            ],
            colors: ['22K Gold', 'Rose Gold'],
            sizes: ['18 inches', '20 inches', '22 inches', '24 inches'],
            inStock: true,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Designer Guarantee Chain',
            description: 'Elegant designer chain with authentic gold plating and lifetime durability guarantee. Features intricate rope design pattern. Long-lasting quality ensures years of wear without color fading or damage.',
            price: 3499,
            originalPrice: null,
            category: 'guarantee-chains',
            images: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a-jewelry',
                '/images/products/designer-guarantee-chain.jpg',
                'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0-jewelry'
            ],
            colors: ['22K Gold', 'Antique Gold'],
            sizes: ['20 inches', '22 inches', '24 inches'],
            inStock: false,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        
        // Earrings (1 product)
        {
            name: 'Golden Jhumka Earrings',
            description: 'Classic golden jhumka earrings with traditional bell shape and pearl drops. Features intricate filigree work and comfortable hook closure. Perfect for ethnic wear and festive occasions.',
            price: 699,
            originalPrice: 899,
            category: 'earrings',
            images: [
                'https://images.unsplash.com/photo-1535556116002-6281ff3e9f8e-jewelry',
                '/images/products/golden-jhumka-earrings.jpg'
            ],
            colors: ['Gold', 'Antique Gold'],
            sizes: ['Medium', 'Large'],
            inStock: true,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(products).values(newProducts);
    
    console.log('✅ Products seeder completed successfully - Added 6 new jewelry products');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});