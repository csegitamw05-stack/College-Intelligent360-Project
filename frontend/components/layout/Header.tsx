'use client';

import React from 'react';
import { ShieldCheck, Activity, GraduationCap, LogOut, Sun, Moon, User } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Header() {
  const { data, isError, isLoading } = useHealthCheck(15000);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              CAMPUS INTELLIGENCE 360
            </h1>
            <span className="hidden lg:inline-block text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              v1.0.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden xl:block">
            AI-Powered Digital Twin & Early-Warning Decision Support System
          </p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3 md:gap-4">
        {/* Backend Status Badge */}
        <div className="hidden sm:block">
          {getStatusBadge()}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all shadow-sm"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Active User Info & Sign Out */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                {user.full_name}
              </span>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {user.role}
                </span>
                {user.department && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({user.department})
                  </span>
                )}
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => logout()}
              title="Sign Out of Session"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50 dark:hover:bg-rose-900/60 transition-all shadow-sm active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
