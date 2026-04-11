import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

interface SSEEvent {
  channel: string;
  event: string;
  data: unknown;
  timestamp: number;
}

@Injectable()
export class SSEService {
  private eventBus = new Subject<SSEEvent>();

  push(channel: string, event: string, data: unknown) {
    this.eventBus.next({
      channel,
      event,
      data,
      timestamp: Date.now(),
    });
  }

  subscribe(channels: string[]): Observable<MessageEvent> {
    const channelSet = new Set(channels);
    return this.eventBus.pipe(
      filter((evt) => channelSet.has(evt.channel)),
      map(
        (evt) =>
          ({
            data: JSON.stringify(evt),
          }) as MessageEvent,
      ),
    );
  }
}
