import { Global, Module } from '@nestjs/common';
import { SSEController } from './sse.controller';
import { SSEService } from './sse.service';

@Global()
@Module({
  controllers: [SSEController],
  providers: [SSEService],
  exports: [SSEService],
})
export class SSEModule {}
