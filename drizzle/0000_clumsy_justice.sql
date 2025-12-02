CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`original_price` integer,
	`category` text NOT NULL,
	`images` text NOT NULL,
	`colors` text,
	`sizes` text,
	`in_stock` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
