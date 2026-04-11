import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { KafkaAdminService } from '../services/kafka-admin.service';

@Controller('connections/:connId/kafka/brokers')
export class BrokersController {
  constructor(private kafkaAdmin: KafkaAdminService) {}

  @Get()
  async list(@Param('connId', ParseIntPipe) connId: number) {
    const overview = await this.kafkaAdmin.getClusterOverview(connId);
    return overview.brokers.map((b: any) => ({
      ...b,
      isController: b.nodeId === overview.controller,
    }));
  }
}
