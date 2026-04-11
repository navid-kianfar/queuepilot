import { Module } from '@nestjs/common';
import { OverviewController } from './controllers/overview.controller';
import { QueuesController } from './controllers/queues.controller';
import { JobsController } from './controllers/jobs.controller';
import { BullmqQueueService } from './services/bullmq-queue.service';
import { BullmqJobService } from './services/bullmq-job.service';

@Module({
  controllers: [OverviewController, QueuesController, JobsController],
  providers: [BullmqQueueService, BullmqJobService],
  exports: [BullmqQueueService],
})
export class BullmqModule {}
