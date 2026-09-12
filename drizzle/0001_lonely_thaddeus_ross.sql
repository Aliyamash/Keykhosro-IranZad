CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`section` text NOT NULL,
	`title_fa` text NOT NULL,
	`title_en` text NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`content_type` text DEFAULT 'image/webp' NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
