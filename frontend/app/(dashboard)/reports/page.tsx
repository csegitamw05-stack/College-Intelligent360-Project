'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  FileSpreadsheet,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Filter
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'department_performance', name: '1. Department Performance Report' },
  { id: 'attendance', name: '2. Attendance Report' },
  { id: 'student_risk', name: '3. Student Risk Report' },
  { id: 'academic_performance', name: '4. Academic Performance Report' },
  { id: 'faculty_development', name: '5. Faculty Development Report' },
  { id: 'research', name: '6. Research Report' },
  { id: 'placement_readiness', name: '7. Placement Readiness Report' },
  { id: 'institutional_intelligence', name: '8. Institutional Intelligence Report' }
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>('department_performance');
  const [department, setDepartment] = useState<string>('CSE');

  const { data, isLoading, error } = useQuery({
    queryKey: ['report_preview', reportType, department],
    queryFn: async () => {
      const response = await api.get(`/reports/generate?report_type=${reportType}&department=${department}`);
      return response.data;
    }
  });

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const response = await api.get(`/reports/export?report_type=${reportType}&export_format=${format}&department=${department}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_${department}_${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(`Export Failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  const headers = data?.headers || [];
  const rows = data?.rows || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Institutional Reports Station
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> RBAC Department Access Enforced
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Institutional Intelligence Reports</h1>
          <p className="text-slate-300 text-sm mt-1">
            Generate and export official reports in CSV, Excel (XLSX), or PDF formats grounded in real SQL records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 gap-1 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button onClick={() => handleExport('xlsx')} variant="outline" className="border-emerald-700/60 text-emerald-300 hover:bg-emerald-950/60 gap-1 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Excel
          </Button>
          <Button onClick={() => handleExport('pdf')} className="bg-blue-600 hover:bg-blue-500 text-white gap-1 text-xs shadow-lg shadow-blue-600/30">
            <Download className="h-3.5 w-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Controls & Filter Panel */}
      <Card className="shadow-md border-t-4 border-t-blue-600">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_TYPES.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Department Filter Scope</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="CSE">CSE - Computer Science & Engineering</option>
              <option value="ECE">ECE - Electronics & Communication</option>
              <option value="ME">ME - Mechanical Engineering</option>
              <option value="IT">IT - Information Technology</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" /> {data?.report_title || 'Report Preview'}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Generated for <span className="font-semibold text-slate-700">{department} Scope</span> &bull; {data?.total_rows || 0} Records
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono">{data?.context_marker || 'Based on SQL records'}</Badge>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Querying report telemetry...</div>
          ) : error ? (
            <Alert variant="error">Failed to generate report: {(error as any).message}</Alert>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No records found for this report configuration.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                  <tr>
                    {headers.map((h: string) => (
                      <th key={h} className="p-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row: any[], rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      {row.map((cell: any, cIdx: number) => (
                        <td key={cIdx} className="p-3 text-slate-800 font-medium">
                          {String(cell)}
                        </td>
                      ))}
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
