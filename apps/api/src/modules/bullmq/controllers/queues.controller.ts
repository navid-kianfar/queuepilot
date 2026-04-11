import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { BullmqQueueService } from '../services/bullmq-queue.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/bullmq/queues')
export class QueuesController {
  constructor(
    private queueService: BullmqQueueService,
    private audit: AuditService,
  ) {}

  @Get()
  async list(@Param('connId', ParseIntPipe) connId: number) {
    const queueNames = await this.queueService.discoverQueues(connId);
    return Promise.all(queueNames.map((name) => this.queueService.getQueueInfo(connId, name)));
  }

  @Get(':name')
  get(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    return this.queueService.getQueueInfo(connId, name);
  }

  @Post(':name/pause')
  async pause(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    const result = await this.queueService.pauseQueue(connId, name);
    this.audit.log({ connectionId: connId, action: 'bullmq.queue.pause', resourceType: 'bullmq-queue', resourceIdentifier: name });
    return result;
  }

  @Post(':name/resume')
  async resume(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    const result = await this.queueService.resumeQueue(connId, name);
    this.audit.log({ connectionId: connId, action: 'bullmq.queue.resume', resourceType: 'bullmq-queue', resourceIdentifier: name });
    return result;
  }

  @Post(':name/clean')
  async clean(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('name') name: string,
    @Body() body: { state: string; grace?: number; limit?: number },
  ) {
    const result = await this.queueService.cleanQueue(connId, name, body.state, body.grace, body.limit);
    this.audit.log({ connectionId: connId, action: 'bullmq.queue.clean', resourceType: 'bullmq-queue', resourceIdentifier: name, details: { state: body.state } });
    return result;
  }

  @Delete(':name/drain')
  async drain(@Param('connId', ParseIntPipe) connId: number, @Param('name') name: string) {
    const result = await this.queueService.drainQueue(connId, name);
    this.audit.log({ connectionId: connId, action: 'bullmq.queue.drain', resourceType: 'bullmq-queue', resourceIdentifier: name });
    return result;
  }
}
