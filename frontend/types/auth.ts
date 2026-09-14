export const UserRole = {
  PRINCIPAL: 'PRINCIPAL' as const,
  HOD: 'HOD' as const,
  INCHARGE: 'INCHARGE' as const,
  SYSTEM_ADMIN: 'SYSTEM_ADMIN' as const,
  ADMIN: 'ADMIN' as const,
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string | null;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
