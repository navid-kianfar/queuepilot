import { BrokerType } from '../enums';
import { ConnectionMetadata } from '../types';

export interface CreateConnectionDto {
  name: string;
  type: BrokerType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  metadata?: ConnectionMetadata;
  color?: string;
  icon?: string;
}

export interface UpdateConnectionDto {
  name?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  metadata?: ConnectionMetadata;
  color?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface TestConnectionDto {
  type: BrokerType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  metadata?: ConnectionMetadata;
}

export interface TestConnectionResult {
  success: boolean;
  latencyMs: number;
  error?: string;
  serverInfo?: Record<string, unknown>;
}
