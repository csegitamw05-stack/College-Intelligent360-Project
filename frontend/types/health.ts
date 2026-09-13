export interface DatabaseHealthStatus {
  connected: boolean;
  latency_ms: number;
  dialect: string;
  message: string;
}

export interface SystemHealthResponse {
  status: 'ok' | 'degraded' | 'error';
  project_name: string;
  version: string;
  environment: string;
  timestamp: number;
  database: DatabaseHealthStatus;
}
