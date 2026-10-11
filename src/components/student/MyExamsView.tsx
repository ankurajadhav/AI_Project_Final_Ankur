/**
 * My Exams View (Student View)
 */

import React, { useState } from 'react';
import { User, Exam, ExamAttempt } from '../../types';
import { storageService } from '../../services/storageService';
import {
  FileCheck2,
  Clock,
  Award,
  Search,
  Filter,
  Play,
  Eye,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

interface MyExamsViewProps {
  user: User;
  onStartExam: (examId: string) => void;
  onViewResult: (attemptId: string) => void;
  onNavigate?: (view: string) => void;
}

export const MyExamsView: React.FC<MyExamsViewProps> = ({
  user,
  onStartExam,
  onViewResult,
  onNavigate,
}) => {
  const studentId = user.studentId || '101';
  const exams = storageService.getExams();
  const attempts = storageService.getExamAttempts().filter(a => a.studentId === studentId);

  const [tab, setTab] = useState<'assigned' | 'completed' | 'all'>('assigned');
  const [searchTerm, setSearchTerm] = useState('');

  const attemptsByExamId = new Map<string, ExamAttempt>();
  attempts.forEach(a => {
    if (!attemptsByExamId.has(a.examId)) {
      attemptsByExamId.set(a.examId, a);
    }
  });

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.topics.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    const hasAttempted = attemptsByExamId.has(e.id);
    if (tab === 'assigned') return !hasAttempted && e.status === 'published';
    if (tab === 'completed') return hasAttempted;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Launch CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-indigo-400" />
            <span>My Assessments & Exams</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            View assigned teacher assessments, completed exams, and generated adaptive diagnostic sets.
          </p>
        </div>
        <button
          onClick={() => onNavigate('ai_test')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>New Adaptive Test</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('assigned')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'assigned'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Assigned / Pending ({exams.filter(e => !attemptsByExamId.has(e.id) && e.status === 'published').length})
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'completed'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Completed ({attempts.length})
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Catalog ({exams.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.map(exam => {
          const attempt = attemptsByExamId.get(exam.id);
          const isCompleted = !!attempt;

          return (
            <div
              key={exam.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {exam.subject}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                    }`}
                  >
                    {isCompleted ? `Scored ${attempt.percentageScore}%` : exam.examType.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{exam.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{exam.description}</p>

                {/* Topics Tag List */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exam.topics.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {exam.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> {exam.questionIds.length} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-amber-400" /> {exam.totalMarks} Marks
                  </span>
                </div>

                {isCompleted ? (
                  <button
                    onClick={() => onViewResult(attempt.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Detailed Diagnostics</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onStartExam(exam.id)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Start Assessment</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredExams.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 space-y-2">
            <FileCheck2 className="h-10 w-10 mx-auto text-slate-400" />
            <p className="text-sm font-medium">No exams found matching your current filter.</p>
            <button
              onClick={() => onNavigate('ai_test')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Generate an Adaptive Diagnostic Exam
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
