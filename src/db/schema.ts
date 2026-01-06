import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

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

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey().notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email'),
  customerPhone: text('customer_phone').notNull(),
  address: text('address').notNull(),
  items: text('items', { mode: 'json' }).notNull(),
  subtotal: integer('subtotal').notNull(),
  tax: integer('tax').notNull(),
  shipping: integer('shipping').notNull(),
  total: integer('total').notNull(),
  status: text('status').notNull().default('pending'),
  paymentStatus: text('payment_status').notNull().default('pending'),
  stripeSessionId: text('stripe_session_id'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const user = sqliteTable("user", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified").notNull(),
  image: text("image"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  phoneNumber: text("phoneNumber"),
}, (table) => [
  uniqueIndex("user_email_unique").on(table.email),
]);

export const session = sqliteTable("session", {
  id: text("id").primaryKey().notNull(),
  expiresAt: integer("expires_at").notNull(),
  token: text("token").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (table) => [
  uniqueIndex("session_token_unique").on(table.token),
]);

export const account = sqliteTable("account", {
  id: text("id").primaryKey().notNull(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at"),
  refreshTokenExpiresAt: integer("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey().notNull(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at"),
  updatedAt: integer("updated_at"),
});
