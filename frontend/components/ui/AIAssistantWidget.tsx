'use client';

import React, { useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import {
  BrainCircuit,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Bot,
  User,
  MessageSquare
} from 'lucide-react';

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string; records?: any[]; context?: string }>>([
    {
      sender: 'bot',
      text: 'Hello! I am your AI-HOD Assistant. Ask me natural language questions about student attendance, risk levels, subject performance, or section comparisons.',
      context: 'Based on current institutional records.'
    }
  ]);

  const quickPrompts = [
    'Students with attendance below 75%',
    'Which subject has the highest risk?',
    'Section performance comparison',
    'Which students need immediate intervention?'
  ];

  const handleSend = async (promptText?: string) => {
    const q = promptText || question;
    if (!q.trim()) return;

    // Add User Message
    const userMsg = { sender: 'user' as const, text: q };
    setChatHistory(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/query', { question: q });
      const data = res.data;

      setChatHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.answer,
          records: data.records,
          context: data.context_marker
        }
      ]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'bot',
          text: err.response?.data?.detail || 'Could not process AI query. Ensure role authorization is active.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm border-2 border-white/20"
      >
        <BrainCircuit className="h-6 w-6 animate-pulse" />
        <span className="hidden sm:inline">AI-HOD Assistant</span>
      </button>

      {/* Chat Dialog */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 flex flex-col h-[520px] overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="font-bold text-sm text-white">AI-HOD Decision Assistant</h3>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Safe ORM Query Layer Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Chips */}
          <div className="p-2 bg-slate-950 border-b border-slate-800 flex gap-1.5 overflow-x-auto text-[10px]">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white shrink-0 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-xl max-w-[85%] ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}`}>
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Records Table if present */}
                  {msg.records && msg.records.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 space-y-1">
                      {msg.records.slice(0, 4).map((r, rIdx) => (
                        <div key={rIdx} className="p-1.5 bg-slate-900 rounded font-mono text-[10px] text-slate-300 flex justify-between">
                          <span>{r.student_name || r.subject_name || r.section_name}</span>
                          <span className="font-bold text-emerald-400">{r.attendance_rate || r.risk_level || r.student_count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.context && (
                    <span className="text-[9px] text-slate-400 font-mono block mt-1.5 italic">
                      {msg.context}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start text-xs text-slate-400">
                <div className="p-2 bg-slate-800 rounded-xl animate-pulse">Analyzing query intent against database...</div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask AI-HOD Assistant..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={() => handleSend()} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistantWidget;
