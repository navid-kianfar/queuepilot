import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kafkaApi } from '../endpoints/kafka';

const keys = {
  overview: (c: number) => ['kafka', c, 'overview'] as const,
  topics: (c: number) => ['kafka', c, 'topics'] as const,
  topic: (c: number, n: string) => ['kafka', c, 'topic', n] as const,
  groups: (c: number) => ['kafka', c, 'groups'] as const,
  group: (c: number, g: string) => ['kafka', c, 'group', g] as const,
  brokers: (c: number) => ['kafka', c, 'brokers'] as const,
};

export function useKafkaOverview(connId: number) {
  return useQuery({ queryKey: keys.overview(connId), queryFn: () => kafkaApi.getOverview(connId), refetchInterval: 10000 });
}
export function useKafkaTopics(connId: number) {
  return useQuery({ queryKey: keys.topics(connId), queryFn: () => kafkaApi.getTopics(connId) });
}
export function useKafkaTopic(connId: number, name: string) {
  return useQuery({ queryKey: keys.topic(connId, name), queryFn: () => kafkaApi.getTopic(connId, name), enabled: !!name });
}
export function useKafkaConsumerGroups(connId: number) {
  return useQuery({ queryKey: keys.groups(connId), queryFn: () => kafkaApi.getConsumerGroups(connId), refetchInterval: 5000 });
}
export function useKafkaConsumerGroup(connId: number, groupId: string) {
  return useQuery({ queryKey: keys.group(connId, groupId), queryFn: () => kafkaApi.getConsumerGroup(connId, groupId), enabled: !!groupId });
}
export function useKafkaBrokers(connId: number) {
  return useQuery({ queryKey: keys.brokers(connId), queryFn: () => kafkaApi.getBrokers(connId) });
}

export function useKafkaCreateTopic(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: any) => kafkaApi.createTopic(connId, data), onSuccess: () => qc.invalidateQueries({ queryKey: keys.topics(connId) }) });
}
export function useKafkaDeleteTopic(connId: number) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (name: string) => kafkaApi.deleteTopic(connId, name), onSuccess: () => qc.invalidateQueries({ queryKey: keys.topics(connId) }) });
}
export function useKafkaBrowseMessages(connId: number) {
  return useMutation({ mutationFn: (data: any) => kafkaApi.browseMessages(connId, data) });
}
export function useKafkaProduceMessage(connId: number) {
  return useMutation({ mutationFn: (data: any) => kafkaApi.produceMessage(connId, data) });
}
export function useKafkaResetOffsets(connId: number) {
  return useMutation({ mutationFn: ({ groupId, ...data }: any) => kafkaApi.resetOffsets(connId, groupId, data) });
}
