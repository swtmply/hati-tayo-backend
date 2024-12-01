PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY DEFAULT (uuid()) NOT NULL,
	`clerk_id` text NOT NULL,
	`name` text NOT NULL,
	`user_code` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "clerk_id", "name", "user_code", "email", "created_at") SELECT "id", "clerk_id", "name", "user_code", "email", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_code_unique` ON `users` (`user_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `users` (`name`);--> statement-breakpoint
CREATE INDEX `id_idx` ON `users` (`id`);