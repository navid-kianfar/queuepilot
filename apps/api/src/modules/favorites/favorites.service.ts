import { Injectable, Inject } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq, and } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import * as schema from '../../database/schema';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  findAll(connectionId?: number) {
    if (connectionId) {
      return this.db
        .select()
        .from(schema.favorites)
        .where(eq(schema.favorites.connectionId, connectionId))
        .all();
    }
    return this.db.select().from(schema.favorites).all();
  }

  create(data: {
    connectionId: number;
    resourceType: string;
    resourceIdentifier: string;
    label?: string;
  }) {
    return this.db.insert(schema.favorites).values(data).returning().get();
  }

  remove(id: number) {
    this.db
      .delete(schema.favorites)
      .where(eq(schema.favorites.id, id))
      .run();
    return { deleted: true };
  }
}
