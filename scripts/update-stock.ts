import { db } from '@/db';
import { products } from '@/db/schema';

async function updateStock() {
  try {
    // Update all products to have in_stock = 3
    const result = await db.run(`UPDATE products SET in_stock = 3`);
    console.log('✓ Updated all products to have in_stock = 3');
    console.log('Rows affected:', result);
  } catch (error) {
    console.error('Error updating stock:', error);
    process.exit(1);
  }
}

updateStock();
