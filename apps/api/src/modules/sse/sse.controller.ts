import { Controller, Sse, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SSEService } from './sse.service';

@Controller('sse')
export class SSEController {
  constructor(private sseService: SSEService) {}

  @Sse()
  events(@Query('channels') channels: string): Observable<MessageEvent> {
    const channelList = channels ? channels.split(',') : [];
    return this.sseService.subscribe(channelList);
  }
}
