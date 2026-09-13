'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  TrendingUp,
  FileCheck,
  UserCheck,
  Briefcase,
  Beaker,
  Calendar,
  Award,
  BookOpen,
  Search,
  Filter,
  Layers,
  Database
} from 'lucide-react';

const MODULES_LIST = [
  { id: 'attendance', name: '1. Attendance', icon: CheckCircle2, endpoint: '/modules/attendance' },
  { id: 'academics', name: '2. Academic Perf', icon: TrendingUp, endpoint: '/modules/academics' },
  { id: 'assessments', name: '3. Assessments', icon: FileCheck, endpoint: '/modules/assessments' },
  { id: 'engagement', name: '4. Student Engagement', icon: UserCheck, endpoint: '/modules/engagement' },
  { id: 'faculty_activities', name: '5. Faculty Activities', icon: Briefcase, endpoint: '/modules/faculty-activities' },
  { id: 'labs', name: '6. Labs Performance', icon: Beaker, endpoint: '/modules/labs' },
  { id: 'events', name: '7. Events', icon: Calendar, endpoint: '/modules/events' },
  { id: 'placements', name: '8. Placements', icon: Award, endpoint: '/modules/placements' },
  { id: 'research', name: '9. Research', icon: BookOpen, endpoint: '/modules/research' },
];

export default function ModulesExplorerPage() {
  const searchParams = useSearchParams();
  const initialModule = searchParams.get('module') || 'attendance';
  const [activeModule, setActiveModule] = useState<string>(initialModule);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const currentMod = MODULES_LIST.find((m) => m.id === activeModule) || MODULES_LIST[0];

  const { data, isLoading, error } = useQuery({
    queryKey: ['module', activeModule],
    queryFn: async () => {
      const response = await api.get(currentMod.endpoint);
      return response.data;
    },
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Institutional Data Repository
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <Database className="h-3.5 w-3.5" /> Zero Mock Data Policy
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">9 Core Modules Explorer</h1>
          <p className="text-slate-300 text-sm mt-1">
            Browse and query institutional records dynamically calculated from SQL database tables.
          </p>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/80 rounded-xl">
        {MODULES_LIST.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-300 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{m.name}</span>
            </button>
          );
        })}
      </div>

      {/* Module Content & Search */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <currentMod.icon className="h-6 w-6 text-indigo-600" /> {data?.module || currentMod.name}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">Live Database Record Telemetry</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-xs text-slate-500">Querying database records...</p>
            </div>
          ) : error ? (
            <Alert variant="error">Failed to load module data: {(error as any).message}</Alert>
          ) : (
            <RenderModuleData activeModule={activeModule} data={data} searchTerm={searchTerm} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RenderModuleData({ activeModule, data, searchTerm }: { activeModule: string; data: any; searchTerm: string }) {
  if (!data) return <div>No data available</div>;

  const term = searchTerm.toLowerCase();

  // 1. Attendance
  if (activeModule === 'attendance') {
    const logs = (data.recent_logs || []).filter((l: any) =>
      l.student_name.toLowerCase().includes(term) || l.subject_name.toLowerCase().includes(term)
    );
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Attendance Logs</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{data.total_records}</h4>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-700 uppercase">Present Count</p>
            <h4 className="text-2xl font-bold text-emerald-800 mt-1">{data.present_count}</h4>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-xs font-semibold text-rose-700 uppercase">Absent Count</p>
            <h4 className="text-2xl font-bold text-rose-800 mt-1">{data.absent_count}</h4>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase">Attendance Rate</p>
            <h4 className="text-2xl font-bold text-blue-800 mt-1">{data.average_attendance_rate}%</h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Enrollment</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{l.student_name}</td>
                  <td className="p-3 text-slate-600 font-mono text-xs">{l.enrollment_number}</td>
                  <td className="p-3 text-slate-600">{l.subject_name}</td>
                  <td className="p-3 text-slate-500 font-mono text-xs">{l.date}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${l.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. Academics
  if (activeModule === 'academics') {
    const recs = (data.records || []).filter((r: any) => r.student_name.toLowerCase().includes(term));
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase">Average CGPA</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{data.average_cgpa} / 10.0</h4>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-700 uppercase">Dean's List Count</p>
            <h4 className="text-2xl font-bold text-emerald-800 mt-1">{data.deans_list_count}</h4>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
            <p className="text-xs font-semibold text-rose-700 uppercase">Academic Warnings</p>
            <h4 className="text-2xl font-bold text-rose-800 mt-1">{data.academic_warning_count}</h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Department</th>
                <th className="p-3">Semester</th>
                <th className="p-3">SGPA</th>
                <th className="p-3">CGPA</th>
                <th className="p-3">Academic Honor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recs.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{r.student_name}</td>
                  <td className="p-3 text-slate-600">{r.department}</td>
                  <td className="p-3 text-slate-600">Sem {r.semester}</td>
                  <td className="p-3 font-semibold text-blue-700">{r.sgpa}</td>
                  <td className="p-3 font-bold text-indigo-900">{r.cgpa}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${r.status === "Dean's List" ? 'bg-amber-100 text-amber-800' : (r.status === 'Academic Warning' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700')}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 8. Placements
  if (activeModule === 'placements') {
    const list = (data.placements || []).filter((p: any) => p.company_name.toLowerCase().includes(term) || p.student_name.toLowerCase().includes(term));
    return (
      <div className="space-y-6">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Total Offers Recorded</p>
          <h4 className="text-3xl font-bold text-emerald-800 mt-1">{data.total_offers} Placements</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Department</th>
                <th className="p-3">Company</th>
                <th className="p-3">Package</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{p.student_name}</td>
                  <td className="p-3 text-slate-600">{p.department}</td>
                  <td className="p-3 font-bold text-indigo-900">{p.company_name}</td>
                  <td className="p-3 font-semibold text-emerald-700">{p.package}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Generic fallback renderer for remaining modules (Labs, Events, Research, Assessments, Engagement, Faculty Activities)
  const itemsKey = Object.keys(data).find(k => Array.isArray(data[k])) || '';
  const items = (data[itemsKey] || []).filter((item: any) => JSON.stringify(item).toLowerCase().includes(term));

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
        Total Records Found: {items.length}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
            <tr>
              {items.length > 0 && Object.keys(items[0]).filter(k => k !== 'id').map(key => (
                <th key={key} className="p-3 capitalize">{key.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item: any, idx: number) => (
              <tr key={item.id || idx} className="hover:bg-slate-50">
                {Object.keys(item).filter(k => k !== 'id').map(key => (
                  <td key={key} className="p-3 text-slate-700">
                    {typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
