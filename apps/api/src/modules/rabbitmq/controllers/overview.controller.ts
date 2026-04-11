import { Controller, Get, Param, ParseIntPipe, Post, Delete } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { RabbitmqMetricsService } from '../services/rabbitmq-metrics.service';

@Controller('connections/:connId/rabbitmq')
export class OverviewController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private metricsService: RabbitmqMetricsService,
  ) {}

  @Get('overview')
  getOverview(@Param('connId', ParseIntPipe) connId: number) {
    return this.rmqApi.getOverview(connId);
  }

  @Get('nodes')
  getNodes(@Param('connId', ParseIntPipe) connId: number) {
    return this.rmqApi.getNodes(connId);
  }

  @Post('metrics/start')
  startMetrics(@Param('connId', ParseIntPipe) connId: number) {
    this.metricsService.startPolling(connId);
    return { polling: true };
  }

  @Delete('metrics/stop')
  stopMetrics(@Param('connId', ParseIntPipe) connId: number) {
    this.metricsService.stopPolling(connId);
    return { polling: false };
  }
}
