import { Controller, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/rabbitmq/connections')
export class ConnectionsController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number) {
    return this.rmqApi.getConnections(connId);
  }

  @Get(':name')
  get(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.rmqApi.getConnection(connId, name);
  }

  @Delete(':name')
  async close(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    const result = await this.rmqApi.closeConnection(connId, name);
    this.audit.log({ connectionId: connId, action: 'connection.close', resourceType: 'rmq-connection', resourceIdentifier: name });
    return result;
  }
}
