import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { BullmqQueueService } from '../services/bullmq-queue.service';

@Controller('connections/:connId/bullmq')
export class OverviewController {
  constructor(private queueService: BullmqQueueService) {}

  @Get('overview')
  async getOverview(@Param('connId', ParseIntPipe) connId: number) {
    const queueNames = await this.queueService.discoverQueues(connId);
    const queues = await Promise.all(queueNames.map((name) => this.queueService.getQueueInfo(connId, name)));
    const totals = queues.reduce(
      (acc, q) => ({
        totalQueues: acc.totalQueues + 1,
        totalJobs: acc.totalJobs + q.totalJobs,
        activeJobs: acc.activeJobs + (q.jobCounts.active || 0),
        failedJobs: acc.failedJobs + (q.jobCounts.failed || 0),
        waitingJobs: acc.waitingJobs + (q.jobCounts.waiting || 0),
        completedJobs: acc.completedJobs + (q.jobCounts.completed || 0),
        delayedJobs: acc.delayedJobs + (q.jobCounts.delayed || 0),
      }),
      { totalQueues: 0, totalJobs: 0, activeJobs: 0, failedJobs: 0, waitingJobs: 0, completedJobs: 0, delayedJobs: 0 },
    );
    return { totals, queues };
  }
}
