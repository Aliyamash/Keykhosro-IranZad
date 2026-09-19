CREATE TABLE `accounting_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`source_inquiry_id` text,
	`client_name` text NOT NULL,
	`client_phone` text DEFAULT '' NOT NULL,
	`client_email` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`service` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'booked' NOT NULL,
	`quoted_amount` integer DEFAULT 0 NOT NULL,
	`internal_text` text DEFAULT '' NOT NULL,
	`start_date` text DEFAULT '' NOT NULL,
	`due_date` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounting_projects_reference_unique` ON `accounting_projects` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounting_projects_source_inquiry_id_unique` ON `accounting_projects` (`source_inquiry_id`);--> statement-breakpoint
CREATE INDEX `idx_accounting_projects_status` ON `accounting_projects` (`status`);--> statement-breakpoint
CREATE INDEX `idx_accounting_projects_created` ON `accounting_projects` (`created_at`);--> statement-breakpoint
CREATE TABLE `project_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`amount` integer NOT NULL,
	`paid_at` text NOT NULL,
	`method` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `accounting_projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_project_payments_project` ON `project_payments` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_project_payments_paid_at` ON `project_payments` (`paid_at`);