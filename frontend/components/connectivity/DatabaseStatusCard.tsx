'use client';

import React from 'react';
import { Database, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useHealthCheck } from '@/hooks/useHealthCheck';

export function DatabaseStatusCard() {
  const { data, isLoading, isError } = useHealthCheck(10000);

  const db = data?.database;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>PostgreSQL Relational Engine</CardTitle>
            <CardDescription>SQLAlchemy 2.0 ORM session connection state</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-sm text-slate-500 flex items-center justify-center p-4">
            Testing DB pool connection...
          </div>
        ) : isError || !db ? (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <span>Database Status Unknown</span>
            </div>
            <p className="text-xs text-rose-700 mt-1">Backend service must be active to perform DB ping.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">DB Connection</span>
                <Badge variant={db.connected ? 'success' : 'danger'}>
                  {db.connected ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Ping Latency</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {db.latency_ms} ms
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Dialect / Driver</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono capitalize">
                  {db.dialect}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">ORM Pool Check</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Pre-Ping Active
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Diagnostic Log:</span>
              <p className="font-mono text-slate-600 dark:text-slate-400">{db.message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
