'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Cpu,
  Sliders,
  AlertTriangle,
  Users,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function SimulatorPage() {
  const [attThreshold, setAttThreshold] = useState<number>(75.0);
  const [cgpaThreshold, setCgpaThreshold] = useState<number>(6.0);

  const { data: initialData, isLoading, refetch } = useQuery({
    queryKey: ['simulator', attThreshold, cgpaThreshold],
    queryFn: async () => {
      const response = await api.post('/intelligence/simulator', {
        attendance_threshold: attThreshold,
        cgpa_threshold: cgpaThreshold
      });
      return response.data;
    }
  });

  const handleReset = () => {
    setAttThreshold(75.0);
    setCgpaThreshold(6.0);
  };

  const sim = initialData || {};

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Digital Twin Intelligence Engine
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> Interactive Policy Simulation
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">What-If Policy & Threshold Simulator</h1>
          <p className="text-slate-300 text-sm mt-1">
            Simulate institutional policy adjustments to project early-warning student impact in real time.
          </p>
        </div>

        <Button onClick={handleReset} variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 gap-2">
          <RotateCcw className="h-4 w-4" /> Reset Defaults (75% / 6.0)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Controls Panel */}
        <Card className="shadow-md border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Sliders className="h-5 w-5 text-blue-600" /> Threshold Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Attendance Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">Attendance Standard</label>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-xs">
                  {attThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="1"
                value={attThreshold}
                onChange={(e) => setAttThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">Students below {attThreshold}% attendance will be flagged.</p>
            </div>

            {/* CGPA Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-700">CGPA Cutoff Standard</label>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono font-bold text-xs">
                  {cgpaThreshold} / 10.0
                </span>
              </div>
              <input
                type="range"
                min="4.5"
                max="8.5"
                step="0.1"
                value={cgpaThreshold}
                onChange={(e) => setCgpaThreshold(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">Students with CGPA &lt; {cgpaThreshold} will be flagged.</p>
            </div>

            {/* AI Advice Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> AI Policy Recommendation
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {sim.recommendation || 'Select parameters to evaluate institutional impact.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Output Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-l-4 border-l-slate-600">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase">Baseline At-Risk</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{sim.baseline_at_risk_count || 0}</h3>
                <p className="text-[11px] text-slate-500">Standard criteria (75% / 6.0)</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-rose-500">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase">Simulated At-Risk Count</p>
                <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{sim.simulated_at_risk_count || 0}</h3>
                <p className="text-[11px] text-rose-600 font-medium">Under proposed threshold</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-l-4 border-l-amber-500">
              <CardContent className="p-5">
                <p className="text-xs font-semibold text-slate-500 uppercase">Net Student Impact</p>
                <h3 className="text-3xl font-extrabold text-amber-600 mt-1">
                  {sim.net_increase > 0 ? `+${sim.net_increase}` : sim.net_increase || 0}
                </h3>
                <p className="text-[11px] text-amber-600 font-medium">Newly Flagged Students</p>
              </CardContent>
            </Card>
          </div>

          {/* Affected Students Table */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> Simulated At-Risk Students Preview
              </CardTitle>
              <Badge variant="outline" className="text-xs">Top 10 Affected</Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center text-slate-500 text-sm">Evaluating policy simulation...</div>
              ) : sim.affected_students && sim.affected_students.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
                      <tr>
                        <th className="p-3 rounded-l-lg">Student</th>
                        <th className="p-3">Enrollment</th>
                        <th className="p-3">Dept</th>
                        <th className="p-3">Attendance</th>
                        <th className="p-3">CGPA</th>
                        <th className="p-3 rounded-r-lg">Flag Trigger</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sim.affected_students.map((st: any) => (
                        <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900">{st.name}</td>
                          <td className="p-3 text-slate-600 font-mono text-xs">{st.enrollment_number}</td>
                          <td className="p-3 text-slate-600 font-bold">{st.department}</td>
                          <td className="p-3 font-semibold text-rose-600">{st.attendance_rate}</td>
                          <td className="p-3 font-semibold text-indigo-600">{st.cgpa}</td>
                          <td className="p-3 text-xs text-rose-700 font-medium">{st.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-sm">
                  No additional students flagged under these policy thresholds.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
