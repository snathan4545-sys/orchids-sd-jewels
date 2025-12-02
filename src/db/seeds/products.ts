import { db } from '@/db';
import { products } from '@/db/schema';

async function main() {
    const newProducts = [
        // Impon Category Products (3 products)
        {
            name: '22K Gold Impon Bangle Set',
            description: 'Exquisite 22K gold-plated impon bangle set featuring traditional meenakari work and intricate patterns. Perfect for weddings, festivals, and special occasions. Lightweight and comfortable for all-day wear.',
            price: 3499,
            originalPrice: 4499,
            category: 'impon',
            images: [
                'https://images.unsplash.com/photo-1611652022419-a9419f74343d-jewelry',
                '/images/products/22k-gold-impon-bangle-set.jpg',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908-jewelry'
            ],
            colors: ['22K Gold', 'Antique Gold', 'Rose Gold'],
            sizes: ['2.4', '2.6', '2.8'],
            inStock: true,
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Traditional Impon Kada',
            description: 'Stunning traditional kada with 22K gold plating and ethnic designs inspired by royal heritage. Features durable construction with premium finish. Ideal for traditional wear and cultural celebrations.',
            price: 2799,
            originalPrice: null,
            category: 'impon',
            images: [
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f-jewelry',
                '/images/products/traditional-impon-kada.jpg'
            ],
            colors: ['22K Gold', 'Antique Gold'],
            sizes: ['2.4', '2.6', '2.8', 'Free Size'],
            inStock: true,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Bridal Impon Jewelry Set',
            description: 'Complete bridal jewelry set with gold-plated impon bangles, matching earrings, and necklace. Adorned with premium stones and pearls. Crafted for grand wedding celebrations and ceremonial occasions.',
            price: 4999,
            originalPrice: 6499,
            category: 'impon',
            images: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338-jewelry',
                '/images/products/bridal-impon-jewelry-set.jpg',
                'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed-jewelry'
            ],
            colors: ['22K Gold', 'Rose Gold'],
            sizes: ['2.4', '2.6', 'Free Size'],
            inStock: true,
            featured: true,
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
        
        // Necklaces (2 products)
        {
            name: 'Ruby Stone Necklace Set',
            description: 'Beautiful necklace set featuring ruby-colored imitation stones with gold-plated finish. Includes matching earrings. Perfect for weddings and festive celebrations with traditional and contemporary attire.',
            price: 1899,
            originalPrice: 2499,
            category: 'necklaces',
            images: [
                'https://images.unsplash.com/photo-1589674781759-c791c6a4f32a-jewelry',
                '/images/products/ruby-stone-necklace-set.jpg'
            ],
            colors: ['Gold', 'Antique Gold'],
            sizes: ['16 inches', '18 inches', 'Adjustable'],
            inStock: true,
            featured: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            name: 'Antique Temple Necklace',
            description: 'Traditional temple jewelry necklace with antique gold finish and Lakshmi pendant design. Crafted with intricate detailing and oxidized silver accents. Ideal for religious ceremonies and cultural functions.',
            price: 2299,
            originalPrice: null,
            category: 'necklaces',
            images: [
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9-jewelry',
                '/images/products/antique-temple-necklace.jpg',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a-jewelry'
            ],
            colors: ['Antique Gold', 'Silver'],
            sizes: ['18 inches', 'Adjustable'],
            inStock: true,
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
    
    console.log('✅ Products seeder completed successfully - Added 8 new imitation jewelry products');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});