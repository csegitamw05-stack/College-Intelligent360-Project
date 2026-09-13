import api from '@/lib/axios';
import { AuthUser, LoginCredentials, TokenResponse } from '@/types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await api.get<AuthUser>('/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/refresh');
    return response.data;
  },
};
