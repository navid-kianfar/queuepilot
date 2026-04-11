import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rabbitmqApi } from '../endpoints/rabbitmq';

const keys = {
  overview: (c: number) => ['rmq', c, 'overview'] as const,
  nodes: (c: number) => ['rmq', c, 'nodes'] as const,
  exchanges: (c: number) => ['rmq', c, 'exchanges'] as const,
  exchange: (c: number, v: string, n: string) => ['rmq', c, 'exchange', v, n] as const,
  queues: (c: number) => ['rmq', c, 'queues'] as const,
  queue: (c: number, v: string, n: string) => ['rmq', c, 'queue', v, n] as const,
  bindings: (c: number) => ['rmq', c, 'bindings'] as const,
  connections: (c: number) => ['rmq', c, 'connections'] as const,
  channels: (c: number) => ['rmq', c, 'channels'] as const,
  vhosts: (c: number) => ['rmq', c, 'vhosts'] as const,
  users: (c: number) => ['rmq', c, 'users'] as const,
  userPerms: (c: number, u: string) => ['rmq', c, 'user-perms', u] as const,
  policies: (c: number) => ['rmq', c, 'policies'] as const,
  definitions: (c: number) => ['rmq', c, 'definitions'] as const,
};

export function useRmqOverview(connId: number) {
  return useQuery({ queryKey: keys.overview(connId), queryFn: () => rabbitmqApi.getOverview(connId), refetchInterval: 5000 });
}
export function useRmqNodes(connId: number) {
  return useQuery({ queryKey: keys.nodes(connId), queryFn: () => rabbitmqApi.getNodes(connId), refetchInterval: 10000 });
}
export function useRmqExchanges(connId: number) {
  return useQuery({ queryKey: keys.exchanges(connId), queryFn: () => rabbitmqApi.getExchanges(connId) });
}
export function useRmqExchange(connId: number, vhost: string, name: string) {
  return useQuery({ queryKey: keys.exchange(connId, vhost, name), queryFn: () => rabbitmqApi.getExchange(connId, vhost, name), enabled: !!name });
}
export function useRmqQueues(connId: number) {
  return useQuery({ queryKey: keys.queues(connId), queryFn: () => rabbitmqApi.getQueues(connId), refetchInterval: 5000 });
}
export function useRmqQueue(connId: number, vhost: string, name: string) {
  return useQuery({ queryKey: keys.queue(connId, vhost, name), queryFn: () => rabbitmqApi.getQueue(connId, vhost, name), enabled: !!name, refetchInterval: 5000 });
}
export function useRmqQueueByName(connId: number, name: string, vhost: string) {
  return useQuery({ queryKey: keys.queue(connId, vhost, name), queryFn: () => rabbitmqApi.getQueueByName(connId, name, vhost), enabled: !!name, refetchInterval: 3000 });
}
export function useRmqBindings(connId: number) {
  return useQuery({ queryKey: keys.bindings(connId), queryFn: () => rabbitmqApi.getBindings(connId) });
}
export function useRmqConnections(connId: number) {
  return useQuery({ queryKey: keys.connections(connId), queryFn: () => rabbitmqApi.getConnections(connId), refetchInterval: 5000 });
}
export function useRmqChannels(connId: number) {
  return useQuery({ queryKey: keys.channels(connId), queryFn: () => rabbitmqApi.getChannels(connId), refetchInterval: 5000 });
}
export function useRmqVhosts(connId: number) {
  return useQuery({ queryKey: keys.vhosts(connId), queryFn: () => rabbitmqApi.getVhosts(connId) });
}
export function useRmqUsers(connId: number) {
  return useQuery({ queryKey: keys.users(connId), queryFn: () => rabbitmqApi.getUsers(connId) });
}
export function useRmqUserPermissions(connId: number, user: string) {
  return useQuery({ queryKey: keys.userPerms(connId, user), queryFn: () => rabbitmqApi.getUserPermissions(connId, user), enabled: !!user });
}
export function useRmqPolicies(connId: number) {
  return useQuery({ queryKey: keys.policies(connId), queryFn: () => rabbitmqApi.getPolicies(connId) });
}
export function useRmqDefinitions(connId: number) {
  return useQuery({ queryKey: keys.definitions(connId), queryFn: () => rabbitmqApi.getDefinitions(connId), enabled: false });
}

// Mutations
export function useRmqCreateExchange(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => rabbitmqApi.createExchange(connId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.exchanges(connId) }) });
}
export function useRmqDeleteExchange(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ vhost, name }: { vhost: string; name: string }) => rabbitmqApi.deleteExchange(connId, vhost, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.exchanges(connId) }) });
}
export function useRmqPublishMessage(connId: number) {
  return useMutation({ mutationFn: ({ vhost, exchange, data }: { vhost: string; exchange: string; data: any }) => rabbitmqApi.publishMessage(connId, vhost, exchange, data) });
}
export function useRmqCreateQueue(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => rabbitmqApi.createQueue(connId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.queues(connId) }) });
}
export function useRmqDeleteQueue(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ vhost, name }: { vhost: string; name: string }) => rabbitmqApi.deleteQueue(connId, vhost, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.queues(connId) }) });
}
export function useRmqPurgeQueue(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ vhost, name }: { vhost: string; name: string }) => rabbitmqApi.purgeQueue(connId, vhost, name), onSuccess: (_, { vhost, name }) => qc.invalidateQueries({ queryKey: keys.queue(connId, vhost, name) }) });
}
export function useRmqGetMessages(connId: number) {
  return useMutation({ mutationFn: ({ vhost, queue, data }: { vhost: string; queue: string; data: any }) => rabbitmqApi.getMessages(connId, vhost, queue, data) });
}
export function useRmqCreateBinding(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => rabbitmqApi.createBinding(connId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.bindings(connId) }) });
}
export function useRmqCloseConnection(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (name: string) => rabbitmqApi.closeConnection(connId, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.connections(connId) }) });
}
export function useRmqCreateVhost(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => rabbitmqApi.createVhost(connId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.vhosts(connId) }) });
}
export function useRmqDeleteVhost(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (name: string) => rabbitmqApi.deleteVhost(connId, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.vhosts(connId) }) });
}
export function useRmqCreateUser(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => rabbitmqApi.createUser(connId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.users(connId) }) });
}
export function useRmqDeleteUser(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (name: string) => rabbitmqApi.deleteUser(connId, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.users(connId) }) });
}
export function useRmqCreatePolicy(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => rabbitmqApi.createPolicy(connId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.policies(connId) }) });
}
export function useRmqDeletePolicy(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ vhost, name }: { vhost: string; name: string }) => rabbitmqApi.deletePolicy(connId, vhost, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.policies(connId) }) });
}
