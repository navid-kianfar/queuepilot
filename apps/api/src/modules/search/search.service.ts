import { Injectable } from '@nestjs/common';
import { ConnectionService } from '../connection/connection.service';
import { SearchResult } from '@queuepilot/shared';

@Injectable()
export class SearchService {
  constructor(private connectionService: ConnectionService) {}

  async search(query: string, connectionId?: number): Promise<SearchResult[]> {
    // Search will be populated as broker modules are added.
    // Each broker module will register a search provider.
    // For now, return connection matches.
    const connections = await this.connectionService.findAll();

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const conn of connections) {
      if (connectionId && conn.id !== connectionId) continue;

      if (conn.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          connectionId: conn.id,
          connectionName: conn.name,
          brokerType: conn.type as any,
          resourceType: 'connection' as any,
          name: conn.name,
          description: `${conn.type} - ${conn.host}:${conn.port}`,
          path: `/c/${conn.id}/${conn.type}`,
        });
      }
    }

    return results;
  }
}
