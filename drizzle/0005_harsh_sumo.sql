CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`name_fa` text NOT NULL,
	`name_en` text NOT NULL,
	`role_fa` text DEFAULT '' NOT NULL,
	`role_en` text DEFAULT '' NOT NULL,
	`bio_fa` text NOT NULL,
	`bio_en` text NOT NULL,
	`instagram` text DEFAULT '' NOT NULL,
	`linkedin` text DEFAULT '' NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`content_type` text DEFAULT 'image/webp' NOT NULL,
	`sort_order` integer DEFAULT 100 NOT NULL,
	`is_primary` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_team_members_order` ON `team_members` (`is_primary`,`sort_order`);