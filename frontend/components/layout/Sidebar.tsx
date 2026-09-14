'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  ShieldAlert,
  BarChart3,
  Award,
  BookOpen,
  UserCheck,
  Briefcase,
  Beaker,
  Calendar,
  UploadCloud,
  BrainCircuit,
  FileSpreadsheet,
  ShieldCheck,
  Settings,
  Users,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  userRole?: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const primaryItems = [
    { name: 'System Connectivity', href: '/', icon: Activity },
    { name: 'Principal Dashboard', href: '/principal', icon: BarChart3, roles: [UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN] },
    { name: 'HOD Dashboard', href: '/hod', icon: Layers, roles: [UserRole.HOD, UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN] },
    { name: 'Incharge Dashboard', href: '/incharge', icon: UserCheck, roles: [UserRole.INCHARGE, UserRole.HOD, UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN] },
    { name: 'AI Early Warning (SHAP)', href: '/early-warning', icon: BrainCircuit, badge: 'Scikit-Learn' },
    { name: 'Digital Twin & Simulator', href: '/simulator', icon: Cpu, badge: 'AI Engine' },
    { name: 'Data Upload & Import', href: '/files', icon: UploadCloud, badge: 'Ingestion' },
    { name: 'Institutional Reports', href: '/reports', icon: FileSpreadsheet, badge: 'PDF/XLS' },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck, roles: [UserRole.PRINCIPAL, UserRole.HOD, UserRole.SYSTEM_ADMIN] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: [UserRole.PRINCIPAL, UserRole.SYSTEM_ADMIN] },
  ];

  const domainModules = [
    { name: '1. Attendance', href: '/modules?module=attendance', icon: CheckCircle2 },
    { name: '2. Academic Perf', href: '/modules?module=academics', icon: TrendingUp },
    { name: '3. Assessments', href: '/modules?module=assessments', icon: BarChart3 },
    { name: '4. Student Engagement', href: '/modules?module=engagement', icon: UserCheck },
    { name: '5. Faculty Activities', href: '/modules?module=faculty_activities', icon: Briefcase },
    { name: '6. Labs Performance', href: '/modules?module=labs', icon: Beaker },
    { name: '7. Events', href: '/modules?module=events', icon: Calendar },
    { name: '8. Placements', href: '/modules?module=placements', icon: Award },
    { name: '9. Research', href: '/modules?module=research', icon: BookOpen },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="py-4 px-3 space-y-4">
        <div>
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Control Center
          </div>
          <div className="space-y-0.5 mt-1">
            {primaryItems.map((item) => {
              if (item.roles && userRole && !item.roles.includes(userRole)) {
                return null;
              }
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all group',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>9 Core Modules</span>
            <span className="text-[9px] text-emerald-400 font-mono">100% Synced</span>
          </div>
          <div className="space-y-0.5 mt-1">
            {domainModules.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.name}
                  href={m.href}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded-md transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-slate-500" />
                  <span>{m.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 space-y-3">
        {user && (
          <div className="rounded-lg bg-slate-800/90 p-2.5 border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-blue-400 font-mono">{user.email}</p>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">
                {user.role}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        <div className="rounded-lg bg-slate-800/50 p-2 text-xs border border-slate-700/30">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
            <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px]">Zero Mock Data Enforced</span>
          </div>
          <p className="text-slate-400 text-[9px] leading-tight">
            Telemetry calculated live via SQL & Analytics engine.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
