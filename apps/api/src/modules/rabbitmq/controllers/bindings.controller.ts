import { Controller, Get, Post, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/rabbitmq/bindings')
export class BindingsController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number, @Query('vhost') vhost?: string) {
    return this.rmqApi.getBindings(connId, vhost);
  }

  @Post()
  async create(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { vhost: string; source: string; destination_type: string; destination: string; routing_key?: string; arguments?: any },
  ) {
    const result = await this.rmqApi.createBinding(connId, body.vhost, body.source, body.destination_type, body.destination, {
      routing_key: body.routing_key || '',
      arguments: body.arguments || {},
    });
    this.audit.log({ connectionId: connId, action: 'binding.create', resourceType: 'binding', resourceIdentifier: `${body.source} -> ${body.destination}` });
    return result;
  }

  @Delete(':vhost/:source/:destType/:dest/:propsKey')
  async delete(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('source') source: string,
    @Param('destType') destType: string,
    @Param('dest') dest: string,
    @Param('propsKey') propsKey: string,
  ) {
    const result = await this.rmqApi.deleteBinding(connId, vhost, source, destType, dest, propsKey);
    this.audit.log({ connectionId: connId, action: 'binding.delete', resourceType: 'binding', resourceIdentifier: `${source} -> ${dest}` });
    return result;
  }
}
