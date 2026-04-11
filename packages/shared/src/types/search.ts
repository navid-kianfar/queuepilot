import { BrokerType, ResourceType } from '../enums';

export interface SearchResult {
  connectionId: number;
  connectionName: string;
  brokerType: BrokerType;
  resourceType: ResourceType;
  name: string;
  description?: string;
  path: string;
}

export interface SearchRequest {
  query: string;
  connectionId?: number;
  limit?: number;
}
