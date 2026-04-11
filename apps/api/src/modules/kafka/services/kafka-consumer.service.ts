import { Injectable } from '@nestjs/common';
import { KafkaAdminService } from './kafka-admin.service';

@Injectable()
export class KafkaConsumerService {
  constructor(private adminService: KafkaAdminService) {}

  async browseMessages(connId: number, topic: string, partition = 0, offset = '0', limit = 20): Promise<any[]> {
    const kafka = this.adminService.getKafka(connId);
    if (!kafka) {
      await this.adminService.getAdmin(connId);
      return this.browseMessages(connId, topic, partition, offset, limit);
    }

    const consumer = kafka.consumer({ groupId: `queuepilot-browse-${Date.now()}` });
    const messages: any[] = [];

    try {
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: offset === '0' });

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 5000);

        consumer.run({
          eachMessage: async ({ message, partition: p, topic: t }) => {
            if (p !== partition && partition !== -1) return;
            messages.push({
              topic: t,
              partition: p,
              offset: message.offset,
              timestamp: message.timestamp,
              key: message.key?.toString() || null,
              value: message.value?.toString() || null,
              headers: Object.fromEntries(
                Object.entries(message.headers || {}).map(([k, v]) => [k, v?.toString() || ''])
              ),
              size: message.value?.length || 0,
            });
            if (messages.length >= limit) {
              clearTimeout(timeout);
              resolve();
            }
          },
        });
      });
    } finally {
      await consumer.disconnect();
    }

    return messages;
  }
}
