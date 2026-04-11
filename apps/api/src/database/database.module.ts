import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { join } from 'path';
import * as schema from './schema';

export const DATABASE_TOKEN = 'DATABASE';

function getDbPath(configService?: ConfigService): string {
  const envPath = configService?.get<string>('DATABASE_PATH') || process.env.DATABASE_PATH;
  if (envPath) return envPath;
  return join(process.cwd(), 'queuepilot.db');
}

const databaseProvider = {
  provide: DATABASE_TOKEN,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const dbPath = getDbPath(configService);
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');
    const db = drizzle(sqlite, { schema });
    return db;
  },
};

@Global()
@Module({
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dbPath = getDbPath(this.configService);
    console.log(`Database: ${dbPath}`);
    const sqlite = new Database(dbPath);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS server_connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('rabbitmq', 'kafka', 'bullmq')),
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        credentials TEXT NOT NULL,
        metadata TEXT,
        color TEXT DEFAULT '#6366f1',
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        connection_id INTEGER NOT NULL REFERENCES server_connections(id) ON DELETE CASCADE,
        resource_type TEXT NOT NULL,
        resource_identifier TEXT NOT NULL,
        label TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        connection_id INTEGER REFERENCES server_connections(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_identifier TEXT,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    sqlite.close();
  }
}
