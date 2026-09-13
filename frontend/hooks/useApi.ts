import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { PaginatedResponse } from '@/types/models';

export function useGenericCrud<T, C, U>(endpoint: string, queryKey: string) {
  const queryClient = useQueryClient();

  const useGetAll = (skip: number = 0, limit: number = 100) => {
    return useQuery<PaginatedResponse<T>>({
      queryKey: [queryKey, { skip, limit }],
      queryFn: async () => {
        const response = await api.get(`${endpoint}?skip=${skip}&limit=${limit}`);
        return response.data;
      }
    });
  };

  const useGetOne = (id: number) => {
    return useQuery<T>({
      queryKey: [queryKey, id],
      queryFn: async () => {
        const response = await api.get(`${endpoint}/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  const useCreate = () => {
    return useMutation({
      mutationFn: async (data: C) => {
        const response = await api.post(endpoint, data);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  const useUpdate = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: U }) => {
        const response = await api.put(`${endpoint}/${id}`, data);
        return response.data;
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        queryClient.invalidateQueries({ queryKey: [queryKey, variables.id] });
      },
    });
  };

  const useSoftDelete = () => {
    return useMutation({
      mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
        const queryParams = reason ? `?reason=${encodeURIComponent(reason)}` : '';
        const response = await api.delete(`${endpoint}/${id}${queryParams}`);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  return {
    useGetAll,
    useGetOne,
    useCreate,
    useUpdate,
    useSoftDelete,
  };
}
