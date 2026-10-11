/**
 * Concept Mastery Tracker View (Bayesian Knowledge Tracing)
 */

import React, { useState } from 'react';
import { User, ConceptMastery } from '../../types';
import { MasteryService } from '../../services/masteryService';
import { BKTEngine } from '../../ai/bktEngine';
import {
  BrainCircuit,
  TrendingUp,
  Search,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BKTInteractiveDemonstrator } from '../common/BKTInteractiveDemonstrator';

interface MasteryTrackerViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const MasteryTrackerView: React.FC<MasteryTrackerViewProps> = ({ user, onNavigate }) => {
  const [refreshCount, setRefreshCount] = useState(0);
  const studentId = user.studentId || '101';
  const masteryMap = MasteryService.getStudentMasteryMap(studentId);
  const concepts = Object.values(masteryMap);
  const avgMastery = MasteryService.getAverageMastery(studentId);


  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const subjects = ['All', ...Array.from(new Set(concepts.map(c => c.subject)))];

  const filteredConcepts = concepts.filter(c => {
    const matchesSub = filterSubject === 'All' || c.subject === filterSubject;
    const matchesSearch = c.conceptName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSub && matchesSearch;
  });

  const chartData = concepts.map(c => ({
    name: c.conceptName.length > 15 ? c.conceptName.substring(0, 14) + '...' : c.conceptName,
    mastery: Math.round(c.pMastery * 100),
    status: c.status,
  }));

  const getBarColor = (val: number) => {
    if (val >= 75) return '#10b981';
    if (val >= 60) return '#f59e0b';
    return '#f43f5e';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-400" />
            <span>Bayesian Concept Mastery Tracker</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time Bayesian Knowledge Tracing (BKT) probability distribution across all academic domains.
          </p>
        </div>
        <button
          onClick={() => onNavigate('weak_topics')}
          className="flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Remediate Flagged Concepts</span>
        </button>
      </div>

      {/* Mastery Summary Bar Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Mastery Posterior Probability by Topic</h3>
            <p className="text-xs text-slate-400">Values represent estimated P(Mastery) computed by the BKT update rule.</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-indigo-400">{Math.round(avgMastery * 100)}%</span>
            <span className="text-[10px] text-slate-400 block">Classroom Average</span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: any) => [`${value}% P(Mastery)`, 'Mastery']}
              />
              <Bar dataKey="mastery" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.mastery)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Bayesian Knowledge Tracing (BKT) Live Demonstration */}
      <BKTInteractiveDemonstrator
        studentId={studentId}
        onMasteryUpdated={() => setRefreshCount(r => r + 1)}
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterSubject === s
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Concepts Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConcepts.map(c => {
          const color = BKTEngine.getStatusColor(c.status);

          return (
            <div
              key={c.conceptId}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {c.subject}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug">{c.conceptName}</h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color.bg} ${color.text} ${color.border}`}>
                  {c.status}
                </span>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Posterior Probability:</span>
                  <span className="font-bold text-white">{Math.round(c.pMastery * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      c.pMastery >= 0.75 ? 'bg-emerald-500' : c.pMastery >= 0.60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.round(c.pMastery * 100)}%` }}
                  />
                </div>
              </div>

              {/* Attempt Stats */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <div>
                  <span>Total Attempts:</span>
                  <span className="font-semibold text-slate-200 ml-1">{c.totalAttempts}</span>
                </div>
                <div>
                  <span>Accuracy:</span>
                  <span className="font-semibold text-slate-200 ml-1">
                    {c.totalAttempts > 0 ? Math.round((c.correctAttempts / c.totalAttempts) * 100) : 0}%
                  </span>
                </div>
              </div>

              {/* Action */}
              {c.pMastery < 0.65 ? (
                <button
                  onClick={() => onNavigate('weak_topics')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Start Remediation</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('practice')}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  <span>Practice Advanced Items</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
