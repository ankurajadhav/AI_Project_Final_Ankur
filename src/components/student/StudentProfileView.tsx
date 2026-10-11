/**
 * Student Profile & Progress History View
 */

import React from 'react';
import { User } from '../../types';
import { storageService } from '../../services/storageService';
import { MasteryService } from '../../services/masteryService';
import { Avatar } from '../common/Avatar';
import {
  User as UserIcon,
  GraduationCap,
  Award,
  History,
  Calendar,
  BrainCircuit,
  FileCheck2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface StudentProfileViewProps {
  user: User;
  onViewResult: (attemptId: string) => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  onViewResult,
}) => {
  const studentId = user.studentId || '24BDS0162';
  const attempts = storageService.getExamAttempts().filter(a => a.studentId === studentId);
  const masteryMap = MasteryService.getStudentMasteryMap(studentId);
  const avgMastery = MasteryService.getAverageMastery(studentId);
  const rewardProfile = storageService.getRewardProfile(studentId);
  const risk = MasteryService.getStudentRiskSummary(studentId, user.displayName);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar name={user.displayName} role={user.role} size="xl" className="border-2 border-indigo-500/40 shadow-lg" />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Student ID #{studentId}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4 text-indigo-400" /> B.Tech Computer Science & Data Systems
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Enrolled 2024
              </span>
            </div>

            {/* Risk Status Pill */}
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs text-slate-400">Academic Standing:</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  risk.riskLevel === 'On Track'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : risk.riskLevel === 'Needs Attention'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {risk.riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800">
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Average Mastery</span>
            <span className="text-xl font-bold text-indigo-400">{Math.round(avgMastery * 100)}%</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Assessments Taken</span>
            <span className="text-xl font-bold text-white">{attempts.length}</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Available Credits</span>
            <span className="text-xl font-bold text-amber-400">{rewardProfile.availableCredits}</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block">Coupons Claimed</span>
            <span className="text-xl font-bold text-emerald-400">{rewardProfile.redeemedCoupons.length}</span>
          </div>
        </div>
      </div>

      {/* Historical Assessment Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-400" />
            <span>Assessment Submission Transcript</span>
          </h3>
          <span className="text-xs text-slate-400">{attempts.length} Total Submissions</span>
        </div>

        <div className="space-y-3">
          {attempts.map(att => (
            <div
              key={att.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-950 p-4 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white">Assessment Attempt #{att.id.slice(-6)}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      att.percentageScore >= 60
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {att.percentageScore}% Score
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Submitted on {new Date(att.submittedAt).toLocaleDateString()} · {att.answers.length} Questions · {att.timeTakenMinutes} mins
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block text-xs">
                  <div className="font-bold text-white">{att.totalScore} / {att.maxScore} marks</div>
                  <div className="text-slate-400">{att.accuracy}% accuracy</div>
                </div>
                <button
                  onClick={() => onViewResult(att.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}

          {attempts.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No exam attempts recorded yet. Launch your first practice exam to build your transcript.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
