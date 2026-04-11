import { Injectable, Inject } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import * as schema from '../../database/schema';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  findAll() {
    const rows = this.db.select().from(schema.settings).all();
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  get(key: string): string | null {
    const row = this.db
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, key))
      .get();
    return row?.value ?? null;
  }

  set(key: string, value: string) {
    this.db
      .insert(schema.settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: schema.settings.key,
        set: { value },
      })
      .run();
    return { key, value };
  }

  remove(key: string) {
    this.db
      .delete(schema.settings)
      .where(eq(schema.settings.key, key))
      .run();
    return { deleted: true };
  }
}
