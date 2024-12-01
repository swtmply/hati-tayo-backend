CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` text NOT NULL,
	`paid_by` text NOT NULL,
	`split_type` text NOT NULL,
	`hatian_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `transaction_name_idx` ON `transactions` (`name`);--> statement-breakpoint
CREATE INDEX `transaction_id_idx` ON `transactions` (`id`);--> statement-breakpoint
CREATE TABLE `user_expenses` (
	`user_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`paid` text NOT NULL,
	`owed` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `users_to_transactions` (
	`user_id` text NOT NULL,
	`transaction_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `transaction_id`)
);
