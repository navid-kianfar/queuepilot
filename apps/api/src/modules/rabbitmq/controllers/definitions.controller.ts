import { Controller, Get, Post, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/rabbitmq/definitions')
export class DefinitionsController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  get(@Param('connId', ParseIntPipe) connId: number, @Query('vhost') vhost?: string) {
    return this.rmqApi.getDefinitions(connId, vhost);
  }

  @Post('import')
  async import(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: any,
    @Query('vhost') vhost?: string,
  ) {
    const result = await this.rmqApi.importDefinitions(connId, body, vhost);
    this.audit.log({ connectionId: connId, action: 'definitions.import', resourceType: 'definitions' });
    return result;
  }
}
