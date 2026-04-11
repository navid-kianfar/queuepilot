import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionGateway } from './connection.gateway';

@Controller('connections')
export class ConnectionController {
  constructor(
    private connectionService: ConnectionService,
    private connectionGateway: ConnectionGateway,
  ) {}

  @Get()
  findAll() {
    return this.connectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.connectionService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.connectionService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.connectionService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.connectionGateway.evictConnection(id);
    return this.connectionService.remove(id);
  }

  @Post('test')
  testConnection(@Body() body: any) {
    return this.connectionGateway.testConnection(
      body.type,
      body.host,
      body.port,
      body.username,
      body.password,
      body.metadata,
    );
  }
}
