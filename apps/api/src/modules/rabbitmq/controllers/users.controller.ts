import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RabbitmqApiService } from '../services/rabbitmq-api.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/rabbitmq/users')
export class UsersController {
  constructor(
    private rmqApi: RabbitmqApiService,
    private audit: AuditService,
  ) {}

  @Get()
  list(@Param('connId', ParseIntPipe) connId: number) {
    return this.rmqApi.getUsers(connId);
  }

  @Get(':name')
  get(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.rmqApi.getUser(connId, name);
  }

  @Get(':name/permissions')
  getPermissions(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.rmqApi.getUserPermissions(connId, name);
  }

  @Post()
  async create(
    @Param('connId', ParseIntPipe) connId: number,
    @Body() body: { username: string; password: string; tags: string },
  ) {
    const result = await this.rmqApi.createUser(connId, body.username, {
      password: body.password,
      tags: body.tags,
    });
    this.audit.log({ connectionId: connId, action: 'user.create', resourceType: 'rmq-user', resourceIdentifier: body.username });
    return result;
  }

  @Delete(':name')
  async delete(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    const result = await this.rmqApi.deleteUser(connId, name);
    this.audit.log({ connectionId: connId, action: 'user.delete', resourceType: 'rmq-user', resourceIdentifier: name });
    return result;
  }

  @Put(':name/permissions/:vhost')
  async setPermission(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('name') name: string,
    @Param('vhost') vhost: string,
    @Body() body: { configure: string; write: string; read: string },
  ) {
    return this.rmqApi.setPermission(connId, vhost, name, body);
  }

  @Delete(':name/permissions/:vhost')
  async deletePermission(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('name') name: string,
    @Param('vhost') vhost: string,
  ) {
    return this.rmqApi.deletePermission(connId, vhost, name);
  }
}
