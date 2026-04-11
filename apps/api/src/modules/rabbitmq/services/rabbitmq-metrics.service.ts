import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { SSEService } from '../../sse/sse.service';
import { RabbitmqApiService } from './rabbitmq-api.service';

@Injectable()
export class RabbitmqMetricsService implements OnModuleDestroy {
  private intervals = new Map<number, ReturnType<typeof setInterval>>();

  constructor(
    private sseService: SSEService,
    private rmqApi: RabbitmqApiService,
  ) {}

  onModuleDestroy() {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
  }

  startPolling(connectionId: number, intervalMs = 5000) {
    if (this.intervals.has(connectionId)) return;

    const poll = async () => {
      try {
        const overview = await this.rmqApi.getOverview(connectionId);
        this.sseService.push(`rabbitmq:${connectionId}:overview`, 'update', overview);

        const queues = await this.rmqApi.getQueues(connectionId);
        this.sseService.push(`rabbitmq:${connectionId}:queues`, 'update', queues);
      } catch {
        // Connection might be down — stop polling
        this.stopPolling(connectionId);
      }
    };

    poll();
    this.intervals.set(connectionId, setInterval(poll, intervalMs));
  }

  stopPolling(connectionId: number) {
    const interval = this.intervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(connectionId);
    }
  }
}
