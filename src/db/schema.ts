import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// One row per scan, written with Drizzle ORM
export const scans = sqliteTable('scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  crop: text('crop').notNull(),
  disease: text('disease').notNull(),
  healthy: integer('healthy', { mode: 'boolean' }).notNull(),
  confidence: integer('confidence').notNull(),
  thumb: text('thumb'),
  createdAt: text('created_at').notNull(),
});
