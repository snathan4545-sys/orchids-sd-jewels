import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  originalPrice: integer('original_price'),
  category: text('category').notNull(),
  images: text('images', { mode: 'json' }).notNull(),
  colors: text('colors', { mode: 'json' }),
  sizes: text('sizes', { mode: 'json' }),
  inStock: integer('in_stock').notNull().default(3),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});