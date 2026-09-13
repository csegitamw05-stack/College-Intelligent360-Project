'use client';

import React from 'react';
import { ShieldCheck, Activity, GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useHealthCheck } from '@/hooks/useHealthCheck';

export function Header() {
  const { data, isError, isLoading } = useHealthCheck(15000);

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="outline" className="animate-pulse flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          Checking System...
        </Badge>
      );
    }
    if (isError || !data) {
      return (
        <Badge variant="danger" className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          Backend Offline
        </Badge>
      );
    }
    if (data.status === 'ok') {
      return (
        <Badge variant="success" className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          API Connected
        </Badge>
      );
    }
    return (
      <Badge variant="warning" className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
        Degraded Status
      </Badge>
    );
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-slate-200 bg-white/95 px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white font-bold shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              CAMPUS INTELLIGENCE 360
            </h1>
            <span className="hidden md:inline-block text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            AI-Powered Digital Twin & Early-Warning Decision Support System
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {getStatusBadge()}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-4">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          <span>Role Authorization Enforced</span>
        </div>
      </div>
    </header>
  );
}
