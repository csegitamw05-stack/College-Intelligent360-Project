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
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Award,
  BookOpen,
  Cpu,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function PrincipalDashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', 'principal'],
    queryFn: async () => {
      const response = await api.get('/dashboard/principal');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Institutional Digital Twin Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="m-4">
        Failed to load principal dashboard: {(error as any).message}
      </Alert>
    );
  }

  const dt = data?.digital_twin || {};
  const depts = data?.department_comparison || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Executive Decision Support
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> Real-Time Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Institutional Digital Twin</h1>
          <p className="text-slate-300 text-sm mt-1">
            Welcome back, <span className="font-semibold text-white">{data?.user?.full_name}</span> ({data?.user?.role})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/simulator">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-600/30">
              <Cpu className="h-4 w-4" /> Run What-If Simulator
            </Button>
          </Link>
          <Link href="/modules">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 gap-2">
              Explore 9 Modules <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Enrollment</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{dt.total_students || 0}</h3>
                <p className="text-xs text-slate-500 mt-1">{dt.total_faculty || 0} Active Faculty Members</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Attendance</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{dt.average_attendance || 0}%</h3>
                <p className="text-xs text-emerald-600 font-medium mt-1">Live Student Telemetry</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Academic CGPA</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{dt.average_cgpa || 0} / 10.0</h3>
                <p className="text-xs text-amber-600 font-medium mt-1">Institutional Academic Index</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Early Warning Risk</p>
                <h3 className="text-3xl font-bold text-rose-600 mt-1">
                  {(dt.high_risk_students || 0) + (dt.medium_risk_students || 0)}
                </h3>
                <p className="text-xs text-rose-500 font-medium mt-1">{dt.high_risk_students || 0} High Risk Students</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Digital Twin Health Index & Strategic KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" /> Departmental Intelligence Comparison
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono">Real-Time Metrics</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-xs font-semibold">
                  <tr>
                    <th className="p-3 rounded-l-lg">Department</th>
                    <th className="p-3">Students</th>
                    <th className="p-3">Avg Attendance</th>
                    <th className="p-3">Avg CGPA</th>
                    <th className="p-3">At-Risk</th>
                    <th className="p-3 rounded-r-lg">Total Avg Health Score (All Activities)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {depts.map((dept: any) => {
                    const totalScore = dept.total_average_health_score ?? dept.health_index ?? 0;
                    const grade = dept.health_grade || (totalScore >= 80 ? 'A+' : 'A');
                    return (
                      <tr key={dept.department} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {dept.department}
                          {dept.department_name && dept.department_name !== dept.department && (
                            <span className="block text-[10px] text-slate-400 font-normal">{dept.department_name}</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{dept.students}</td>
                        <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{dept.attendance}%</td>
                        <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{dept.cgpa}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${dept.at_risk > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                            {dept.at_risk}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-indigo-700 dark:text-indigo-400 font-mono">
                              {totalScore}%
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                              {grade}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Institutional Health Scorecard */}
        <Card className="shadow-sm bg-gradient-to-br from-slate-900 to-blue-950 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> Digital Twin Health Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center h-28 w-28 rounded-full border-4 border-emerald-400 bg-slate-800/80 shadow-2xl">
                <span className="text-4xl font-extrabold text-emerald-400">
                  {data?.institutional_average_health_score || dt.institutional_health_index || 0}%
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-3 uppercase tracking-wider">
                Overall Campus Average Health Score (All Activities)
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-amber-400" /> Placements Recorded</span>
                <span className="font-bold text-white">{dt.placements_recorded || 0} Students Offered</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-blue-400" /> Research Publications</span>
                <span className="font-bold text-white">{dt.research_publications || 0} Papers Published</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-emerald-400" /> Low Risk Ratio</span>
                <span className="font-bold text-emerald-400">{dt.total_students ? round(((dt.low_risk_students || 0) / dt.total_students) * 100, 1) : 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function round(num: number, decimals: number) {
  return Number(num.toFixed(decimals));
}
