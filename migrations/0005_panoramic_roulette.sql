CREATE TABLE `hatians` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`group_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `hatian_name_idx` ON `hatians` (`name`);--> statement-breakpoint
CREATE INDEX `hatian_id_idx` ON `hatians` (`id`);--> statement-breakpoint
CREATE TABLE `users_to_hatians` (
	`user_id` text NOT NULL,
	`hatian_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `hatian_id`)
);
