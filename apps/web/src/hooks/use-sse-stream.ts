import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseSSEOptions {
  channels: string[];
  enabled?: boolean;
}

export function useSSEStream({ channels, enabled = true }: UseSSEOptions) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!enabled || channels.length === 0) return;

    const url = `/api/v1/sse?channels=${channels.join(',')}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Invalidate relevant queries based on channel
        const channel = data.channel as string;
        if (channel.includes(':overview')) {
          const parts = channel.split(':');
          queryClient.invalidateQueries({ queryKey: [parts[0], Number(parts[1]), 'overview'] });
        } else if (channel.includes(':queues')) {
          const parts = channel.split(':');
          queryClient.invalidateQueries({ queryKey: [parts[0], Number(parts[1]), 'queues'] });
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      es.close();
      // Reconnect after 5s
      setTimeout(connect, 5000);
    };

    eventSourceRef.current = es;
  }, [channels, enabled, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);
}
