import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsApi } from '../endpoints/connections';
import type {
  CreateConnectionDto,
  UpdateConnectionDto,
  TestConnectionDto,
} from '@queuepilot/shared';

export const connectionKeys = {
  all: ['connections'] as const,
  detail: (id: number) => ['connections', id] as const,
};

export function useConnections() {
  return useQuery({
    queryKey: connectionKeys.all,
    queryFn: connectionsApi.getAll,
  });
}

export function useConnection(id: number) {
  return useQuery({
    queryKey: connectionKeys.detail(id),
    queryFn: () => connectionsApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateConnectionDto) => connectionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConnectionDto }) =>
      connectionsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      queryClient.invalidateQueries({ queryKey: connectionKeys.detail(id) });
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => connectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (data: TestConnectionDto) => connectionsApi.test(data),
  });
}
