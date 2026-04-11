import { Injectable, Inject } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { desc } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import * as schema from '../../database/schema';

@Injectable()
export class AuditService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private db: BetterSQLite3Database<typeof schema>,
  ) {}

  log(params: {
    connectionId?: number;
    action: string;
    resourceType?: string;
    resourceIdentifier?: string;
    details?: Record<string, unknown>;
  }) {
    this.db
      .insert(schema.auditLog)
      .values({
        connectionId: params.connectionId,
        action: params.action,
        resourceType: params.resourceType,
        resourceIdentifier: params.resourceIdentifier,
        details: params.details ? JSON.stringify(params.details) : null,
      })
      .run();
  }

  findAll(limit = 100, offset = 0) {
    return this.db
      .select()
      .from(schema.auditLog)
      .orderBy(desc(schema.auditLog.id))
      .limit(limit)
      .offset(offset)
      .all()
      .map((row) => ({
        ...row,
        details: row.details ? JSON.parse(row.details) : null,
      }));
  }
}
