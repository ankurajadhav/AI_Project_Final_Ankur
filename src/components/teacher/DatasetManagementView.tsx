/**
 * Dataset Management & Audit Log View
 */

import React, { useState } from 'react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import {
  Database,
  RotateCcw,
  History,
  FileCheck2,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface DatasetManagementViewProps {
  user: User;
}

export const DatasetManagementView: React.FC<DatasetManagementViewProps> = ({ user }) => {
  const [recordsCount, setRecordsCount] = useState(storageService.getTeacherGradingRecords().length);
  const [questionsCount, setQuestionsCount] = useState(storageService.getQuestions().length);
  const [examsCount, setExamsCount] = useState(storageService.getExams().length);
  const [auditLogs, setAuditLogs] = useState(storageService.getAuditLogs());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset the system database to seed state? This will refresh demo users, attempts, and questions.')) {
      storageService.resetToDefaultData();
      setRecordsCount(storageService.getTeacherGradingRecords().length);
      setQuestionsCount(storageService.getQuestions().length);
      setExamsCount(storageService.getExams().length);
      setAuditLogs(storageService.getAuditLogs());
      setStatusMsg('System state successfully reset to seed data!');
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-400" />
            <span>Dataset Management & Audit Trail</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            System storage metrics, ML training samples, and immutable administrative audit logs.
          </p>
        </div>
        <button
          onClick={handleResetData}
          className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset to Seed State</span>
        </button>
      </div>

      {statusMsg && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3.5 text-xs text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Dataset Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Calibrated Questions
          </span>
          <div className="text-2xl font-bold text-white mt-1">{questionsCount} Items</div>
          <p className="text-[11px] text-slate-400 mt-1">Bloom Level Tagged</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Grading ML Samples
          </span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{recordsCount} Records</div>
          <p className="text-[11px] text-slate-400 mt-1">Random Forest Dataset</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Published Exams
          </span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{examsCount} Exams</div>
          <p className="text-[11px] text-slate-400 mt-1">Active on Student Rosters</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Storage Engine
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">Backend Database</div>
          <p className="text-[11px] text-slate-400 mt-1">Persistent Node.js Database (/data/aak_exam_db.json)</p>
        </div>
      </div>

      {/* Security Advisory Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-2">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
          <CheckCircle2 className="h-4 w-4" />
          <span>Security & Data Privacy Standard Enforced</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Security Note:</strong> Real student identities, academic records, exam attempts, and teacher grading decisions are persisted strictly in the verified backend database (/data/aak_exam_db.json) via authenticated session APIs. Do not store real student data in browser local storage.
        </p>
      </div>

      {/* Audit Logs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-400" />
            <span>Administrative Audit Trail</span>
          </h3>
          <span className="text-xs text-slate-400">{auditLogs.length} Events Logged</span>
        </div>

        <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
          {auditLogs.map(log => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-400 font-mono">[{log.action}]</span>
                  <span className="text-slate-200">{log.details}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  User ID: {log.userId} · Role: {log.userRole}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}

          {auditLogs.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">No logs recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};
