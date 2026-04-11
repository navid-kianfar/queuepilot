/**
 * Screenshot script for detail pages with message previews
 * Run with: npx tsx scripts/screenshots-detail.ts
 */
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), 'screenshots');
const BASE_URL = 'http://localhost:5173';
const WIDTH = 1400;
const HEIGHT = 900;

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  const forceLight = async () => {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });
  };

  // 1. RabbitMQ Queue Detail - Overview
  console.log('Capturing RMQ queue detail...');
  await page.goto(`${BASE_URL}/c/4/rabbitmq/queues/detail/demo-orders?vhost=/`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await forceLight();
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: join(SCREENSHOTS_DIR, '12-rmq-queue-detail.png'), type: 'png' });

  // 2. RabbitMQ Queue Detail - Messages tab with fetched messages
  console.log('Capturing RMQ queue messages...');
  // Click "Messages" tab
  const msgTab = await page.$$('button');
  for (const btn of msgTab) {
    const text = await btn.evaluate((el: any) => el.textContent);
    if (text?.trim() === 'Messages') { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 500));
  // Click "Get Messages" button
  const getBtn = await page.$$('button');
  for (const btn of getBtn) {
    const text = await btn.evaluate((el: any) => el.textContent);
    if (text?.includes('Get Messages')) { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 2000));
  // Click on first message to expand it
  const msgCards = await page.$$('.cursor-pointer.rounded-xl');
  if (msgCards.length > 0) await msgCards[0].click();
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: join(SCREENSHOTS_DIR, '13-rmq-queue-messages.png'), type: 'png' });

  // 3. RabbitMQ Queue Detail - Publish tab with MessageEditor
  console.log('Capturing RMQ queue publish...');
  const pubTab = await page.$$('button');
  for (const btn of pubTab) {
    const text = await btn.evaluate((el: any) => el.textContent);
    if (text?.trim() === 'Publish') { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: join(SCREENSHOTS_DIR, '14-rmq-queue-publish.png'), type: 'png' });

  // 4. Kafka Topic Detail - Partitions
  console.log('Capturing Kafka topic detail...');
  await page.goto(`${BASE_URL}/c/2/kafka/topics/order-events`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await forceLight();
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: join(SCREENSHOTS_DIR, '15-kafka-topic-detail.png'), type: 'png' });

  // 5. Kafka Topic Detail - Messages
  console.log('Capturing Kafka topic messages...');
  const kafkaMsgTab = await page.$$('button');
  for (const btn of kafkaMsgTab) {
    const text = await btn.evaluate((el: any) => el.textContent);
    if (text?.trim() === 'Messages') { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 500));
  // Click Browse
  const browseBtn = await page.$$('button');
  for (const btn of browseBtn) {
    const text = await btn.evaluate((el: any) => el.textContent);
    if (text?.includes('Browse')) { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 6000));
  // Click first message
  const kafkaMsgCards = await page.$$('.cursor-pointer.rounded-xl');
  if (kafkaMsgCards.length > 0) await kafkaMsgCards[0].click();
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: join(SCREENSHOTS_DIR, '16-kafka-topic-messages.png'), type: 'png' });

  // 6. BullMQ Queue Detail
  console.log('Capturing BullMQ queue detail...');
  await page.goto(`${BASE_URL}/c/3/bullmq/queues/email-notifications`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await forceLight();
  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: join(SCREENSHOTS_DIR, '17-bullmq-queue-detail.png'), type: 'png' });

  // 7. BullMQ Queue Detail - Jobs loaded with "All" filter
  console.log('Capturing BullMQ queue jobs...');
  // Click "All" state filter
  const allBtn = await page.$$('button');
  for (const btn of allBtn) {
    const text = await btn.evaluate((el: any) => el.textContent);
    if (text?.trim() === 'All') { await btn.click(); break; }
  }
  await new Promise((r) => setTimeout(r, 2000));
  // Click first job to expand
  const jobCards = await page.$$('.cursor-pointer.rounded-xl');
  if (jobCards.length > 0) await jobCards[0].click();
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: join(SCREENSHOTS_DIR, '18-bullmq-queue-jobs.png'), type: 'png' });

  await browser.close();
  console.log('\nDone! Detail screenshots saved.');
}

main().catch(console.error);
