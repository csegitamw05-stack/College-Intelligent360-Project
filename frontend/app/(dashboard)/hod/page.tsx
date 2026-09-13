'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  AlertTriangle,
  Layers,
  UserCheck,
  Activity,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  BookOpen,
  Beaker,
  Calendar,
  X,
  Filter,
  Flame,
  Search
} from 'lucide-react';

export default function HODDashboard() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<string>('overview');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'hod'],
    queryFn: async () => {
      const response = await api.get('/dashboard/hod');
      return response.data;
    },
  });

  // Query ML Student Risk Profiles for Heatmap
  const { data: mlData } = useQuery({
    queryKey: ['ml_risk_profiles_hod'],
    queryFn: async () => {
      const response = await api.get('/intelligence/ml-risk-profiles');
      return response.data;
    }
  });

  // Query specific Student Risk Profile for Modal
  const { data: studentModalData } = useQuery({
    queryKey: ['student_modal', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      const response = await api.get(`/intelligence/recalculate-risk/${selectedStudentId}`);
      return response.data;
    },
    enabled: !!selectedStudentId
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-sm text-slate-500 font-medium">Loading Department Telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="m-4">
        Failed to load HOD dashboard: {(error as any).message}
      </Alert>
    );
  }

  const dt = data?.digital_twin || {};
  const allProfiles = mlData?.profiles || [];
  const deptCode = data?.department || 'CSE';

  // Filter student profiles for current department & filter selection
  const deptProfiles = allProfiles.filter((p: any) =>
    (p.department_code === deptCode || p.department === deptCode) &&
    (riskFilter === 'ALL' || p.risk_level === riskFilter)
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Department Control Center — {deptCode}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> Departmental Scoped
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">HOD Intelligence Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1">
            Head of Department: <span className="font-semibold text-white">{data?.user?.full_name}</span>
          </p>
        </div>

        {/* Intelligence Tabs Selector */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            9-Section Overview
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'heatmap' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Risk Heatmap
          </button>
        </div>
      </div>

      {/* 9-Section Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-3 text-center">
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-indigo-600 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">1. Health Score</span>
          <span className="text-xl font-extrabold text-indigo-900 mt-1 block">{dt.institutional_health_index || 0} / 100</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-blue-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">2. Academic CGPA</span>
          <span className="text-xl font-extrabold text-blue-900 mt-1 block">{dt.average_cgpa || 0}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-emerald-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">3. Attendance</span>
          <span className="text-xl font-extrabold text-emerald-900 mt-1 block">{dt.average_attendance || 0}%</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-amber-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">4. Engagement</span>
          <span className="text-xl font-extrabold text-amber-900 mt-1 block">Synced</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-teal-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">5. Placements</span>
          <span className="text-xl font-extrabold text-teal-900 mt-1 block">{dt.placements_recorded || 0}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-cyan-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">6. Research</span>
          <span className="text-xl font-extrabold text-cyan-900 mt-1 block">{dt.research_publications || 0}</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-violet-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">7. Faculty Dev</span>
          <span className="text-xl font-extrabold text-violet-900 mt-1 block">{dt.total_faculty || 0} Staff</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-purple-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">8. Labs</span>
          <span className="text-xl font-extrabold text-purple-900 mt-1 block">Active</span>
        </div>
        <div className="p-3 bg-white rounded-xl border-t-4 border-t-rose-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">9. Events</span>
          <span className="text-xl font-extrabold text-rose-900 mt-1 block">Scheduled</span>
        </div>
      </div>

      {/* STUDENT RISK HEATMAP SECTION */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose-600" /> Student Risk Matrix & Heatmap ({deptCode})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Click any student tile to open detailed profile modal.</p>
          </div>

          <div className="flex gap-2 text-xs">
            {['ALL', 'CRITICAL', 'INTERVENTION_REQUIRED', 'WATCH', 'NORMAL'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setRiskFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  riskFilter === lvl ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {deptProfiles.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">No student records match current risk filter in {deptCode} department.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {deptProfiles.map((st: any) => {
                const heatBg =
                  st.risk_level === 'CRITICAL' ? 'bg-rose-500 text-white hover:bg-rose-600' :
                  st.risk_level === 'INTERVENTION_REQUIRED' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                  st.risk_level === 'WATCH' ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-emerald-500 text-white hover:bg-emerald-600';

                return (
                  <button
                    key={st.student_id}
                    onClick={() => setSelectedStudentId(st.student_id)}
                    className={`p-3 rounded-xl transition-all shadow hover:scale-105 text-left flex flex-col justify-between h-24 ${heatBg}`}
                  >
                    <div>
                      <span className="font-extrabold text-xs truncate block">{st.name}</span>
                      <span className="text-[10px] opacity-80 font-mono block">{st.enrollment_number}</span>
                    </div>
                    <div className="flex justify-between items-end text-[10px] font-bold border-t border-white/20 pt-1">
                      <span>{st.risk_level}</span>
                      <span className="font-mono text-xs">{st.risk_score}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* STUDENT PROFILE MODAL */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{studentModalData?.name || 'Student Profile 360'}</h3>
                <p className="text-xs text-slate-400 font-mono">{studentModalData?.enrollment_number} &bull; {studentModalData?.department}</p>
              </div>
              <button onClick={() => setSelectedStudentId(null)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {studentModalData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-400 block">Risk Level</span>
                    <span className="text-lg font-bold text-rose-400">{studentModalData.risk_level}</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-400 block">Risk Score</span>
                    <span className="text-lg font-bold text-amber-400">{studentModalData.score}%</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-400 block">Attendance</span>
                    <span className="text-lg font-bold text-emerald-400">{studentModalData.factors?.attendance_rate || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <span className="text-slate-400 block">CGPA Index</span>
                    <span className="text-lg font-bold text-blue-400">{studentModalData.factors?.latest_cgpa || 'N/A'}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block uppercase tracking-wider">Explainable Risk Factors</span>
                  {Object.entries(studentModalData.factors || {}).map(([k, v]: any) => (
                    <div key={k} className="p-2 bg-slate-900 rounded font-mono text-slate-300">
                      &bull; <span className="font-semibold">{k.replace('_', ' ')}:</span> {String(v)}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-indigo-950/60 rounded-xl border border-indigo-800/40 text-xs">
                  <span className="font-bold text-indigo-300 block mb-1">Targeted Recommendation:</span>
                  <p className="text-indigo-200">Issue academic warning letter and assign peer mentor for weekly check-ins.</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">Loading student profile telemetry...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
