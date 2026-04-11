import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { KafkaAdminService } from '../services/kafka-admin.service';

@Controller('connections/:connId/kafka')
export class OverviewController {
  constructor(private kafkaAdmin: KafkaAdminService) {}

  @Get('overview')
  getOverview(@Param('connId', ParseIntPipe) connId: number) {
    return this.kafkaAdmin.getClusterOverview(connId);
  }
}
