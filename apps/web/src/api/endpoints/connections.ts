import { api } from '../client';
import type {
  ServerConnection,
  CreateConnectionDto,
  UpdateConnectionDto,
  TestConnectionDto,
  TestConnectionResult,
} from '@queuepilot/shared';

export const connectionsApi = {
  getAll: () => api.get<ServerConnection[]>('/connections').then((r) => r.data),

  getOne: (id: number) =>
    api.get<ServerConnection>(`/connections/${id}`).then((r) => r.data),

  create: (data: CreateConnectionDto) =>
    api.post<ServerConnection>('/connections', data).then((r) => r.data),

  update: (id: number, data: UpdateConnectionDto) =>
    api.put<ServerConnection>(`/connections/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/connections/${id}`).then((r) => r.data),

  test: (data: TestConnectionDto) =>
    api.post<TestConnectionResult>('/connections/test', data).then((r) => r.data),
};
