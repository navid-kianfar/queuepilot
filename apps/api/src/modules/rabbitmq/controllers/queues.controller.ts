import { Controller, Get, Post, Delete, Param, Body, Query, ParseIntPipe, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';
import * as zlib from 'zlib';

@Controller('connections/:connId/rabbitmq/queues')
export class QueuesController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number, @Query('vhost') vhost?: string) {
    return this.rmqApi.getQueues(connId, vhost);
  }

  @Get('detail/:name')
  getByQuery(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('name') name: string,
    @Query('vhost') vhost: string,
  ) {
    return this.rmqApi.getQueue(connId, vhost || '/', name);
  }

  @Get('detail/:name/bindings')
  getBindingsByQuery(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('name') name: string,
    @Query('vhost') vhost: string,
  ) {
    return this.rmqApi.getQueueBindings(connId, vhost || '/', name);
  }

  @Get(':vhost/:name')
  get(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    return this.rmqApi.getQueue(connId, vhost, name);
  }

  @Get(':vhost/:name/bindings')
  getBindings(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    return this.rmqApi.getQueueBindings(connId, vhost, name);
  }

  @Post()
  async create(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { vhost: string; name: string; durable?: boolean; auto_delete?: boolean; arguments?: any },
  ) {
    const result = await this.rmqApi.createQueue(connId, body.vhost, body.name, {
      durable: body.durable ?? true,
      auto_delete: body.auto_delete ?? false,
      arguments: body.arguments || {},
    });
    this.audit.log({ connectionId: connId, action: 'queue.create', resourceType: 'queue', resourceIdentifier: body.name });
    return result;
  }

  @Delete(':vhost/:name')
  async delete(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    const result = await this.rmqApi.deleteQueue(connId, vhost, name);
    this.audit.log({ connectionId: connId, action: 'queue.delete', resourceType: 'queue', resourceIdentifier: name });
    return result;
  }

  @Delete(':vhost/:name/purge')
  async purge(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    const result = await this.rmqApi.purgeQueue(connId, vhost, name);
    this.audit.log({ connectionId: connId, action: 'queue.purge', resourceType: 'queue', resourceIdentifier: name });
    return result;
  }

  @Post(':vhost/:name/get')
  getMessages(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
    @Body() body: { count?: number; ackmode?: string; encoding?: string },
  ) {
    return this.rmqApi.getMessages(connId, vhost, name, {
      count: body.count || 10,
      ackmode: body.ackmode || 'ack_requeue_true',
      encoding: body.encoding || 'auto',
    });
  }

  @Post(':vhost/:name/download')
  async downloadMessages(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
    @Body() body: { count?: number },
    @Res() res: Response,
  ) {
    const batchSize = 100;
    const maxMessages = body.count || 1000;
    const allMessages: any[] = [];
    let fetched = 0;

    while (fetched < maxMessages) {
      const batch = await this.rmqApi.getMessages(connId, vhost, name, {
        count: Math.min(batchSize, maxMessages - fetched),
        ackmode: 'ack_requeue_true',
        encoding: 'auto',
      });
      if (!batch || batch.length === 0) break;
      allMessages.push(...batch);
      fetched += batch.length;
      if (batch.length < batchSize) break;
    }

    // Build a ZIP-like structure: each message as a JSON file
    // Using gzip on a single JSON array for simplicity and performance
    const jsonContent = JSON.stringify(
      allMessages.map((msg: any, i: number) => ({
        index: i,
        exchange: msg.exchange,
        routing_key: msg.routing_key,
        payload: (() => { try { return JSON.parse(msg.payload); } catch { return msg.payload; } })(),
        properties: msg.properties,
        redelivered: msg.redelivered,
        payload_bytes: msg.payload_bytes,
      })),
      null,
      2,
    );

    const gzipped = zlib.gzipSync(Buffer.from(jsonContent));

    res.set({
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${name}-messages-${new Date().toISOString().split('T')[0]}.json.gz"`,
      'Content-Length': gzipped.length.toString(),
    });
    res.end(gzipped);
  }
}
