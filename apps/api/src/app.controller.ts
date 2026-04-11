import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      name: 'QueuePilot',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  }
}
