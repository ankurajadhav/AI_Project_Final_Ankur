/**
 * Teacher Main Dashboard
 */

import React, { useState, useMemo } from 'react';
import { User, TeacherReview } from '../../types';
import { storageService } from '../../services/storageService';
import { MasteryService } from '../../services/masteryService';
import { randomForestService } from '../../ai/randomForestModel';
import { ReportService } from '../../services/reportService';
import {
  Users,
  FileCheck2,
  BrainCircuit,
  Cpu,
  AlertTriangle,
  Sparkles,
  Download,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  History,
  Search,
  Filter,
  Clock,
  Edit3,
  Eye,
  X,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
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

interface TeacherDashboardProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onNavigate }) => {
  const students = storageService.getUsers().filter(u => u.role === 'student');
  const exams = storageService.getExams();
  const attempts = storageService.getExamAttempts();
  const questions = storageService.getQuestions();
  const rfMetrics = randomForestService.getMetrics();
  const teacherReviews = storageService.getTeacherReviews();
  const pairedReviews = teacherReviews.filter(r => r.status === 'approved' || r.status === 'modified');
  const pendingReviewsCount = teacherReviews.filter(r => r.status === 'pending_teacher_review').length;

  const evalMAE = pairedReviews.length > 0
    ? (pairedReviews.reduce((sum, r) => sum + Math.abs(r.aiSuggestedScore - r.teacherApprovedScore), 0) / pairedReviews.length).toFixed(2)
    : null;
  const evalRMSE = pairedReviews.length > 0
    ? Math.sqrt(pairedReviews.reduce((sum, r) => sum + Math.pow(r.aiSuggestedScore - r.teacherApprovedScore, 2), 0) / pairedReviews.length).toFixed(2)
    : null;
  const evalAgreement = pairedReviews.length > 0
    ? Math.round((pairedReviews.filter(r => Math.abs(r.aiSuggestedScore - r.teacherApprovedScore) <= 0.5).length / pairedReviews.length) * 100)
    : null;

  // Evaluation table interactive state
  const [evalFilter, setEvalFilter] = useState<'all' | 'verified' | 'pending' | 'exact'>('all');
  const [evalSearch, setEvalSearch] = useState<string>('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [evalSort, setEvalSort] = useState<'date' | 'diff' | 'student'>('date');

  const filteredEvaluationReviews = useMemo(() => {
    return teacherReviews.filter(r => {
      // Status filter
      if (evalFilter === 'verified' && r.status === 'pending_teacher_review') return false;
      if (evalFilter === 'pending' && r.status !== 'pending_teacher_review') return false;
      if (evalFilter === 'exact') {
        if (r.status === 'pending_teacher_review') return false;
        if (Math.abs(r.aiSuggestedScore - r.teacherApprovedScore) > 0.01) return false;
      }

      // Search query
      if (evalSearch.trim()) {
        const query = evalSearch.toLowerCase();
        const student = (r.studentName || r.studentId || '').toLowerCase();
        const qId = (r.questionId || '').toLowerCase();
        const text = (r.questionText || '').toLowerCase();
        if (!student.includes(query) && !qId.includes(query) && !text.includes(query)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (evalSort === 'diff') {
        const diffA = a.status === 'pending_teacher_review' ? 0 : Math.abs(a.aiSuggestedScore - a.teacherApprovedScore);
        const diffB = b.status === 'pending_teacher_review' ? 0 : Math.abs(b.aiSuggestedScore - b.teacherApprovedScore);
        return diffB - diffA; // largest error first
      }
      if (evalSort === 'student') {
        return (a.studentName || '').localeCompare(b.studentName || '');
      }
      return new Date(b.reviewedAt).getTime() - new Date(a.reviewedAt).getTime();
    });
  }, [teacherReviews, evalFilter, evalSearch, evalSort]);

  const handleExportEvalCSV = () => {
    const headers = ['Record ID', 'Question ID', 'Student Name', 'Student ID', 'Model Suggested Score', 'Teacher Score', 'Max Marks', 'Score Difference', 'Review Status', 'Reviewed At'];
    const rows = teacherReviews.map(r => {
      const isPending = r.status === 'pending_teacher_review';
      const diff = isPending ? 'N/A' : (r.aiSuggestedScore - r.teacherApprovedScore).toFixed(2);
      return [
        `"${r.id}"`,
        `"${r.questionId}"`,
        `"${r.studentName || ''}"`,
        `"${r.studentId}"`,
        r.aiSuggestedScore,
        isPending ? 'Pending' : r.teacherApprovedScore,
        r.maxScore,
        diff,
        `"${r.status}"`,
        `"${r.reviewedAt}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    ReportService.downloadCSV('Model_Evaluation_Reference_Marks_Comparison.csv', csvContent);
  };

  // Classroom analytics
  const heatmap = MasteryService.getClassroomMasteryHeatmap();
  const atRiskStudents = heatmap.students.filter(
    s => s.risk === 'Intervention Recommended' || s.risk === 'Needs Attention'
  );

  // Weakest concepts across classroom
  const weakestTopics = [...heatmap.topics].sort((a, b) => a.classAvg - b.classAvg);

  // Score distribution for chart
  const avgClassMastery = heatmap.topics.length > 0
    ? Math.round((heatmap.topics.reduce((acc, t) => acc + t.classAvg, 0) / heatmap.topics.length) * 100)
    : 68;

  const [chartSubjectFilter, setChartSubjectFilter] = useState<'focus' | 'cs' | 'math' | 'ai' | 'all'>('focus');

  const formatShortTopic = (name: string): string => {
    return name
      .replace('Recursion & Dynamic Programming', 'Recursion & DP')
      .replace('Object-Oriented Design', 'OOP Design')
      .replace('Binary Search Trees', 'BST & Trees')
      .replace('Graph Algorithms', 'Graph Algo')
      .replace('Quadratic Equations', 'Quadratics')
      .replace('Calculus Basics', 'Calculus')
      .replace('Linear Algebra', 'Linear Alg')
      .replace('Supervised Learning', 'Supervised ML')
      .replace('Neural Networks & Perceptrons', 'Neural Nets')
      .replace('Hash Tables & Collision Resolution', 'Hash Tables')
      .replace('Model Evaluation Metrics', 'Model Eval')
      .replace('Sorting & Searching', 'Sorting & Search')
      .replace('Probability & Distributions', 'Probability')
      .replace('Discrete Mathematics & Logic', 'Discrete Math');
  };

  const chartData = useMemo(() => {
    let filtered = heatmap.topics;

    if (chartSubjectFilter === 'cs') {
      filtered = heatmap.topics.filter(t => t.subject === 'Computer Science');
    } else if (chartSubjectFilter === 'math') {
      filtered = heatmap.topics.filter(t => t.subject === 'Mathematics');
    } else if (chartSubjectFilter === 'ai') {
      filtered = heatmap.topics.filter(t => t.subject === 'AI & Data Science');
    } else if (chartSubjectFilter === 'focus') {
      // Priority cohort focus: lowest mastery concepts + core syllabus pillars (up to 8 concepts)
      const sortedByDeficit = [...heatmap.topics].sort((a, b) => a.classAvg - b.classAvg);
      filtered = sortedByDeficit.slice(0, 8);
    }

    return filtered.map(t => ({
      id: t.id,
      fullName: t.name,
      shortName: formatShortTopic(t.name),
      subject: t.subject || 'Computer Science',
      classAvg: Math.round(t.classAvg * 100),
    }));
  }, [heatmap.topics, chartSubjectFilter]);

  const handleExportCSV = () => {
    const csv = ReportService.generateClassPerformanceCSV();
    ReportService.downloadCSV('AAK_Exam_Classroom_Performance_Report.csv', csv);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Instructor Intelligence Portal
              </span>
              <span className="text-xs text-slate-400">Classroom Analytics & ML Pattern Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good morning, {user.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {students.length} active students tracked. Random Forest grading regressor (R² = {rfMetrics.r2Score}) synchronized with 550 evaluation records.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('ai_exam_generator')}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Adaptive Exam Generator</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Students</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{students.length}</span>
            <span className="text-xs font-medium text-emerald-400">Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Computer Science & Math Cohort</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Class Mastery Avg</span>
            <BrainCircuit className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{avgClassMastery}%</span>
            <span className="text-xs font-medium text-indigo-400">BKT Aggregate</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${avgClassMastery}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Early Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{atRiskStudents.length}</span>
            <span className="text-xs font-medium text-slate-400">Students</span>
          </div>
          <button
            onClick={() => onNavigate('student_risk')}
            className="mt-1 text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
          >
            Review Interventions <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ML Grading Model</span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">R² {rfMetrics.r2Score}</span>
            <span className="text-xs font-medium text-slate-400">100 Trees</span>
          </div>
          <button
            onClick={() => onNavigate('grading_patterns')}
            className="mt-1 text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            Model Evaluation Table <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Class Performance Chart & Early Intervention Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Classroom Topic Mastery Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Classroom Topic Mastery Distribution</h3>
                <p className="text-xs text-slate-400">Mean estimated BKT posterior across all enrolled students.</p>
              </div>
              <button
                onClick={() => onNavigate('class_analytics')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold self-start sm:self-auto cursor-pointer"
              >
                View Full Heatmap →
              </button>
            </div>

            {/* Interactive Subject Filter Pills & Legend */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
                {[
                  { id: 'focus', label: 'Priority Focus (8)' },
                  { id: 'cs', label: 'Computer Science' },
                  { id: 'math', label: 'Mathematics' },
                  { id: 'ai', label: 'AI & Data Science' },
                  { id: 'all', label: `All Topics (${heatmap.topics.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setChartSubjectFilter(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      chartSubjectFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Status color indicator */}
              <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Mastered (≥75%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Developing (60-74%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>Deficit (&lt;60%)</span>
                </span>
              </div>
            </div>

            {/* Responsive Chart Container with Dynamic Sizing & Zero Collision */}
            <div className={`w-full pt-2 ${chartSubjectFilter === 'all' ? 'h-72 overflow-x-auto' : 'h-64'}`}>
              <ResponsiveContainer width="100%" height="100%" minWidth={chartSubjectFilter === 'all' ? 700 : undefined}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -15,
                    bottom: chartSubjectFilter === 'all' ? 45 : 25,
                  }}
                >
                  <XAxis
                    dataKey="shortName"
                    stroke="#64748b"
                    fontSize={chartSubjectFilter === 'all' ? 9 : 11}
                    interval={0}
                    angle={chartSubjectFilter === 'all' ? -35 : chartData.length > 6 ? -18 : 0}
                    textAnchor={chartSubjectFilter === 'all' || chartData.length > 6 ? 'end' : 'middle'}
                    height={chartSubjectFilter === 'all' ? 55 : 35}
                    tick={{ fill: '#cbd5e1' }}
                  />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const isMastered = data.classAvg >= 75;
                        const isDeveloping = data.classAvg >= 60 && data.classAvg < 75;
                        return (
                          <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur z-50">
                            <div className="font-bold text-white text-sm">{data.fullName}</div>
                            <div className="text-[11px] text-slate-400 font-medium">{data.subject}</div>
                            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
                              <span className="text-slate-300">Cohort Average:</span>
                              <span className="font-mono font-bold text-white text-sm">{data.classAvg}%</span>
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span
                                className={`inline-block h-2 w-2 rounded-full ${
                                  isMastered ? 'bg-emerald-400' : isDeveloping ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                              />
                              <span
                                className={`text-[10px] font-bold ${
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
                                  ? 'Developing (60-74%)'
                                  : 'Deficit / Attention Needed (<60%)'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="classAvg" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.classAvg >= 75 ? '#10b981' : entry.classAvg >= 60 ? '#f59e0b' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Early Intervention Alerts Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Students Requiring Attention / Intervention</h3>
              </div>
              <button
                onClick={() => onNavigate('student_risk')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Detailed Risk Matrix
              </button>
            </div>

            <div className="space-y-3">
              {atRiskStudents.map(st => {
                const isCritical = st.risk === 'Intervention Recommended';

                return (
                  <div
                    key={st.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950 p-4 border border-slate-800"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{st.name}</span>
                        <span className="text-[10px] text-slate-400">ID #{st.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isCritical
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {st.risk}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Average Concept Mastery: <strong className="text-slate-200">{Math.round(st.avgMastery * 100)}%</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('ai_exam_generator')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
                    >
                      Assign Adaptive Test
                    </button>
                  </div>
                );
              })}

              {atRiskStudents.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                  All students are on track with average mastery above 60%.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Top Class Weaknesses & Quick Actions */}
        <div className="space-y-6">
          {/* Top Weak Concepts */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Classroom Deficit Concepts</h3>
            <p className="text-xs text-slate-400">Topics where the cohort has the lowest combined accuracy.</p>

            <div className="space-y-3">
              {weakestTopics.slice(0, 4).map(topic => (
                <div key={topic.id} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-200">{topic.name}</span>
                    <span className="font-bold text-white">{Math.round(topic.classAvg * 100)}% Avg</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        topic.classAvg >= 0.7 ? 'bg-emerald-500' : topic.classAvg >= 0.5 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.round(topic.classAvg * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Management Links */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Quick Instructor Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('question_bank')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <span>Browse Question Bank ({questions.length} Items)</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </button>
              <button
                onClick={() => onNavigate('create_exam')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <span>Create Standard Exam</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </button>
              <button
                onClick={() => onNavigate('grading_patterns')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                <span>Grading Model Simulator</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: DESCRIPTIVE ANSWER EVALUATION TABLE (AI PREDICTIONS VS TEACHER SCORES) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-6 shadow-2xl">
        {/* Header & Quick Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Evaluation Table: Model-Suggested Scores vs Teacher-Assigned Reference Marks
                </h3>
                <span className="text-[11px] font-medium text-slate-400">
                  Empirical alignment benchmark between evaluation predictions and faculty-verified scores
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0 flex items-center gap-1.5 shadow-sm">
              <span className="text-slate-500">Benchmark:</span>
              <span className="text-indigo-400 font-bold">Diff = Suggested − Teacher</span>
            </div>
            <button
              onClick={handleExportEvalCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Export comparison dataset to CSV"
            >
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => onNavigate('teacher_grading_assistant')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Grading Assistant</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Model Evaluation Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Paired Evaluations
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {pairedReviews.length}
              <span className="text-xs font-normal text-slate-400 ml-1.5">of {teacherReviews.length} total</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px]">
              {pendingReviewsCount > 0 ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {pendingReviewsCount} awaiting faculty verification
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  All pairs verified
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Mean Absolute Error (MAE)
            </span>
            <div className="text-2xl font-black text-indigo-400 mt-1">
              {evalMAE !== null ? `±${evalMAE} pts` : '—'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Target standard: &lt; 0.50 pts</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Root Mean Squared Error (RMSE)
            </span>
            <div className="text-2xl font-black text-cyan-400 mt-1">
              {evalRMSE !== null ? `±${evalRMSE} pts` : '—'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Residual variance standard</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Teacher-Model Agreement
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {evalAgreement !== null ? `${evalAgreement}%` : '—'}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Pairs within ±0.50 mark</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setEvalFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                evalFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Records ({teacherReviews.length})
            </button>
            <button
              onClick={() => setEvalFilter('verified')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                evalFilter === 'verified'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Verified Pairs ({pairedReviews.length})
            </button>
            <button
              onClick={() => setEvalFilter('exact')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                evalFilter === 'exact'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Exact Matches ({pairedReviews.filter(r => Math.abs(r.aiSuggestedScore - r.teacherApprovedScore) === 0).length})
            </button>
            <button
              onClick={() => setEvalFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                evalFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingReviewsCount})
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search student or Q-ID..."
                value={evalSearch}
                onChange={e => setEvalSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              {evalSearch && (
                <button
                  onClick={() => setEvalSearch('')}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <select
              value={evalSort}
              onChange={e => setEvalSort(e.target.value as any)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="date">Newest First</option>
              <option value="diff">Largest Error (Δ)</option>
              <option value="student">Student Name</option>
            </select>
          </div>
        </div>

        {/* Evaluation Comparison Table */}
        {filteredEvaluationReviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <FileText className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No evaluation records match your current filter.</p>
            <p className="text-[11px] text-slate-500">Try adjusting your search terms or filter tabs.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-3 px-4 font-semibold">Student & Submission</th>
                    <th className="py-3 px-4 font-semibold">Question Prompt</th>
                    <th className="py-3 px-3 font-semibold text-center">Suggested Score</th>
                    <th className="py-3 px-3 font-semibold text-center">Teacher Score</th>
                    <th className="py-3 px-3 font-semibold text-center">Score Delta (Suggested − Teacher)</th>
                    <th className="py-3 px-3 font-semibold text-center">Review Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-[11px]">
                  {filteredEvaluationReviews.map(r => {
                    const isPending = r.status === 'pending_teacher_review';
                    const diff = isPending ? null : Number((r.aiSuggestedScore - r.teacherApprovedScore).toFixed(2));
                    const isExact = diff !== null && Math.abs(diff) === 0;
                    const isExpanded = selectedReviewId === r.id;

                    return (
                      <React.Fragment key={r.id}>
                        <tr
                          onClick={() => setSelectedReviewId(prev => (prev === r.id ? null : r.id))}
                          className={`transition cursor-pointer group ${
                            isExpanded
                              ? 'bg-indigo-950/20'
                              : isExact
                              ? 'hover:bg-emerald-950/10'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Student & Submission */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 font-bold text-xs text-indigo-300">
                                {(r.studentName || r.studentId || 'S').charAt(0)}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-white block group-hover:text-indigo-300 transition">
                                  {r.studentName || r.studentId}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                  <span className="font-mono">{r.studentId}</span>
                                  <span>·</span>
                                  <span className="font-mono text-slate-500">{r.id}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Question Prompt */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="space-y-1">
                              <span className="inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                {r.questionId}
                              </span>
                              <p className="text-slate-300 text-[11px] line-clamp-1">
                                {r.questionText || 'Descriptive answer evaluation'}
                              </p>
                            </div>
                          </td>

                          {/* Suggested Score */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="font-mono font-black text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                                {r.aiSuggestedScore} / {r.maxScore}
                              </span>
                              <div className="w-12 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                                <div
                                  className="bg-indigo-400 h-1 rounded-full"
                                  style={{ width: `${Math.min(100, Math.round((r.aiSuggestedScore / (r.maxScore || 5)) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Teacher Score */}
                          <td className="py-3 px-3 text-center">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">
                                <Clock className="h-3 w-3" />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="font-mono font-black text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                  {r.teacherApprovedScore} / {r.maxScore}
                                </span>
                                <div className="w-12 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                                  <div
                                    className="bg-emerald-400 h-1 rounded-full"
                                    style={{ width: `${Math.min(100, Math.round(((r.teacherApprovedScore || 0) / (r.maxScore || 5)) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Delta */}
                          <td className="py-3 px-3 text-center">
                            {diff === null ? (
                              <span className="text-slate-500 text-[11px]">—</span>
                            ) : isExact ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                                <Check className="h-3 w-3" />
                                <span>0.00 Exact Match</span>
                              </span>
                            ) : diff > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold text-[10px]">
                                <span>+{diff} (Model Higher)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold text-[10px]">
                                <span>{diff} (Teacher Higher)</span>
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                r.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : r.status === 'modified'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {r.status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
                              {r.status === 'modified' && <Edit3 className="h-3 w-3" />}
                              {r.status === 'pending_teacher_review' && <Clock className="h-3 w-3" />}
                              <span>
                                {r.status === 'approved'
                                  ? 'TEACHER APPROVED'
                                  : r.status === 'modified'
                                  ? 'TEACHER MODIFIED'
                                  : 'PENDING REVIEW'}
                              </span>
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setSelectedReviewId(prev => (prev === r.id ? null : r.id));
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition"
                              >
                                <Eye className="h-3 w-3" />
                                <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Inspection Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-950 border-b border-indigo-500/20">
                            <td colSpan={7} className="p-5">
                              <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-4">
                                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
                                  <div>
                                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                                      Detailed Response & Rubric Verification
                                    </span>
                                    <h4 className="text-sm font-bold text-white mt-0.5">
                                      {r.questionText || `Question: ${r.questionId}`}
                                    </h4>
                                  </div>
                                  <button
                                    onClick={() => onNavigate('teacher_grading_assistant')}
                                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
                                  >
                                    <span>Open in Grading Assistant</span>
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Student Written Response */}
                                  <div className="space-y-1.5">
                                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                                      Student Written Answer:
                                    </span>
                                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans max-h-36 overflow-y-auto">
                                      {r.studentAnswerText || 'No answer text recorded.'}
                                    </div>
                                  </div>

                                  {/* Evaluation Details & Rubric */}
                                  <div className="space-y-2.5">
                                    {r.rubricCriteria && (
                                      <div className="space-y-1">
                                        <span className="text-[11px] font-bold text-slate-400">
                                          Detected Key Rubric Phrases:
                                        </span>
                                        <div className="flex flex-wrap gap-1">
                                          {r.rubricCriteria.split(',').map((term, tIdx) => (
                                            <span
                                              key={tIdx}
                                              className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                            >
                                              {term.trim()}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {r.feedbackNotes && (
                                      <div className="space-y-1">
                                        <span className="text-[11px] font-bold text-slate-400">
                                          Teacher Feedback Note:
                                        </span>
                                        <p className="text-xs text-emerald-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                                          {r.feedbackNotes}
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                                      <span>Recorded: {new Date(r.reviewedAt).toLocaleString()}</span>
                                      <span className="font-mono text-slate-500">Attempt: {r.attemptId}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
