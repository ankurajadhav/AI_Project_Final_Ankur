/**
 * Reports & Data Export Center (CSV Downloads & Print-Friendly Transcripts)
 */

import React from 'react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { ReportService } from '../../services/reportService';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Users,
  Database,
  BrainCircuit,
  FileCheck2,
  Image,
  ExternalLink,
} from 'lucide-react';

interface ReportsExportViewProps {
  user: User;
}

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({ user }) => {
  const students = storageService.getUsers().filter(u => u.role === 'student');
  const questions = storageService.getQuestions();
  const exams = storageService.getExams();
  const attempts = storageService.getExamAttempts();

  const handleDownloadClassReport = () => {
    const csv = ReportService.generateClassPerformanceCSV();
    ReportService.downloadCSV('AAK_Exam_Class_Performance_Report.csv', csv);
  };

  const handleDownloadQuestionBank = () => {
    const csv = ReportService.generateQuestionBankCSV();
    ReportService.downloadCSV('AAK_Exam_Question_Bank_Export.csv', csv);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-indigo-400" />
            <span>Reports & Data Export Center</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate standardized academic transcripts, mastery matrices, and question bank CSV datasets.
          </p>
        </div>
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
        >
          <Printer className="h-4 w-4" />
          <span>Print / PDF View</span>
        </button>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Class Performance Report */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Cohort Analytics
              </span>
              <Users className="h-5 w-5 text-indigo-400" />
            </div>

            <h3 className="text-base font-bold text-white">Class Master Performance & Risk Report</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export complete roster transcript including average Bayesian mastery, test averages, intervention status flags, and primary deficit concepts.
            </p>

            <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-400 space-y-1">
              <div>• {students.length} Enrolled Student Profiles</div>
              <div>• Normalized BKT Posterior Probabilities</div>
              <div>• Compatible with Excel, Google Sheets, and LMS</div>
            </div>
          </div>

          <button
            onClick={handleDownloadClassReport}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/25"
          >
            <Download className="h-4 w-4" />
            <span>Download Class Performance CSV</span>
          </button>
        </div>

        {/* Question Bank Export */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Item Repository
              </span>
              <Database className="h-5 w-5 text-cyan-400" />
            </div>

            <h3 className="text-base font-bold text-white">Question Bank & Bloom Calibration Export</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Export all {questions.length} questions complete with Bloom levels, difficulty scores, options, and distractor misconception classifications.
            </p>

            <div className="rounded-xl bg-slate-950 p-3 text-xs text-slate-400 space-y-1">
              <div>• {questions.length} Calibrated Assessment Items</div>
              <div>• Full Bloom's Taxonomy & Difficulty Mapping</div>
              <div>• Answer Keys and Diagnostic Explanations</div>
            </div>
          </div>

          <button
            onClick={handleDownloadQuestionBank}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 text-xs font-bold text-white hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/25"
          >
            <Download className="h-4 w-4" />
            <span>Download Question Bank CSV</span>
          </button>
        </div>
      </div>

      {/* Dashboard Screenshots Documentation Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Image className="h-4 w-4 text-indigo-400" />
              <span>Dashboard Screenshots & Evaluation Visual Artifacts</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              High-resolution snapshots for student BKT mastery, class analytics, and model evaluation verification.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
            3 Calibrated Artifacts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Screenshot 1 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Student View</span>
                <span className="text-[10px] text-slate-500">1200 × 700</span>
              </div>
              <h4 className="text-xs font-bold text-white">Student Mastery Dashboard</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Posterior probability curves, 25-concept mastery progress bars, active streak counters, and reward credits.
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                <img
                  src="/screenshots/student-mastery-dashboard.svg"
                  alt="Student Mastery Dashboard Screenshot"
                  className="w-full h-32 object-cover object-top hover:scale-105 transition duration-300"
                />
              </div>
            </div>
            <a
              href="/screenshots/student-mastery-dashboard.svg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <span>View Full Snapshot</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Screenshot 2 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Faculty View</span>
                <span className="text-[10px] text-slate-500">1200 × 700</span>
              </div>
              <h4 className="text-xs font-bold text-white">Teacher Analytics & Class Heatmap</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Class-wide 25-concept heatmap matrix, Bloom distribution histogram, and real-time student intervention flags.
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                <img
                  src="/screenshots/teacher-analytics-dashboard.svg"
                  alt="Teacher Analytics Dashboard Screenshot"
                  className="w-full h-32 object-cover object-top hover:scale-105 transition duration-300"
                />
              </div>
            </div>
            <a
              href="/screenshots/teacher-analytics-dashboard.svg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <span>View Full Snapshot</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Screenshot 3 */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Model Evaluation</span>
                <span className="text-[10px] text-slate-500">1200 × 700</span>
              </div>
              <h4 className="text-xs font-bold text-white">Descriptive Model Evaluation Table</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Held-out evaluation dataset (N=150) comparing automated suggested scores against ground-truth teacher marks.
              </p>
              <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                <img
                  src="/screenshots/model-evaluation-table.svg"
                  alt="Model Evaluation Table Screenshot"
                  className="w-full h-32 object-cover object-top hover:scale-105 transition duration-300"
                />
              </div>
            </div>
            <a
              href="/screenshots/model-evaluation-table.svg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <span>View Full Snapshot</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
