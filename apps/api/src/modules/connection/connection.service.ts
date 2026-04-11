import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DATABASE_TOKEN } from '../../database/database.module';
import * as schema from '../../database/schema';
import { EncryptionService } from '../../common/crypto/encryption.service';
import {
  CreateConnectionDto,
  UpdateConnectionDto,
  BrokerType,
} from '@queuepilot/shared';

@Injectable()
export class ConnectionService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private db: BetterSQLite3Database<typeof schema>,
    private encryption: EncryptionService,
  ) {}

  async findAll() {
    const connections = this.db
      .select()
      .from(schema.serverConnections)
      .orderBy(schema.serverConnections.sortOrder)
      .all();

    return connections.map((c) => ({
      ...c,
      credentials: undefined,
      metadata: c.metadata ? JSON.parse(c.metadata) : null,
    }));
  }

  async findOne(id: number) {
    const connection = this.db
      .select()
      .from(schema.serverConnections)
      .where(eq(schema.serverConnections.id, id))
      .get();

    if (!connection) {
      throw new NotFoundException(`Connection #${id} not found`);
    }

    return {
      ...connection,
      credentials: undefined,
      metadata: connection.metadata ? JSON.parse(connection.metadata) : null,
    };
  }

  async getDecryptedCredentials(id: number) {
    const connection = this.db
      .select()
      .from(schema.serverConnections)
      .where(eq(schema.serverConnections.id, id))
      .get();

    if (!connection) {
      throw new NotFoundException(`Connection #${id} not found`);
    }

    const creds = JSON.parse(this.encryption.decrypt(connection.credentials));
    const metadata = connection.metadata
      ? JSON.parse(connection.metadata)
      : {};

    return {
      ...connection,
      metadata,
      decryptedCredentials: creds,
    };
  }

  async create(dto: CreateConnectionDto) {
    const credentials = this.encryption.encrypt(
      JSON.stringify({
        username: dto.username,
        password: dto.password,
      }),
    );

    const result = this.db
      .insert(schema.serverConnections)
      .values({
        name: dto.name,
        type: dto.type,
        host: dto.host,
        port: dto.port,
        credentials,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
        color: dto.color || this.getDefaultColor(dto.type),
        icon: dto.icon,
      })
      .returning()
      .get();

    return {
      ...result,
      credentials: undefined,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
    };
  }

  async update(id: number, dto: UpdateConnectionDto) {
    await this.findOne(id);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.host !== undefined) updateData.host = dto.host;
    if (dto.port !== undefined) updateData.port = dto.port;
    if (dto.color !== undefined) updateData.color = dto.color;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.metadata !== undefined)
      updateData.metadata = JSON.stringify(dto.metadata);

    if (dto.username !== undefined || dto.password !== undefined) {
      const existing = await this.getDecryptedCredentials(id);
      const creds = {
        ...existing.decryptedCredentials,
        ...(dto.username !== undefined ? { username: dto.username } : {}),
        ...(dto.password !== undefined ? { password: dto.password } : {}),
      };
      updateData.credentials = this.encryption.encrypt(JSON.stringify(creds));
    }

    const result = this.db
      .update(schema.serverConnections)
      .set(updateData)
      .where(eq(schema.serverConnections.id, id))
      .returning()
      .get();

    return {
      ...result,
      credentials: undefined,
      metadata: result.metadata ? JSON.parse(result.metadata) : null,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    this.db
      .delete(schema.serverConnections)
      .where(eq(schema.serverConnections.id, id))
      .run();
    return { deleted: true };
  }

  private getDefaultColor(type: BrokerType): string {
    const colors: Record<string, string> = {
      rabbitmq: '#FF6600',
      kafka: '#231F20',
      bullmq: '#DC382C',
    };
    return colors[type] || '#6366f1';
  }
}
