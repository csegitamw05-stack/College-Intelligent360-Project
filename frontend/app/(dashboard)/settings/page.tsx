'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Settings, ShieldCheck, Save, Sliders, Sun, Moon, Laptop, Palette, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [weights, setWeights] = useState<{ [key: string]: number }>({
    attendance: 0.25,
    academic: 0.25,
    placement: 0.20,
    faculty: 0.15,
    research: 0.15
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [themeMsg, setThemeMsg] = useState<string | null>(null);

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

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setThemeMsg(`Theme preference updated to ${newTheme.toUpperCase()} mode.`);
    setTimeout(() => setThemeMsg(null), 3500);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const themeOptions = [
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Crisp, high-contrast daylight palette with slate accents. Ideal for bright rooms and office hours.',
      icon: Sun,
      iconColor: 'text-amber-500',
      bgColor: 'bg-white',
      borderColor: 'border-slate-300'
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Deep midnight slate palette. Reduces eye strain and offers a sleek, modern control-center feel.',
      icon: Moon,
      iconColor: 'text-blue-400',
      bgColor: 'bg-slate-900',
      borderColor: 'border-slate-700'
    },
    {
      id: 'system',
      label: 'System Sync',
      desc: 'Automatically follows your operating system theme preference dynamically.',
      icon: Laptop,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-slate-800',
      borderColor: 'border-slate-600'
    }
  ];

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
          <h1 className="text-3xl font-extrabold tracking-tight">System & Display Settings</h1>
          <p className="text-slate-300 text-sm mt-1">
            Customize visual theme preferences and configure dynamic weighting parameters for Department Health Score calculation.
          </p>
        </div>
      </div>

      {/* 1. THEME SELECTION CARD */}
      <Card className="shadow-md border-t-4 border-t-indigo-600 max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Visual Theme & Display Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Choose your preferred interface theme. Changes take effect immediately and are saved across sessions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleThemeChange(opt.id as any)}
                  className={`p-4 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between h-44 shadow-sm ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className={`h-5 w-5 ${opt.iconColor}`} />
                      </div>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                      {opt.desc}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Mode: {opt.id.toUpperCase()}</span>
                    <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {themeMsg && (
            <Alert variant="success">
              {themeMsg}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 2. HEALTH SCORE WEIGHTS CARD */}
      <Card className="shadow-md border-t-4 border-t-blue-600 max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-5 w-5 text-blue-600 dark:text-blue-400" /> Department Health Score Dynamic Weights
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Specify component weights for computing the Department Health Score (0 - 100). The sum of all weights must equal 1.0 (100%).
          </p>

          <div className="space-y-4">
            {Object.keys(weights).map((key) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">{key} Weight</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.05"
                    value={weights[key]}
                    onChange={(e) => setWeights({ ...weights, [key]: parseFloat(e.target.value) })}
                    className="w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="font-mono font-bold text-sm text-blue-800 dark:text-blue-400 w-12 text-right">
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
