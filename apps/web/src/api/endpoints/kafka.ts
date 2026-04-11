import { api } from '../client';

const base = (connId: number) => `/connections/${connId}/kafka`;

export const kafkaApi = {
  getOverview: (connId: number) =>
    api.get(`${base(connId)}/overview`).then((r) => r.data),
  getTopics: (connId: number) =>
    api.get(`${base(connId)}/topics`).then((r) => r.data),
  getTopic: (connId: number, name: string) =>
    api.get(`${base(connId)}/topics/${encodeURIComponent(name)}`).then((r) => r.data),
  createTopic: (connId: number, data: any) =>
    api.post(`${base(connId)}/topics`, data).then((r) => r.data),
  deleteTopic: (connId: number, name: string) =>
    api.delete(`${base(connId)}/topics/${encodeURIComponent(name)}`).then((r) => r.data),
  getConsumerGroups: (connId: number) =>
    api.get(`${base(connId)}/consumer-groups`).then((r) => r.data),
  getConsumerGroup: (connId: number, groupId: string) =>
    api.get(`${base(connId)}/consumer-groups/${encodeURIComponent(groupId)}`).then((r) => r.data),
  resetOffsets: (connId: number, groupId: string, data: any) =>
    api.post(`${base(connId)}/consumer-groups/${encodeURIComponent(groupId)}/reset-offsets`, data).then((r) => r.data),
  browseMessages: (connId: number, data: any) =>
    api.post(`${base(connId)}/messages/browse`, data).then((r) => r.data),
  produceMessage: (connId: number, data: any) =>
    api.post(`${base(connId)}/messages/produce`, data).then((r) => r.data),
  getBrokers: (connId: number) =>
    api.get(`${base(connId)}/brokers`).then((r) => r.data),
};
