import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/rabbitmq/vhosts')
export class VhostsController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number) {
    return this.rmqApi.getVhosts(connId);
  }

  @Get(':name')
  get(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.rmqApi.getVhost(connId, name);
  }

  @Get(':name/permissions')
  getPermissions(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.rmqApi.getVhostPermissions(connId, name);
  }

  @Post()
  async create(@Param('connId', ParseIntPipe) connId: number, @Body() body: { name: string }) {
    const result = await this.rmqApi.createVhost(connId, body.name);
    this.audit.log({ connectionId: connId, action: 'vhost.create', resourceType: 'vhost', resourceIdentifier: body.name });
    return result;
  }

  @Delete(':name')
  async delete(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    const result = await this.rmqApi.deleteVhost(connId, name);
    this.audit.log({ connectionId: connId, action: 'vhost.delete', resourceType: 'vhost', resourceIdentifier: name });
    return result;
  }
}
