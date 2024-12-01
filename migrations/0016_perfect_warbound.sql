ALTER TABLE `transactions` RENAME COLUMN "paid_by" TO "paid_by_id";--> statement-breakpoint
ALTER TABLE `user_expenses` ADD `paid_by_id` text NOT NULL;