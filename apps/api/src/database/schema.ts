import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const serverConnections = sqliteTable('server_connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['rabbitmq', 'kafka', 'bullmq'] }).notNull(),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  credentials: text('credentials').notNull(),
  metadata: text('metadata'),
  color: text('color').default('#6366f1'),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  connectionId: integer('connection_id')
    .notNull()
    .references(() => serverConnections.id, { onDelete: 'cascade' }),
  resourceType: text('resource_type').notNull(),
  resourceIdentifier: text('resource_identifier').notNull(),
  label: text('label'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  connectionId: integer('connection_id').references(() => serverConnections.id, {
    onDelete: 'set null',
  }),
  action: text('action').notNull(),
  resourceType: text('resource_type'),
  resourceIdentifier: text('resource_identifier'),
  details: text('details'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});
