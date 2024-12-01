DROP INDEX IF EXISTS "group_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "group_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "hatian_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "hatian_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "transaction_name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "transaction_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "users_user_code_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "id_idx";--> statement-breakpoint
ALTER TABLE `user_expenses` ALTER COLUMN "settled" TO "settled" text NOT NULL;--> statement-breakpoint
CREATE INDEX `group_name_idx` ON `groups` (`name`);--> statement-breakpoint
CREATE INDEX `group_id_idx` ON `groups` (`id`);--> statement-breakpoint
CREATE INDEX `hatian_name_idx` ON `hatians` (`name`);--> statement-breakpoint
CREATE INDEX `hatian_id_idx` ON `hatians` (`id`);--> statement-breakpoint
CREATE INDEX `transaction_name_idx` ON `transactions` (`name`);--> statement-breakpoint
CREATE INDEX `transaction_id_idx` ON `transactions` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_user_code_unique` ON `users` (`user_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `users` (`name`);--> statement-breakpoint
CREATE INDEX `id_idx` ON `users` (`id`);