'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PageContainer from '@/components/layout/PageContainer';
import AIAssistantWidget from '@/components/ui/AIAssistantWidget';
import { UserRole } from '@/types/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={user.role as UserRole} />
        <main className="flex-1 overflow-y-auto">
          <PageContainer>
            {children}
          </PageContainer>
        </main>
      </div>

      {/* Floating AI-HOD Assistant for authorized users */}
      {(user.role === UserRole.PRINCIPAL || user.role === UserRole.HOD || user.role === UserRole.SYSTEM_ADMIN) && (
        <AIAssistantWidget />
      )}
    </div>
  );
}
