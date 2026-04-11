import { Injectable } from '@nestjs/common';
import { ConnectionGateway } from '../../connection/connection.gateway';

@Injectable()
export class RabbitmqApiService {
  constructor(private gateway: ConnectionGateway) {}

  private async client(connectionId: number) {
    return this.gateway.getRabbitMQClient(connectionId);
  }

  // Overview
  async getOverview(connId: number) {
    const c = await this.client(connId);
    const { data } = await c.get('/overview');
    return data;
  }

  async getNodes(connId: number) {
    const c = await this.client(connId);
    const { data } = await c.get('/nodes');
    return data;
  }

  // Exchanges
  async getExchanges(connId: number, vhost?: string) {
    const c = await this.client(connId);
    const url = vhost ? `/exchanges/${encodeURIComponent(vhost)}` : '/exchanges';
    const { data } = await c.get(url);
    return data;
  }

  async getExchange(connId: number, vhost: string, name: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`);
    return data;
  }

  async createExchange(connId: number, vhost: string, name: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.put(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`, body);
    return data;
  }

  async deleteExchange(connId: number, vhost: string, name: string) {
    const c = await this.client(connId);
    await c.delete(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`);
    return { deleted: true };
  }

  async publishMessage(connId: number, vhost: string, exchange: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.post(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(exchange)}/publish`, body);
    return data;
  }

  // Queues
  async getQueues(connId: number, vhost?: string) {
    const c = await this.client(connId);
    const url = vhost ? `/queues/${encodeURIComponent(vhost)}` : '/queues';
    const { data } = await c.get(url);
    return data;
  }

  async getQueue(connId: number, vhost: string, name: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`);
    return data;
  }

  async createQueue(connId: number, vhost: string, name: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.put(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`, body);
    return data;
  }

  async deleteQueue(connId: number, vhost: string, name: string) {
    const c = await this.client(connId);
    await c.delete(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`);
    return { deleted: true };
  }

  async purgeQueue(connId: number, vhost: string, name: string) {
    const c = await this.client(connId);
    await c.delete(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}/contents`);
    return { purged: true };
  }

  async getMessages(connId: number, vhost: string, queue: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.post(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queue)}/get`, body);
    return data;
  }

  // Bindings
  async getBindings(connId: number, vhost?: string) {
    const c = await this.client(connId);
    const url = vhost ? `/bindings/${encodeURIComponent(vhost)}` : '/bindings';
    const { data } = await c.get(url);
    return data;
  }

  async getExchangeBindingsSource(connId: number, vhost: string, exchange: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(exchange)}/bindings/source`);
    return data;
  }

  async getExchangeBindingsDestination(connId: number, vhost: string, exchange: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/exchanges/${encodeURIComponent(vhost)}/${encodeURIComponent(exchange)}/bindings/destination`);
    return data;
  }

  async getQueueBindings(connId: number, vhost: string, queue: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/queues/${encodeURIComponent(vhost)}/${encodeURIComponent(queue)}/bindings`);
    return data;
  }

  async createBinding(connId: number, vhost: string, source: string, destType: string, dest: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.post(`/bindings/${encodeURIComponent(vhost)}/e/${encodeURIComponent(source)}/${destType === 'queue' ? 'q' : 'e'}/${encodeURIComponent(dest)}`, body);
    return data;
  }

  async deleteBinding(connId: number, vhost: string, source: string, destType: string, dest: string, propsKey: string) {
    const c = await this.client(connId);
    await c.delete(`/bindings/${encodeURIComponent(vhost)}/e/${encodeURIComponent(source)}/${destType === 'queue' ? 'q' : 'e'}/${encodeURIComponent(dest)}/${encodeURIComponent(propsKey)}`);
    return { deleted: true };
  }

  // Connections
  async getConnections(connId: number) {
    const c = await this.client(connId);
    const { data } = await c.get('/connections');
    return data;
  }

  async getConnection(connId: number, name: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/connections/${encodeURIComponent(name)}`);
    return data;
  }

  async closeConnection(connId: number, name: string) {
    const c = await this.client(connId);
    await c.delete(`/connections/${encodeURIComponent(name)}`);
    return { closed: true };
  }

  // Channels
  async getChannels(connId: number) {
    const c = await this.client(connId);
    const { data } = await c.get('/channels');
    return data;
  }

  async getChannel(connId: number, name: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/channels/${encodeURIComponent(name)}`);
    return data;
  }

  // Vhosts
  async getVhosts(connId: number) {
    const c = await this.client(connId);
    const { data } = await c.get('/vhosts');
    return data;
  }

  async getVhost(connId: number, name: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/vhosts/${encodeURIComponent(name)}`);
    return data;
  }

  async createVhost(connId: number, name: string, body?: any) {
    const c = await this.client(connId);
    const { data } = await c.put(`/vhosts/${encodeURIComponent(name)}`, body || {});
    return data;
  }

  async deleteVhost(connId: number, name: string) {
    const c = await this.client(connId);
    await c.delete(`/vhosts/${encodeURIComponent(name)}`);
    return { deleted: true };
  }

  async getVhostPermissions(connId: number, vhost: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/vhosts/${encodeURIComponent(vhost)}/permissions`);
    return data;
  }

  // Users
  async getUsers(connId: number) {
    const c = await this.client(connId);
    const { data } = await c.get('/users');
    return data;
  }

  async getUser(connId: number, name: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/users/${encodeURIComponent(name)}`);
    return data;
  }

  async createUser(connId: number, name: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.put(`/users/${encodeURIComponent(name)}`, body);
    return data;
  }

  async deleteUser(connId: number, name: string) {
    const c = await this.client(connId);
    await c.delete(`/users/${encodeURIComponent(name)}`);
    return { deleted: true };
  }

  async getUserPermissions(connId: number, user: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/users/${encodeURIComponent(user)}/permissions`);
    return data;
  }

  async setPermission(connId: number, vhost: string, user: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.put(`/permissions/${encodeURIComponent(vhost)}/${encodeURIComponent(user)}`, body);
    return data;
  }

  async deletePermission(connId: number, vhost: string, user: string) {
    const c = await this.client(connId);
    await c.delete(`/permissions/${encodeURIComponent(vhost)}/${encodeURIComponent(user)}`);
    return { deleted: true };
  }

  // Policies
  async getPolicies(connId: number, vhost?: string) {
    const c = await this.client(connId);
    const url = vhost ? `/policies/${encodeURIComponent(vhost)}` : '/policies';
    const { data } = await c.get(url);
    return data;
  }

  async getPolicy(connId: number, vhost: string, name: string) {
    const c = await this.client(connId);
    const { data } = await c.get(`/policies/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`);
    return data;
  }

  async createPolicy(connId: number, vhost: string, name: string, body: any) {
    const c = await this.client(connId);
    const { data } = await c.put(`/policies/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`, body);
    return data;
  }

  async deletePolicy(connId: number, vhost: string, name: string) {
    const c = await this.client(connId);
    await c.delete(`/policies/${encodeURIComponent(vhost)}/${encodeURIComponent(name)}`);
    return { deleted: true };
  }

  // Definitions
  async getDefinitions(connId: number, vhost?: string) {
    const c = await this.client(connId);
    const url = vhost ? `/definitions/${encodeURIComponent(vhost)}` : '/definitions';
    const { data } = await c.get(url);
    return data;
  }

  async importDefinitions(connId: number, body: any, vhost?: string) {
    const c = await this.client(connId);
    const url = vhost ? `/definitions/${encodeURIComponent(vhost)}` : '/definitions';
    const { data } = await c.post(url, body);
    return data;
  }

  // Consumers
  async getConsumers(connId: number, vhost?: string) {
    const c = await this.client(connId);
    const url = vhost ? `/consumers/${encodeURIComponent(vhost)}` : '/consumers';
    const { data } = await c.get(url);
    return data;
  }
}
