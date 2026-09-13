'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, LoginCredentials } from '@/types/auth';
import { authService } from '@/services/authService';
import Cookies from 'js-cookie';
import api from '@/lib/axios';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('access_token');
      if (token) {
        // Set default header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          // Token might be expired, interceptor will try to refresh it
          // or we just clear state
          console.error('Failed to load user', error);
          Cookies.remove('access_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      Cookies.set('access_token', response.access_token, {
        expires: new Date(new Date().getTime() + response.expires_in * 1000),
      });
      api.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
      
      const userData = await authService.getMe();
      setUser(userData);
      
      // Redirect based on role
      switch(userData.role) {
        case 'PRINCIPAL':
          router.push('/principal');
          break;
        case 'HOD':
          router.push('/hod');
          break;
        case 'INCHARGE':
          router.push('/incharge');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        default:
          router.push('/');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      Cookies.remove('access_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
