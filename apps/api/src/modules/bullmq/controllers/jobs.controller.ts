import { Controller, Get, Post, Delete, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { BullmqJobService } from '../services/bullmq-job.service';
import { AuditService } from '../../audit/audit.service';

@Controller('connections/:connId/bullmq/queues/:queueName/jobs')
export class JobsController {
  constructor(
    private jobService: BullmqJobService,
    private audit: AuditService,
  ) {}

  @Get()
  list(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Query('state') state?: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.jobService.getJobs(connId, queueName, state, start ? parseInt(start) : 0, end ? parseInt(end) : 24);
  }

  @Get('repeatable')
  getRepeatableJobs(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
  ) {
    return this.jobService.getRepeatableJobs(connId, queueName);
  }

  @Get(':jobId')
  get(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobService.getJob(connId, queueName, jobId);
  }

  @Post()
  async add(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Body() body: { name: string; data: any; opts?: any },
  ) {
    const result = await this.jobService.addJob(connId, queueName, body.name, body.data, body.opts);
    this.audit.log({ connectionId: connId, action: 'bullmq.job.add', resourceType: 'job', resourceIdentifier: result.id });
    return result;
  }

  @Post(':jobId/retry')
  async retry(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    const result = await this.jobService.retryJob(connId, queueName, jobId);
    this.audit.log({ connectionId: connId, action: 'bullmq.job.retry', resourceType: 'job', resourceIdentifier: jobId });
    return result;
  }

  @Delete(':jobId')
  async remove(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    const result = await this.jobService.removeJob(connId, queueName, jobId);
    this.audit.log({ connectionId: connId, action: 'bullmq.job.remove', resourceType: 'job', resourceIdentifier: jobId });
    return result;
  }

  @Post(':jobId/promote')
  async promote(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    return this.jobService.promoteJob(connId, queueName, jobId);
  }

  @Post('retry-all-failed')
  async retryAllFailed(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Body() body?: { count?: number },
  ) {
    const result = await this.jobService.retryAllFailed(connId, queueName, body?.count);
    this.audit.log({ connectionId: connId, action: 'bullmq.jobs.retry-all-failed', resourceType: 'bullmq-queue', resourceIdentifier: queueName });
    return result;
  }

  @Delete('repeatable/:key')
  async removeRepeatable(
    @Param('connId', ParseIntPipe) connId: number,
    @Param('queueName') queueName: string,
    @Param('key') key: string,
  ) {
    return this.jobService.removeRepeatableJob(connId, queueName, key);
  }
}
