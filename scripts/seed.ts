/**
 * Seed script: creates Kafka topics + messages, BullMQ queues + jobs
 * Run with: npx tsx scripts/seed.ts
 */
import { Kafka, Partitioners } from 'kafkajs';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

async function seedKafka() {
  console.log('\n=== Seeding Kafka ===');
  const kafka = new Kafka({ clientId: 'queuepilot-seeder', brokers: ['localhost:9092'] });
  const admin = kafka.admin();
  await admin.connect();

  // Create topics
  const topics = [
    { topic: 'user-events', numPartitions: 3, replicationFactor: 1 },
    { topic: 'order-events', numPartitions: 4, replicationFactor: 1 },
    { topic: 'payment-notifications', numPartitions: 2, replicationFactor: 1 },
    { topic: 'email-queue', numPartitions: 2, replicationFactor: 1 },
    { topic: 'audit-log', numPartitions: 1, replicationFactor: 1 },
    { topic: 'dead-letter', numPartitions: 1, replicationFactor: 1 },
  ];

  await admin.createTopics({ topics });
  console.log(`Created ${topics.length} topics`);

  // Produce messages
  const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
  await producer.connect();

  const userEvents = Array.from({ length: 30 }, (_, i) => ({
    key: `user-${i % 10}`,
    value: JSON.stringify({
      eventType: ['user.created', 'user.updated', 'user.login', 'user.logout'][i % 4],
      userId: `usr_${1000 + (i % 10)}`,
      email: `user${i % 10}@example.com`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      metadata: { ip: `192.168.1.${i % 255}`, userAgent: 'Mozilla/5.0' },
    }),
    headers: { 'content-type': 'application/json', source: 'auth-service' },
  }));
  await producer.send({ topic: 'user-events', messages: userEvents });
  console.log('Produced 30 user-events');

  const orderEvents = Array.from({ length: 50 }, (_, i) => ({
    key: `order-${i}`,
    value: JSON.stringify({
      eventType: ['order.placed', 'order.confirmed', 'order.shipped', 'order.delivered', 'order.cancelled'][i % 5],
      orderId: `ORD-${10000 + i}`,
      customerId: `usr_${1000 + (i % 10)}`,
      amount: Math.round(Math.random() * 50000) / 100,
      currency: 'USD',
      items: Array.from({ length: 1 + (i % 3) }, (_, j) => ({
        productId: `PROD-${j + 1}`,
        name: ['Widget A', 'Widget B', 'Gadget Pro', 'Super Gizmo'][j % 4],
        quantity: 1 + (j % 5),
        price: Math.round(Math.random() * 10000) / 100,
      })),
      timestamp: new Date(Date.now() - i * 120000).toISOString(),
    }),
    headers: { 'content-type': 'application/json', source: 'order-service' },
  }));
  await producer.send({ topic: 'order-events', messages: orderEvents });
  console.log('Produced 50 order-events');

  const paymentNotifs = Array.from({ length: 20 }, (_, i) => ({
    key: `payment-${i}`,
    value: JSON.stringify({
      type: ['payment.success', 'payment.failed', 'refund.processed'][i % 3],
      paymentId: `PAY-${5000 + i}`,
      orderId: `ORD-${10000 + (i % 50)}`,
      amount: Math.round(Math.random() * 30000) / 100,
      provider: ['stripe', 'paypal', 'square'][i % 3],
      timestamp: new Date(Date.now() - i * 300000).toISOString(),
    }),
  }));
  await producer.send({ topic: 'payment-notifications', messages: paymentNotifs });
  console.log('Produced 20 payment-notifications');

  const emails = Array.from({ length: 15 }, (_, i) => ({
    key: `email-${i}`,
    value: JSON.stringify({
      to: `user${i % 10}@example.com`,
      subject: ['Welcome!', 'Order Confirmation', 'Shipping Update', 'Password Reset', 'Weekly Digest'][i % 5],
      template: ['welcome', 'order-confirm', 'shipping', 'reset-password', 'digest'][i % 5],
      variables: { name: `User ${i % 10}`, orderId: `ORD-${10000 + i}` },
    }),
  }));
  await producer.send({ topic: 'email-queue', messages: emails });
  console.log('Produced 15 email-queue');

  // Create a consumer group (consume a few messages then disconnect)
  const consumer = kafka.consumer({ groupId: 'order-processor' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-events', fromBeginning: true });
  let consumed = 0;
  await new Promise<void>((resolve) => {
    consumer.run({
      eachMessage: async () => {
        consumed++;
        if (consumed >= 25) { resolve(); }
      },
    });
    setTimeout(resolve, 5000);
  });
  await consumer.disconnect();
  console.log(`Consumer group "order-processor" consumed ${consumed} messages (creating lag)`);

  // Second consumer group
  const consumer2 = kafka.consumer({ groupId: 'email-sender' });
  await consumer2.connect();
  await consumer2.subscribe({ topic: 'email-queue', fromBeginning: true });
  let consumed2 = 0;
  await new Promise<void>((resolve) => {
    consumer2.run({
      eachMessage: async () => {
        consumed2++;
        if (consumed2 >= 5) { resolve(); }
      },
    });
    setTimeout(resolve, 3000);
  });
  await consumer2.disconnect();
  console.log(`Consumer group "email-sender" consumed ${consumed2} messages`);

  await producer.disconnect();
  await admin.disconnect();
  console.log('Kafka seeding complete!');
}

async function seedBullMQ() {
  console.log('\n=== Seeding BullMQ ===');
  const connection = { host: 'localhost', port: 6379 };

  // Email queue
  const emailQueue = new Queue('email-notifications', { connection });
  for (let i = 0; i < 20; i++) {
    await emailQueue.add(
      ['send-welcome', 'send-receipt', 'send-reminder', 'send-promo'][i % 4],
      {
        to: `user${i % 10}@example.com`,
        subject: ['Welcome!', 'Your Receipt', 'Don\'t Forget!', 'Special Offer'][i % 4],
        body: `Hello User ${i % 10}, this is message #${i}`,
        templateId: `tpl_${100 + (i % 4)}`,
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );
  }
  console.log('Added 20 jobs to email-notifications queue');

  // Image processing queue
  const imageQueue = new Queue('image-processing', { connection });
  for (let i = 0; i < 15; i++) {
    await imageQueue.add(
      ['resize', 'compress', 'watermark', 'convert'][i % 4],
      {
        imageUrl: `https://cdn.example.com/images/img_${1000 + i}.jpg`,
        outputFormat: ['webp', 'png', 'jpeg'][i % 3],
        width: [800, 1200, 1600, 2400][i % 4],
        height: [600, 900, 1200, 1800][i % 4],
        quality: 85,
      },
      {
        priority: i % 3 === 0 ? 1 : 5,
        removeOnComplete: 50,
      },
    );
  }
  console.log('Added 15 jobs to image-processing queue');

  // Data sync queue with delayed jobs
  const syncQueue = new Queue('data-sync', { connection });
  for (let i = 0; i < 10; i++) {
    await syncQueue.add(
      'sync-' + ['users', 'products', 'orders', 'inventory'][i % 4],
      {
        source: 'primary-db',
        destination: ['analytics-db', 'search-index', 'cache', 'backup'][i % 4],
        batchSize: 1000,
        lastSyncedAt: new Date(Date.now() - i * 3600000).toISOString(),
      },
      {
        delay: i % 3 === 0 ? 30000 : 0,
        attempts: 5,
        backoff: { type: 'fixed', delay: 5000 },
      },
    );
  }
  console.log('Added 10 jobs to data-sync queue (some delayed)');

  // Report generation queue
  const reportQueue = new Queue('report-generation', { connection });
  for (let i = 0; i < 8; i++) {
    await reportQueue.add(
      ['daily-sales', 'weekly-summary', 'monthly-audit', 'user-activity'][i % 4],
      {
        reportType: ['sales', 'summary', 'audit', 'activity'][i % 4],
        dateRange: { from: '2025-01-01', to: '2025-03-29' },
        format: ['pdf', 'csv', 'xlsx'][i % 3],
        requestedBy: `admin@example.com`,
      },
      { removeOnComplete: 20 },
    );
  }
  console.log('Added 8 jobs to report-generation queue');

  // Webhook delivery queue
  const webhookQueue = new Queue('webhook-delivery', { connection });
  for (let i = 0; i < 12; i++) {
    await webhookQueue.add(
      'deliver',
      {
        url: `https://hooks.example.com/endpoint/${i % 5}`,
        method: 'POST',
        payload: { event: ['order.created', 'payment.received', 'user.signup'][i % 3], data: { id: i } },
        headers: { 'X-Webhook-Secret': 'wh_sec_xxx' },
        retryCount: 0,
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }
  console.log('Added 12 jobs to webhook-delivery queue');

  await emailQueue.close();
  await imageQueue.close();
  await syncQueue.close();
  await reportQueue.close();
  await webhookQueue.close();
  console.log('BullMQ seeding complete!');
}

async function main() {
  try {
    await seedKafka();
  } catch (err) {
    console.error('Kafka seeding failed:', err);
  }
  try {
    await seedBullMQ();
  } catch (err) {
    console.error('BullMQ seeding failed:', err);
  }
  process.exit(0);
}

main();
