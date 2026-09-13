'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  CheckCircle2,
  FileCheck,
  UserCheck,
  Activity,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function InchargeDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'incharge'],
    queryFn: async () => {
      const response = await api.get('/dashboard/incharge');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Course Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="m-4">
        Failed to load Incharge dashboard: {(error as any).message}
      </Alert>
    );
  }

  const dt = data?.digital_twin || {};
  const logs = data?.recent_attendance_logs || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
              Class & Module Incharge Access — {data?.department}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> Course Scoped
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faculty Incharge Workstation</h1>
          <p className="text-slate-300 text-sm mt-1">
            Faculty Member: <span className="font-semibold text-white">{data?.user?.full_name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/modules?module=attendance">
            <Button className="bg-teal-600 hover:bg-teal-500 text-white gap-2 shadow-lg shadow-teal-600/30">
              <CheckCircle2 className="h-4 w-4" /> Attendance Module
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-teal-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Department Students</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{dt.total_students || 0}</h3>
                <p className="text-xs text-teal-600 font-medium mt-1">Class Roster</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class Attendance</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{dt.average_attendance || 0}%</h3>
                <p className="text-xs text-emerald-600 font-medium mt-1">Average Present Rate</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Class CGPA Index</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{dt.average_cgpa || 0} / 10.0</h3>
                <p className="text-xs text-blue-600 font-medium mt-1">Academic Score Average</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <FileCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Activity Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" /> Recent Class Attendance Logs
          </CardTitle>
          <Badge variant="outline" className="text-xs">Live Recorded Data</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Student</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{log.student}</td>
                    <td className="p-3 text-slate-600">{log.subject}</td>
                    <td className="p-3 text-slate-500 font-mono text-xs">{log.date}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${log.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : (log.status === 'Absent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
