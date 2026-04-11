import { Controller, Get, Post, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/rabbitmq/policies')
export class PoliciesController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number, @Query('vhost') vhost?: string) {
    return this.rmqApi.getPolicies(connId, vhost);
  }

  @Get(':vhost/:name')
  get(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    return this.rmqApi.getPolicy(connId, vhost, name);
  }

  @Post()
  async create(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { vhost: string; name: string; pattern: string; apply_to: string; definition: any; priority?: number },
  ) {
    const result = await this.rmqApi.createPolicy(connId, body.vhost, body.name, {
      pattern: body.pattern,
      'apply-to': body.apply_to,
      definition: body.definition,
      priority: body.priority || 0,
    });
    this.audit.log({ connectionId: connId, action: 'policy.create', resourceType: 'policy', resourceIdentifier: body.name });
    return result;
  }

  @Delete(':vhost/:name')
  async delete(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('vhost') vhost: string,
    @Param('name') name: string,
  ) {
    const result = await this.rmqApi.deletePolicy(connId, vhost, name);
    this.audit.log({ connectionId: connId, action: 'policy.delete', resourceType: 'policy', resourceIdentifier: name });
    return result;
  }
}
