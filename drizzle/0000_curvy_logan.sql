CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`service` text NOT NULL,
	`message` text NOT NULL,
	`language` text DEFAULT 'fa' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_reference_unique` ON `inquiries` (`reference`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_created` ON `inquiries` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_email_created` ON `inquiries` (`email`,`created_at`);