/**
 * Screenshot script: captures key screens for README
 * Run with: npx tsx scripts/screenshots.ts
 * Requires: the web dev server running on port 5173 and API on port 3000
 */
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const SCREENSHOTS_DIR = join(process.cwd(), 'screenshots');
const BASE_URL = 'http://localhost:5173';
const WIDTH = 1400;
const HEIGHT = 900;

const screens = [
  { name: '01-connections', path: '/', wait: 2000 },
  { name: '02-connection-new', path: '/connections/new', wait: 1000 },
  { name: '03-rmq-dashboard', path: '/c/4/rabbitmq', wait: 3000 },
  { name: '04-rmq-queues', path: '/c/4/rabbitmq/queues', wait: 2000 },
  { name: '05-rmq-exchanges', path: '/c/4/rabbitmq/exchanges', wait: 2000 },
  { name: '06-rmq-connections', path: '/c/4/rabbitmq/connections', wait: 2000 },
  { name: '07-kafka-dashboard', path: '/c/2/kafka', wait: 3000 },
  { name: '08-kafka-topics', path: '/c/2/kafka/topics', wait: 2000 },
  { name: '09-kafka-consumer-groups', path: '/c/2/kafka/consumer-groups', wait: 2000 },
  { name: '10-bullmq-dashboard', path: '/c/3/bullmq', wait: 3000 },
  { name: '11-bullmq-queues', path: '/c/3/bullmq/queues', wait: 2000 },
];

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });

  // Set light mode
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

  for (const screen of screens) {
    console.log(`Capturing ${screen.name}...`);
    await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

    // Force light class
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    });

    await new Promise((r) => setTimeout(r, screen.wait));
    await page.screenshot({ path: join(SCREENSHOTS_DIR, `${screen.name}.png`), type: 'png' });
  }

  await browser.close();
  console.log(`\nDone! ${screens.length} screenshots saved to screenshots/`);
}

main().catch(console.error);
