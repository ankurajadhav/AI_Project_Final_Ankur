/**
 * Student Risk & Early Intervention Center
 */

import React, { useState } from 'react';
import { User, StudentRiskSummary } from '../../types';
import { storageService } from '../../services/storageService';
import { MasteryService } from '../../services/masteryService';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Mail,
} from 'lucide-react';

interface StudentRiskViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const StudentRiskView: React.FC<StudentRiskViewProps> = ({ user, onNavigate }) => {
  const students = storageService.getUsers().filter(u => u.role === 'student');
  const [filterRisk, setFilterRisk] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const riskSummaries: StudentRiskSummary[] = students.map(s => {
    const sid = s.studentId || s.id;
    return MasteryService.getStudentRiskSummary(sid, s.displayName);
  });

  const filtered = riskSummaries.filter(s => {
    const matchesRisk = filterRisk === 'All' || s.riskLevel === filterRisk;
    const matchesSearch = s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.includes(searchTerm);
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <span>Student Risk & Early Intervention Center</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Rule-based and BKT-driven risk categorization to prevent student disengagement and learning loss.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {['All', 'Intervention Recommended', 'Needs Attention', 'On Track'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterRisk === r
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(student => {
          const isCritical = student.riskLevel === 'Intervention Recommended';
          const isWarning = student.riskLevel === 'Needs Attention';

          return (
            <div
              key={student.studentId}
              className={`rounded-2xl border p-5 space-y-4 transition ${
                isCritical
                  ? 'border-rose-500/40 bg-rose-950/10'
                  : isWarning
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800 bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">{student.studentName}</h3>
                    <span className="text-xs text-slate-400">ID #{student.studentId}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                    <span>Avg Mastery: <strong className="text-indigo-400">{Math.round(student.averageMastery * 100)}%</strong></span>
                    <span>•</span>
                    <span>Recent Test Avg: <strong className="text-white">{student.recentTestAverage}%</strong></span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isCritical
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : isWarning
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {student.riskLevel}
                </span>
              </div>

              {/* Diagnostic Reason */}
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {student.reason}
              </p>

              {/* Critical Concepts Tags */}
              {student.criticalConcepts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Mastery Deficits:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {student.criticalConcepts.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => onNavigate('ai_exam_generator')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Assign Adaptive Exam</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
