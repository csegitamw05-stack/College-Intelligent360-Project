'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Eye, EyeOff, Lock, Mail, Key } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Campus Intelligence 360</h1>
        <p className="text-slate-500 mt-2">Sign in to access your institutional decision dashboard</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="principal@campus.edu"
                  className={`pl-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${
                    errors.email ? 'border-red-500' : 'border-slate-200'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow ${
                    errors.password ? 'border-red-500' : 'border-slate-200'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white shadow-md"
              isLoading={isLoading}
            >
              Sign In to System
            </Button>
          </form>

          {/* Demo Quick-Fill Credentials */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Key className="h-3.5 w-3.5 text-blue-500" /> Demo Quick Login Profiles:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoCredentials('principal@campus.edu')}
                className="p-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-left font-medium transition-colors"
              >
                Principal Role
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('hod_cse@campus.edu')}
                className="p-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded text-left font-medium transition-colors"
              >
                HOD CSE Role
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('incharge_cse@campus.edu')}
                className="p-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded text-left font-medium transition-colors"
              >
                Incharge Role
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin@campus.edu')}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded text-left font-medium transition-colors"
              >
                System Admin
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center">Default Password: <code className="font-mono text-slate-600">Password123!</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
