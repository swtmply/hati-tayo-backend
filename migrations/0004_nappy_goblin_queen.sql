CREATE TABLE `groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `group_name_idx` ON `groups` (`name`);--> statement-breakpoint
CREATE INDEX `group_id_idx` ON `groups` (`id`);--> statement-breakpoint
CREATE TABLE `users_to_groups` (
	`user_id` text NOT NULL,
	`group_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `group_id`)
);
