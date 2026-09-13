import { useQuery } from '@tanstack/react-query';
import { healthService } from '@/services/healthService';
import { SystemHealthResponse } from '@/types/health';

export function useHealthCheck(refetchIntervalMs: number = 10000) {
  return useQuery<SystemHealthResponse, Error>({
    queryKey: ['system-health'],
    queryFn: healthService.getSystemHealth,
    refetchInterval: refetchIntervalMs,
  });
}
