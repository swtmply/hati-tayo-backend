CREATE TABLE `user_qr_codes` (
	`user_id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
