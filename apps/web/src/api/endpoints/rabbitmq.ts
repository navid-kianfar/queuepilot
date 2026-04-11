import { api } from '../client';

const base = (connId: number) => `/connections/${connId}/rabbitmq`;

export const rabbitmqApi = {
  // Overview
  getOverview: (connId: number) =>
    api.get(`${base(connId)}/overview`).then((r) => r.data),
  getNodes: (connId: number) =>
    api.get(`${base(connId)}/nodes`).then((r) => r.data),

  // Exchanges
  getExchanges: (connId: number, vhost?: string) =>
    api.get(`${base(connId)}/exchanges`, { params: { vhost } }).then((r) => r.data),
  getExchange: (connId: number, vhost: string, name: string) =>
    api.get(`${base(connId)}/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`).then((r) => r.data),
  getExchangeBindingsSource: (connId: number, vhost: string, name: string) =>
    api.get(`${base(connId)}/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}/bindings/source`).then((r) => r.data),
  getExchangeBindingsDestination: (connId: number, vhost: string, name: string) =>
    api.get(`${base(connId)}/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}/bindings/destination`).then((r) => r.data),
  createExchange: (connId: number, data: any) =>
    api.post(`${base(connId)}/exchanges`, data).then((r) => r.data),
  deleteExchange: (connId: number, vhost: string, name: string) =>
    api.delete(`${base(connId)}/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`).then((r) => r.data),
  publishMessage: (connId: number, vhost: string, exchange: string, data: any) =>
    api.post(`${base(connId)}/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(exchange)}/publish`, data).then((r) => r.data),

  // Queues
  getQueues: (connId: number, vhost?: string) =>
    api.get(`${base(connId)}/queues`, { params: { vhost } }).then((r) => r.data),
  getQueue: (connId: number, vhost: string, name: string) =>
    api.get(`${base(connId)}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`).then((r) => r.data),
  getQueueBindings: (connId: number, vhost: string, name: string) =>
    api.get(`${base(connId)}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}/bindings`).then((r) => r.data),
  createQueue: (connId: number, data: any) =>
    api.post(`${base(connId)}/queues`, data).then((r) => r.data),
  deleteQueue: (connId: number, vhost: string, name: string) =>
    api.delete(`${base(connId)}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`).then((r) => r.data),
  purgeQueue: (connId: number, vhost: string, name: string) =>
    api.delete(`${base(connId)}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}/purge`).then((r) => r.data),
  getMessages: (connId: number, vhost: string, queue: string, data: any) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queue)}/get`, data).then((r) => r.data),

  // Detail routes (vhost as query param — clean URLs)
  getQueueByName: (connId: number, name: string, vhost: string) =>
    api.get(`${base(connId)}/queues/detail/${encodeURIComponent(name)}`, { params: { vhost } }).then((r) => r.data),
  getQueueBindingsByName: (connId: number, name: string, vhost: string) =>
    api.get(`${base(connId)}/queues/detail/${encodeURIComponent(name)}/bindings`, { params: { vhost } }).then((r) => r.data),
  downloadMessages: (connId: number, vhost: string, queue: string, count = 1000) =>
    api.post(`${base(connId)}/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queue)}/download`, { count }, { responseType: 'blob' }).then((r) => r.data),

  // Bindings
  getBindings: (connId: number, vhost?: string) =>
    api.get(`${base(connId)}/bindings`, { params: { vhost } }).then((r) => r.data),
  createBinding: (connId: number, data: any) =>
    api.post(`${base(connId)}/bindings`, data).then((r) => r.data),

  // Connections
  getConnections: (connId: number) =>
    api.get(`${base(connId)}/connections`).then((r) => r.data),
  closeConnection: (connId: number, name: string) =>
    api.delete(`${base(connId)}/connections/${encodeURIComponent(name)}`).then((r) => r.data),

  // Channels
  getChannels: (connId: number) =>
    api.get(`${base(connId)}/channels`).then((r) => r.data),

  // Vhosts
  getVhosts: (connId: number) =>
    api.get(`${base(connId)}/vhosts`).then((r) => r.data),
  createVhost: (connId: number, data: any) =>
    api.post(`${base(connId)}/vhosts`, data).then((r) => r.data),
  deleteVhost: (connId: number, name: string) =>
    api.delete(`${base(connId)}/vhosts/${encodeURIComponent(name)}`).then((r) => r.data),
  getVhostPermissions: (connId: number, name: string) =>
    api.get(`${base(connId)}/vhosts/${encodeURIComponent(name)}/permissions`).then((r) => r.data),

  // Users
  getUsers: (connId: number) =>
    api.get(`${base(connId)}/users`).then((r) => r.data),
  createUser: (connId: number, data: any) =>
    api.post(`${base(connId)}/users`, data).then((r) => r.data),
  deleteUser: (connId: number, name: string) =>
    api.delete(`${base(connId)}/users/${encodeURIComponent(name)}`).then((r) => r.data),
  getUserPermissions: (connId: number, name: string) =>
    api.get(`${base(connId)}/users/${encodeURIComponent(name)}/permissions`).then((r) => r.data),
  setPermission: (connId: number, user: string, vhost: string, data: any) =>
    api.put(`${base(connId)}/users/${encodeURIComponent(user)}/permissions/${encodeURIComponent(vhost)}`, data).then((r) => r.data),

  // Policies
  getPolicies: (connId: number, vhost?: string) =>
    api.get(`${base(connId)}/policies`, { params: { vhost } }).then((r) => r.data),
  createPolicy: (connId: number, data: any) =>
    api.post(`${base(connId)}/policies`, data).then((r) => r.data),
  deletePolicy: (connId: number, vhost: string, name: string) =>
    api.delete(`${base(connId)}/policies/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`).then((r) => r.data),

  // Definitions
  getDefinitions: (connId: number, vhost?: string) =>
    api.get(`${base(connId)}/definitions`, { params: { vhost } }).then((r) => r.data),
  importDefinitions: (connId: number, data: any, vhost?: string) =>
    api.post(`${base(connId)}/definitions/import`, data, { params: { vhost } }).then((r) => r.data),
};
