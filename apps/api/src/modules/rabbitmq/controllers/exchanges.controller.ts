import { Controller, Get, Post, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/rabbitmq/exchanges')
export class ExchangesController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number, @Query('vhost') vhost?: string) {
    return this.rmqApi.getExchanges(connId, vhost);
  }

  @Get(':vhost/:name')
  get(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    return this.rmqApi.getExchange(connId, vhost, name);
  }

  @Get(':vhost/:name/bindings/source')
  getBindingsSource(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    return this.rmqApi.getExchangeBindingsSource(connId, vhost, name);
  }

  @Get(':vhost/:name/bindings/destination')
  getBindingsDestination(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    return this.rmqApi.getExchangeBindingsDestination(connId, vhost, name);
  }

  @Post()
  async create(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { vhost: string; name: string; type: string; durable?: boolean; auto_delete?: boolean; internal?: boolean; arguments?: any },
  ) {
    const result = await this.rmqApi.createExchange(connId, body.vhost, body.name, {
      type: body.type,
      durable: body.durable ?? true,
      auto_delete: body.auto_delete ?? false,
      internal: body.internal ?? false,
      arguments: body.arguments || {},
    });
    this.audit.log({ connectionId: connId, action: 'exchange.create', resourceType: 'exchange', resourceIdentifier: body.name });
    return result;
  }

  @Delete(':vhost/:name')
  async delete(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    const result = await this.rmqApi.deleteExchange(connId, vhost, name);
    this.audit.log({ connectionId: connId, action: 'exchange.delete', resourceType: 'exchange', resourceIdentifier: name });
    return result;
  }

  @Post(':vhost/:name/publish')
  async publish(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
    @Body() body: any,
  ) {
    return this.rmqApi.publishMessage(connId, vhost, name, body);
  }
}
