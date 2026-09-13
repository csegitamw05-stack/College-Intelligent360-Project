'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Settings, ShieldCheck, Save, Sliders } from 'lucide-react';

export default function SettingsPage() {
  const [weights, setWeights] = useState<{ [key: string]: number }>({
    attendance: 0.25,
    academic: 0.25,
    placement: 0.20,
    faculty: 0.15,
    research: 0.15
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['system_settings'],
    queryFn: async () => {
      const response = await api.get('/system/settings');
      if (response.data.department_health_weights) {
        setWeights(response.data.department_health_weights);
      }
      return response.data;
    }
  });

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.post('/system/settings', weights);
      setMsg({ type: 'success', text: res.data.message });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update weights.' });
    } finally {
      setSaving(false);
    }
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              System Configuration
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" /> Production Enforced
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Settings & Health Weights</h1>
          <p className="text-slate-300 text-sm mt-1">
            Configure dynamic weighting parameters for Department Health Score calculation.
          </p>
        </div>
      </div>

      <Card className="shadow-md border-t-4 border-t-blue-600 max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600" /> Department Health Score Weights
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed">
            Specify component weights for computing the Department Health Score (0 - 100). The sum of all weights must equal 1.0 (100%).
          </p>

          <div className="space-y-4">
            {Object.keys(weights).map((key) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-bold text-slate-800 capitalize">{key} Weight</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.05"
                    value={weights[key]}
                    onChange={(e) => setWeights({ ...weights, [key]: parseFloat(e.target.value) })}
                    className="w-36 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="font-mono font-bold text-sm text-blue-800 w-12 text-right">
                    {(weights[key] * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">Total Weight Sum:</span>
            <span className={`text-lg font-extrabold font-mono ${Math.abs(totalWeight - 1.0) < 0.01 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(totalWeight * 100).toFixed(0)}%
            </span>
          </div>

          {msg && (
            <Alert variant={msg.type === 'success' ? 'success' : 'error'}>
              {msg.text}
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || Math.abs(totalWeight - 1.0) > 0.05}
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-600/30"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving Weights...' : 'Save Health Weights'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
