export interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface APIErrorResponse {
  status: string;
  code: number;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  path: string;
}
