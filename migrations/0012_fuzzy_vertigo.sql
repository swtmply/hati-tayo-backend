PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_qr_codes` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_qr_codes`("user_id", "name", "url", "created_at") SELECT "user_id", "name", "url", "created_at" FROM `user_qr_codes`;--> statement-breakpoint
DROP TABLE `user_qr_codes`;--> statement-breakpoint
ALTER TABLE `__new_user_qr_codes` RENAME TO `user_qr_codes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;