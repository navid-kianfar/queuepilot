import { Injectable } from '@nestjs/common';
import { KafkaAdminService } from './kafka-admin.service';

@Injectable()
export class KafkaProducerService {
  constructor(private adminService: KafkaAdminService) {}

  async produce(connId: number, topic: string, messages: { key?: string; value: string; headers?: Record<string, string>; partition?: number }[]): Promise<any> {
    const kafka = this.adminService.getKafka(connId);
    if (!kafka) {
      await this.adminService.getAdmin(connId);
      return this.produce(connId, topic, messages);
    }

    const producer = kafka.producer();
    try {
      await producer.connect();
      const result = await producer.send({
        topic,
        messages: messages.map((m) => ({
          key: m.key || undefined,
          value: m.value,
          headers: m.headers,
          partition: m.partition,
        })),
      });
      return { sent: result };
    } finally {
      await producer.disconnect();
    }
  }
}
