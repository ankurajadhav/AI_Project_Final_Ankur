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
  Filter,
  Layers,
  ArrowUpDown,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { BKTInteractiveDemonstrator } from '../common/BKTInteractiveDemonstrator';

interface MasteryTrackerViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

interface ChartItem {
  id?: string;
  name: string;
  shortName?: string;
  fullName: string;
  subject: string;
  mastery: number;
  status?: string;
  pMastery?: number;
  count?: number;
  mastered?: number;
  attention?: number;
}

export const MasteryTrackerView: React.FC<MasteryTrackerViewProps> = ({ user, onNavigate }) => {
  const [refreshCount, setRefreshCount] = useState(0);
  const studentId = user.studentId || '101';
  const masteryMap = MasteryService.getStudentMasteryMap(studentId);
  const concepts = Object.values(masteryMap);
  const avgMastery = MasteryService.getAverageMastery(studentId);

  // Concept Matrix Filter and Search
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const subjects = ['All', ...Array.from(new Set(concepts.map(c => c.subject)))];

  const filteredConcepts = concepts.filter(c => {
    const matchesSub = filterSubject === 'All' || c.subject === filterSubject;
    const matchesSearch = c.conceptName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSub && matchesSearch;
  });

  // Graph Presentation State
  const [chartSubjectFilter, setChartSubjectFilter] = useState<string>('All');
  const [chartViewMode, setChartViewMode] = useState<'concepts' | 'domains'>('concepts');
  const [chartSortOrder, setChartSortOrder] = useState<'default' | 'lowest' | 'highest'>('default');

  const masteredCount = concepts.filter(c => c.pMastery >= 0.75).length;
  const developingCount = concepts.filter(c => c.pMastery >= 0.60 && c.pMastery < 0.75).length;
  const attentionCount = concepts.filter(c => c.pMastery < 0.60).length;

  // Domain Summary Data (Macro Domain Averages)
  const domainSummaryData: ChartItem[] = React.useMemo(() => {
    const rawSubjects = Array.from(new Set(concepts.map(c => c.subject)));
    return rawSubjects.map(sub => {
      const subConcepts = concepts.filter(c => c.subject === sub);
      const subAvg = subConcepts.reduce((acc, curr) => acc + curr.pMastery, 0) / (subConcepts.length || 1);
      return {
        name: sub,
        shortName: sub,
        fullName: `${sub} Academic Domain`,
        subject: sub,
        mastery: Math.round(subAvg * 100),
        count: subConcepts.length,
        mastered: subConcepts.filter(c => c.pMastery >= 0.75).length,
        attention: subConcepts.filter(c => c.pMastery < 0.60).length,
      };
    });
  }, [concepts]);

  // Concept Chart Data (Dynamic Filtering, Label Formatting & Sorting)
  const activeChartData: ChartItem[] = React.useMemo(() => {
    if (chartViewMode === 'domains') {
      return domainSummaryData;
    }

    let list = [...concepts];

    if (chartSubjectFilter === 'Flagged') {
      list = list.filter(c => c.pMastery < 0.60);
    } else if (chartSubjectFilter !== 'All') {
      list = list.filter(c => c.subject === chartSubjectFilter);
    }

    if (chartSortOrder === 'lowest') {
      list.sort((a, b) => a.pMastery - b.pMastery);
    } else if (chartSortOrder === 'highest') {
      list.sort((a, b) => b.pMastery - a.pMastery);
    }

    return list.map(c => {
      let displayName = c.conceptName;
      // Truncate only if extremely long to keep ticks neat
      if (displayName.length > 20) {
        displayName = displayName.substring(0, 18) + '…';
      }

      return {
        id: c.conceptId,
        name: displayName,
        shortName: displayName,
        fullName: c.conceptName,
        subject: c.subject,
        mastery: Math.round(c.pMastery * 100),
        status: c.status,
        pMastery: c.pMastery,
      };
    });
  }, [concepts, chartViewMode, chartSubjectFilter, chartSortOrder, domainSummaryData]);

  const getBarColor = (val: number) => {
    if (val >= 75) return '#10b981';
    if (val >= 60) return '#f59e0b';
    return '#f43f5e';
  };

  const isManyBars = activeChartData.length > 10;

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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl space-y-4">
        {/* Top Header with title and KPI Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white">Mastery Posterior Probability by Topic</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                Corbett & Anderson BKT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual belief state P(Mastery) dynamically updated based on test observations, guesses, and slips.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400">Class Average:</span>
              <span className="text-base font-bold text-indigo-400">{Math.round(avgMastery * 100)}%</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-emerald-400 font-bold">{masteredCount}</span>
              <span className="text-slate-400">Mastered</span>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-bold">{developingCount}</span>
              <span className="text-slate-400">Dev</span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400 font-bold">{attentionCount}</span>
              <span className="text-slate-400">Flagged</span>
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar: Domain Tabs, Mode Switcher, Sort & Legend */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Domain and Subject Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => {
                setChartViewMode('concepts');
                setChartSubjectFilter('All');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                chartViewMode === 'concepts' && chartSubjectFilter === 'All'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              All Topics ({concepts.length})
            </button>
            {subjects.filter(s => s !== 'All').map(sub => {
              const count = concepts.filter(c => c.subject === sub).length;
              const isActive = chartViewMode === 'concepts' && chartSubjectFilter === sub;
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setChartViewMode('concepts');
                    setChartSubjectFilter(sub);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {sub} ({count})
                </button>
              );
            })}
            <button
              onClick={() => {
                setChartViewMode('concepts');
                setChartSubjectFilter('Flagged');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                chartViewMode === 'concepts' && chartSubjectFilter === 'Flagged'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : attentionCount > 0
                  ? 'text-rose-400 hover:bg-rose-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flagged ({attentionCount})
            </button>
            <button
              onClick={() => setChartViewMode(chartViewMode === 'domains' ? 'concepts' : 'domains')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 border ${
                chartViewMode === 'domains'
                  ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                  : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Domain Overview</span>
            </button>
          </div>

          {/* Right Controls: Sort Order & Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            {chartViewMode === 'concepts' && (
              <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800 text-slate-400 text-[10px]">
                <ArrowUpDown className="h-3 w-3 ml-1.5 text-slate-400" />
                <button
                  onClick={() => setChartSortOrder('default')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    chartSortOrder === 'default' ? 'bg-slate-800 text-white font-semibold' : 'hover:text-slate-200'
                  }`}
                >
                  Order
                </button>
                <button
                  onClick={() => setChartSortOrder('lowest')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    chartSortOrder === 'lowest' ? 'bg-slate-800 text-rose-300 font-semibold' : 'hover:text-slate-200'
                  }`}
                  title="Lowest mastery first (Priority for practice)"
                >
                  Lowest %
                </button>
                <button
                  onClick={() => setChartSortOrder('highest')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    chartSortOrder === 'highest' ? 'bg-slate-800 text-emerald-300 font-semibold' : 'hover:text-slate-200'
                  }`}
                >
                  Highest %
                </button>
              </div>
            )}

            {/* Threshold Legend */}
            <div className="flex items-center gap-2.5 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>≥75% Mastered</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>60-74% Dev</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>&lt;60% Review</span>
              </span>
            </div>
          </div>
        </div>

        {/* Graph Display Area */}
        <div className={`w-full pt-2 ${isManyBars ? 'overflow-x-auto pb-2' : ''}`}>
          <div style={{ minWidth: isManyBars ? Math.max(900, activeChartData.length * 44) : '100%', height: isManyBars ? 310 : 270 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeChartData}
                margin={{
                  top: 15,
                  right: 20,
                  left: -15,
                  bottom: isManyBars ? 60 : activeChartData.length > 5 ? 35 : 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={isManyBars ? 10 : 11}
                  interval={0}
                  angle={isManyBars ? -38 : activeChartData.length > 6 ? -20 : 0}
                  textAnchor={isManyBars || activeChartData.length > 6 ? 'end' : 'middle'}
                  height={isManyBars ? 65 : activeChartData.length > 6 ? 40 : 25}
                  tick={{ fill: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8' }}
                  ticks={[0, 25, 50, 60, 75, 100]}
                />
                <ReferenceLine
                  y={75}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{ value: 'Mastery (75%)', fill: '#10b981', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={60}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: 'Threshold (60%)', fill: '#f59e0b', fontSize: 10, position: 'right' }}
                />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const val = data.mastery;
                      const isMastered = val >= 75;
                      const isDeveloping = val >= 60 && val < 75;
                      return (
                        <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl text-xs space-y-2 backdrop-blur z-50 min-w-[220px]">
                          <div className="border-b border-slate-800 pb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {data.subject}
                            </span>
                            <h4 className="font-bold text-white text-sm leading-snug">{data.fullName}</h4>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <span className="text-slate-300">Estimated P(Mastery):</span>
                            <span className="font-mono font-bold text-base text-white">{val}%</span>
                          </div>

                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full ${
                                isMastered ? 'bg-emerald-400' : isDeveloping ? 'bg-amber-400' : 'bg-rose-400'
                              }`}
                            />
                            <span
                              className={`text-[11px] font-bold ${
                                isMastered
                                  ? 'text-emerald-300'
                                  : isDeveloping
                                  ? 'text-amber-300'
                                  : 'text-rose-300'
                              }`}
                            >
                              {isMastered
                                ? 'Mastered (≥75%)'
                                : isDeveloping
                                ? 'Developing (60–74%)'
                                : 'Needs Review (<60%)'}
                            </span>
                          </div>

                          {data.count !== undefined ? (
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                              <span>Total Concepts: <strong className="text-slate-200">{data.count}</strong></span>
                              <span>Mastered: <strong className="text-emerald-400">{data.mastered}</strong></span>
                            </div>
                          ) : (
                            val < 65 && (
                              <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg mt-1 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>Remediation recommended</span>
                              </div>
                            )
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="mastery"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={isManyBars ? 36 : 48}
                  onClick={(entry: any) => {
                    if (chartViewMode === 'domains' && entry && entry.name) {
                      setChartViewMode('concepts');
                      setChartSubjectFilter(entry.name);
                    } else if (entry && entry.mastery < 65) {
                      onNavigate('weak_topics');
                    }
                  }}
                  className="cursor-pointer"
                >
                  {activeChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.mastery)}
                      className="hover:opacity-85 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contextual guidance tip when viewing all concepts */}
        {isManyBars && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Showing all <strong>{activeChartData.length} concepts</strong>. Scroll horizontally or click a subject domain tab above to zoom in.</span>
            </span>
            <button
              onClick={() => setChartViewMode('domains')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer text-[11px]"
            >
              Switch to Domain View →
            </button>
          </div>
        )}
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
