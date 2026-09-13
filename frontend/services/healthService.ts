import apiClient from '@/lib/axios';
import { SystemHealthResponse } from '@/types/health';

export const healthService = {
  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const response = await apiClient.get<SystemHealthResponse>('/health');
    return response.data;
  },
};
