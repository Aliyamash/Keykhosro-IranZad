import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const photos = sqliteTable('photos', {
  id: text('id').primaryKey(),
  section: text('section').notNull(),
  titleFa: text('title_fa').notNull(),
  titleEn: text('title_en').notNull(),
  objectKey: text('object_key').notNull().default(''),
  contentType: text('content_type').notNull().default('image/webp'),
  deleted: integer('deleted').notNull().default(0),
  createdAt: integer('created_at').notNull(),
});
export const inquiries = sqliteTable(
  'inquiries',
  {
    id: text('id').primaryKey(),
    reference: text('reference').notNull().unique(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    service: text('service').notNull(),
    message: text('message').notNull(),
    language: text('language').notNull().default('fa'),
    status: text('status').notNull().default('new'),
    note: text('note').notNull().default(''),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [
    index('idx_inquiries_created').on(t.createdAt),
    index('idx_inquiries_email_created').on(t.email, t.createdAt),
  ],
);
export const adminLoginAttempts = sqliteTable(
  'admin_login_attempts',
  {
    key: text('key').primaryKey(),
    failures: integer('failures').notNull().default(0),
    lockedUntil: integer('locked_until').notNull().default(0),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [index('idx_admin_login_attempts_updated').on(t.updatedAt)],
);
