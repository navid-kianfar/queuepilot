import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';

@Controller('connections/:connId/rabbitmq/channels')
export class ChannelsController {
  constructor(private rmqApi: RabbitmqApiService) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number) {
    return this.rmqApi.getChannels(connId);
  }

  @Get(':name')
  get(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.rmqApi.getChannel(connId, name);
  }
}
