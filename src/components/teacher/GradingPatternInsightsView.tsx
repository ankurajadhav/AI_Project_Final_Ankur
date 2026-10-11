/**
 * Teacher Grading Pattern Insights (Random Forest Regressor ML Model)
 */

import React, { useState } from 'react';
import { User, TeacherGradingRecord } from '../../types';
import { storageService } from '../../services/storageService';
import { randomForestService } from '../../ai/randomForestModel';
import {
  Cpu,
  BrainCircuit,
  TrendingUp,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Database,
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

interface GradingPatternInsightsViewProps {
  user: User;
}

export const GradingPatternInsightsView: React.FC<GradingPatternInsightsViewProps> = ({ user }) => {
  const [metrics, setMetrics] = useState(randomForestService.getMetrics());
  const records = storageService.getTeacherGradingRecords();
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);

  // Model Evaluation Table state
  const [evalFilter, setEvalFilter] = useState<'all' | 'concordant' | 'minor' | 'discrepancy'>('all');
  const [evalSearch, setEvalSearch] = useState('');
  const [evalPage, setEvalPage] = useState(1);
  const PAGE_SIZE = 10;

  // Live Grading Simulator Sliders
  const [simCorrectness, setSimCorrectness] = useState(0.85);
  const [simDepth, setSimDepth] = useState(0.70);
  const [simPresentation, setSimPresentation] = useState(0.80);
  const [simKeywords, setSimKeywords] = useState(0.75);
  const [simEffort, setSimEffort] = useState(0.65);
  const [simDifficulty, setSimDifficulty] = useState(0.50);

  // Predict live score with explainable breakdown
  const prediction = randomForestService.explainPrediction(
    simCorrectness,
    simDepth,
    simPresentation,
    simKeywords,
    simEffort,
    simDifficulty
  );

  const featureChartData = [
    { name: 'Correctness', weight: Math.round((metrics?.featureImportances?.correctness ?? 0.48) * 100) },
    { name: 'Depth', weight: Math.round((metrics?.featureImportances?.explanationDepth ?? 0.22) * 100) },
    { name: 'Presentation', weight: Math.round((metrics?.featureImportances?.presentationScore ?? 0.14) * 100) },
    { name: 'Keywords', weight: Math.round((metrics?.featureImportances?.keywordDensity ?? 0.08) * 100) },
    { name: 'Effort', weight: Math.round((metrics?.featureImportances?.effortWeight ?? 0.05) * 100) },
    { name: 'Difficulty', weight: Math.round((metrics?.featureImportances?.questionDifficulty ?? 0.03) * 100) },
  ];

  const handleRetrain = () => {
    setIsRetraining(true);
    setRetrainSuccess(false);
    setTimeout(() => {
      storageService.retrainGradingModel();
      setMetrics(randomForestService.getMetrics());
      setIsRetraining(false);
      setRetrainSuccess(true);
      setTimeout(() => setRetrainSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-400" />
            <span>Teacher Grading Pattern Insights (Random Forest Regressor)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Supervised Ensemble ML Model (100 Decision Trees) learned from {records.length} historical grading decisions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {retrainSuccess && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-fade-in">
              ✓ Model retrained across {records.length} records!
            </span>
          )}
          <button
            disabled={isRetraining}
            onClick={handleRetrain}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Fitting Ensemble...' : 'Retrain on Latest Records'}</span>
          </button>
        </div>
      </div>

      {/* Model Benchmark Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            R² (Variance Explained)
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1.5">
            {metrics.r2Score}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">High fidelity replication</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            RMSE (Root Mean Sq Err)
          </span>
          <div className="text-2xl font-extrabold text-indigo-400 mt-1.5">
            ±{metrics.rmse}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">100-point rubric scale</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            MAE (Mean Absolute Err)
          </span>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1.5">
            ±{metrics.mae}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Held-out test split</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Decision Trees
          </span>
          <div className="text-2xl font-extrabold text-white mt-1.5">
            {metrics.numTrees || 100} Trees
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Depth {metrics.maxDepth} (Bagging)</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Training Records
          </span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1.5">
            {records.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Evaluated submissions</p>
        </div>
      </div>

      {/* Main Grid: Feature Importances & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Feature Importances Chart & Insights */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Learned Teacher Feature Importance Weights</h3>
              <p className="text-xs text-slate-400">Relative Gini importance assigned by the Random Forest model.</p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">100% Normalized</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 60]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Weight`, 'Importance']}
                />
                <Bar dataKey="weight" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {featureChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.weight > 30 ? '#6366f1' : entry.weight > 15 ? '#3b82f6' : '#06b6d4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Qualitative Insights */}
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              <span>Pedagogical Pattern Summary</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              • <strong>Core Finding:</strong> The teacher values <strong className="text-indigo-300">Objective Solution Correctness (48%)</strong> and <strong className="text-cyan-300">Explanation Depth & Invariant Rigor (22%)</strong> most heavily.
            </p>
            <p className="leading-relaxed text-slate-300">
              • <strong>Formatting & Effort:</strong> Presentation structure accounts for ~14% of the score variance, while pure keyword matching has a modest 8% influence.
            </p>
          </div>
        </div>

        {/* Right Col: Live Interactive Grading Simulator */}
        <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Grading Simulator</h3>
              <p className="text-xs text-slate-400">Move the rubric sliders to see real-time Random Forest score predictions.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-indigo-400 leading-none">
                {prediction.predictedGrade}%
              </span>
              <span className="text-[10px] text-slate-400 block">Predicted Score</span>
            </div>
          </div>

          {/* Simulator Sliders */}
          <div className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Rubric Correctness & Mathematical Precision</span>
                <span className="text-indigo-400 font-bold">{Math.round(simCorrectness * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simCorrectness}
                onChange={e => setSimCorrectness(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Explanation Depth & Theoretical Justification</span>
                <span className="text-indigo-400 font-bold">{Math.round(simDepth * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simDepth}
                onChange={e => setSimDepth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Presentation Clarity & Code Structure</span>
                <span className="text-indigo-400 font-bold">{Math.round(simPresentation * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simPresentation}
                onChange={e => setSimPresentation(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Core Keyword Coverage</span>
                <span className="text-indigo-400 font-bold">{Math.round(simKeywords * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simKeywords}
                onChange={e => setSimKeywords(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-medium text-slate-300">
                <span>Student Attempt Effort</span>
                <span className="text-indigo-400 font-bold">{Math.round(simEffort * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={simEffort}
                onChange={e => setSimEffort(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Explainable Factor Breakdown */}
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-white">Explainable Prediction Breakdown:</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              {prediction.breakdown.map(item => (
                <div key={item.component}>
                  {item.component}: <strong className="text-indigo-400">+{item.scoreContribution} pts ({item.weightPercent}%)</strong>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 italic border-t border-slate-900 pt-2">{prediction.interpretation}</p>
          </div>
        </div>
      </div>

      {/* SECTION: HELD-OUT MODEL EVALUATION TABLE & TEACHER COMPARISON */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                Held-Out Model Evaluation Table: Model Predictions vs Teacher Assigned Scores
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates Random Forest regression accuracy on 20% held-out test records (110 samples) isolated to prevent data leakage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {metrics.datasetSource === 'genuine_teacher_imported' ? 'Genuine Teacher Dataset' : 'Demonstration Data (Held-out Test Split)'}
            </span>
            <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 shrink-0">
              Formula: <span className="text-indigo-400 font-bold">Diff = Suggested − Teacher</span>
            </div>
          </div>
        </div>

        {/* Evaluation Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Held-Out Test Samples
            </span>
            <div className="text-xl font-bold text-white mt-1">
              {metrics.evaluationTestSamples?.length || 0} <span className="text-xs font-normal text-slate-400">samples</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">20% held-out test split</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Mean Absolute Error (MAE)
            </span>
            <div className="text-xl font-bold text-cyan-400 mt-1">
              ±{metrics.mae} pts
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Average absolute error</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Root Mean Squared Error (RMSE)
            </span>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              ±{metrics.rmse} pts
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Penalizes large deviations</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Concordance Rate (≤5% diff)
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {metrics.evaluationTestSamples && metrics.evaluationTestSamples.length > 0
                ? `${Math.round((metrics.evaluationTestSamples.filter(s => s.evaluationStatus.includes('Concordant')).length / metrics.evaluationTestSamples.length) * 100)}%`
                : '—'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Closely matching pairs</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter:
            </span>
            <button
              onClick={() => { setEvalFilter('all'); setEvalPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                evalFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All ({metrics.evaluationTestSamples?.length || 0})
            </button>
            <button
              onClick={() => { setEvalFilter('concordant'); setEvalPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                evalFilter === 'concordant'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Concordant ≤5%
            </button>
            <button
              onClick={() => { setEvalFilter('minor'); setEvalPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                evalFilter === 'minor'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Minor Deviation 5-15%
            </button>
            <button
              onClick={() => { setEvalFilter('discrepancy'); setEvalPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                evalFilter === 'discrepancy'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Discrepancy &gt;15%
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search records by ID..."
              value={evalSearch}
              onChange={e => { setEvalSearch(e.target.value); setEvalPage(1); }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Evaluation Table */}
        {(() => {
          const allSamples = metrics.evaluationTestSamples || [];
          const filtered = allSamples.filter(item => {
            if (evalFilter === 'concordant' && !item.evaluationStatus.includes('Concordant')) return false;
            if (evalFilter === 'minor' && !item.evaluationStatus.includes('Minor')) return false;
            if (evalFilter === 'discrepancy' && !item.evaluationStatus.includes('Discrepancy')) return false;
            if (evalSearch.trim()) {
              const q = evalSearch.toLowerCase();
              return item.id.toLowerCase().includes(q) || (item.topic && item.topic.toLowerCase().includes(q)) || (item.questionId && item.questionId.toLowerCase().includes(q));
            }
            return true;
          });

          const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
          const currentPage = Math.min(evalPage, totalPages);
          const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

          if (filtered.length === 0) {
            return (
              <div className="py-8 text-center text-xs text-slate-400 rounded-xl bg-slate-950 border border-slate-800">
                No matching evaluation records found.
              </div>
            );
          }

          return (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="py-2.5 px-3 font-semibold">Record ID</th>
                      <th className="py-2.5 px-3 font-semibold">Item / Question ID</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Suggested Score</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Teacher Reference Score</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Max Marks</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Score Difference (Suggested − Teacher)</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Evaluation Concordance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-[11px] bg-slate-900/40">
                    {paginated.map(item => {
                      const diff = item.scoreDifference;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{item.id}</td>
                          <td className="py-2.5 px-3 text-slate-300 font-semibold">
                            {item.questionId} <span className="text-[10px] text-slate-400 font-normal">({item.topic || 'Descriptive'})</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-indigo-400 font-bold">
                            {item.aiSuggestedScore}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-emerald-400 font-bold">
                            {item.teacherReferenceScore}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-400">{item.maxMarks}</td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                Math.abs(diff) <= 2
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : diff > 0
                                  ? 'bg-indigo-500/15 text-indigo-300'
                                  : 'bg-cyan-500/15 text-cyan-300'
                              }`}
                            >
                              {diff > 0 ? `+${diff}` : diff === 0 ? '0.0 (Exact)' : `${diff}`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                item.evaluationStatus.includes('Concordant')
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : item.evaluationStatus.includes('Minor')
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {item.evaluationStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                <span>
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} evaluation records
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setEvalPage(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-[11px]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setEvalPage(prev => Math.min(totalPages, prev + 1))}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white disabled:opacity-40 transition"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
