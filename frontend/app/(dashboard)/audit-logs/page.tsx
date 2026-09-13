'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Activity, User, Lock, Key, FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      const response = await api.get('/system/audit-logs');
      return response.data;
    }
  });

  const logs = data?.audit_logs || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Security Compliance Log
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> Immutable Audit Trail
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Audit Logs</h1>
          <p className="text-slate-300 text-sm mt-1">
            Real-time security auditing tracking authentication, data imports, predictions, report generations, and RBAC events.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" /> Sanitized Security Event Logs
          </CardTitle>
          <Badge variant="outline" className="text-xs">{logs.length} Recent Events</Badge>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Querying security audit logs...</div>
          ) : error ? (
            <Alert variant="error">Failed to load audit logs: {(error as any).message}</Alert>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No security audit logs recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                  <tr>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Actor ID</th>
                    <th className="p-3">Entity Type</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        <span className={`px-2 py-0.5 rounded ${log.action.includes('SUCCESS') || log.action.includes('QUERY') ? 'bg-blue-100 text-blue-800' : (log.action.includes('FAILED') || log.action.includes('UNAUTHORIZED') ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800')}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{log.actor_id || 'System'}</td>
                      <td className="p-3 text-slate-600">{log.entity_type || 'N/A'}</td>
                      <td className="p-3 text-slate-500 max-w-md truncate" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                      </td>
                      <td className="p-3 text-slate-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
