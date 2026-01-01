import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function deleteComboProducts() {
    try {
        const deleted = await db.delete(products).where(eq(products.category, 'combo'));
        console.log('✅ Successfully deleted all combo products');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting combo products:', error);
        process.exit(1);
    }
}

deleteComboProducts();
