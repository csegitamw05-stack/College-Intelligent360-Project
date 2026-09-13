'use client';

import React from 'react';
import { Server, CheckCircle2, XCircle, Clock, Cpu, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { formatDate } from '@/lib/utils';

export function BackendStatusCard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealthCheck(10000);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>FastAPI REST Service Status</CardTitle>
              <CardDescription>Real-time backend API node health verification</CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            title="Refresh Health Check"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Ping API
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center p-6 text-slate-500 text-sm">
            <RefreshCw className="animate-spin h-5 w-5 mr-2 text-brand-600" />
            Connecting to backend API...
          </div>
        ) : isError || !data ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">
              <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Backend Unreachable</p>
                <p className="text-xs text-rose-700 mt-1">
                  Could not establish REST connection to backend at{' '}
                  <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">
                    {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}
                  </code>
                </p>
                {error && <p className="text-xs font-mono mt-2 text-rose-900">{error.message}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Status</span>
                <Badge variant={data.status === 'ok' ? 'success' : 'warning'}>
                  {data.status.toUpperCase()}
                </Badge>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Environment</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {data.environment}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">API Version</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  v{data.version}
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">Last Checked</span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  {formatDate(data.timestamp)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-900 text-slate-100 p-4 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2">
                <span>GET /api/v1/health Live Payload</span>
                <span className="text-[10px] text-emerald-400 font-bold">200 OK</span>
              </div>
              <pre className="overflow-x-auto text-[11px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
