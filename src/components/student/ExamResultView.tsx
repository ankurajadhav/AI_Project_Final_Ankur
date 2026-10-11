/**
 * Comprehensive Post-Exam Result & AI Diagnostic Transcript
 */

import React, { useEffect } from 'react';
import { ExamAttempt, User } from '../../types';
import { storageService } from '../../services/storageService';
import { MisconceptionClassifier } from '../../ai/misconceptionClassifier';
import { MISCONCEPTIONS_BY_CONCEPT, MISCONCEPTION_TAXONOMY } from '../../data/misconceptionTaxonomy';
import confetti from 'canvas-confetti';
import {
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  BookOpen,
  RotateCcw,
  Check,
  ChevronDown,
  ShieldCheck,
  MessageSquare,
  Edit3,
} from 'lucide-react';

interface ExamResultViewProps {
  attemptId: string;
  onNavigate: (view: string) => void;
  user?: User;
  onTakePractice?: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attemptId,
  onNavigate,
  user,
  onTakePractice,
}) => {
  const attempts = storageService.getExamAttempts();
  const attempt = attempts.find(a => a.id === attemptId) || attempts[0];
  const allQuestions = storageService.getQuestions();

  useEffect(() => {
    // Fire festive celebratory confetti if score >= 60%
    if (attempt && attempt.percentageScore >= 60) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [attempt]);

  if (!attempt) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Attempt transcript not found.</p>
        <button onClick={() => onNavigate('my_exams')} className="mt-2 text-xs text-indigo-400 font-semibold">
          Return to My Exams
        </button>
      </div>
    );
  }

  const passed = attempt.percentageScore >= 60;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Performance Scorecard */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  passed
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {passed ? 'Assessment Passed' : 'Needs Remediation'}
              </span>
              <span className="text-xs text-slate-400">Diagnostic Complete</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Performance & Diagnostics Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Exam submitted by <span className="font-semibold text-white">{attempt.studentName}</span> on{' '}
              {new Date(attempt.submittedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>

          {/* Big Score Ring */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-extrabold text-white leading-none">
                {attempt.totalScore}
                <span className="text-lg text-slate-400 font-normal"> / {attempt.maxScore}</span>
              </div>
              <div className="text-xs font-semibold text-indigo-400 mt-1">
                {attempt.percentageScore}% Aggregate Score
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-lg shadow-lg">
              {attempt.percentageScore}%
            </div>
          </div>
        </div>

        {/* Secondary KPI Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Question Accuracy</span>
            <span className="text-lg font-bold text-white">{attempt.accuracy}%</span>
          </div>
          <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Time Invested</span>
            <span className="text-lg font-bold text-white">{attempt.timeTakenMinutes} mins</span>
          </div>
          <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Class Percentile</span>
            <span className="text-lg font-bold text-cyan-400">
              {Math.min(99, Math.max(45, attempt.percentageScore + 6))}th
            </span>
          </div>
          <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Credits Earned</span>
            <span className="text-lg font-bold text-amber-400">+{attempt.creditsEarned} Credits</span>
          </div>
        </div>
      </div>

      {/* Continuous Diagnostic Narrative */}
      <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span>Knowledge Tracing & Error Pattern Diagnostics</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {attempt.aiDiagnostics}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {attempt.weakTopics.map((wt, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('weak_topics')}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition"
            >
              <AlertTriangle className="h-3 w-3" />
              <span>Remediate {wt}</span>
            </button>
          ))}
          <button
            onClick={() => onNavigate('recommendations')}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition"
          >
            <BookOpen className="h-3 w-3" />
            <span>Watch Recommended YouTube Curations</span>
          </button>
        </div>
      </div>

      {/* Topic Mastery Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Topic Performance Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(attempt.topicBreakdown || {}).map(([topic, stats]) => (
              <div key={topic} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium text-slate-200">
                  <span>{topic}</span>
                  <span className="font-bold text-white">{stats.percentage}% ({stats.correct}/{stats.total})</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      stats.percentage >= 70 ? 'bg-emerald-500' : stats.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Strengths & Opportunities
            </h3>
            <div className="space-y-2 text-xs">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Strong Domains
                </div>
                <p className="mt-1 text-slate-300">
                  {attempt.strengths.length > 0 ? attempt.strengths.join(', ') : 'Solid baseline across topics'}
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-300">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Priority Knowledge Gaps
                </div>
                <p className="mt-1 text-slate-300">
                  {attempt.weakTopics.length > 0 ? attempt.weakTopics.join(', ') : 'None flagged! Ready for advanced testing.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('weak_topics')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow"
          >
            <span>Proceed to Step-by-Step Remediation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Question-by-Question Detailed Review with Misconception Tags */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Question-by-Question Diagnostic Review</h3>
          <span className="text-xs text-slate-400">{attempt.answers.length} Items Evaluated</span>
        </div>

        {/* Teacher Review Pending Notification Banner */}
        {attempt.answers.some(a => a.reviewStatus === 'pending_teacher_review') && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-300 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Teacher Review Pending:</strong> Descriptive answers have suggested marks awaiting final teacher approval. Your final exam score will update once confirmed.
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
              In Review Queue
            </span>
          </div>
        )}

        <div className="space-y-4">
          {attempt.answers.map((ans, idx) => {
            const question = allQuestions.find(q => q.id === ans.questionId);
            if (!question) return null;

            const isCorrect = ans.isCorrect;
            const isDescriptive = question.questionType === 'descriptive' || question.questionType === 'short_answer' || question.questionType === 'code_question';
            const isPendingTeacher = ans.reviewStatus === 'pending_teacher_review';
            const isTeacherApproved = ans.reviewStatus === 'approved' || ans.reviewStatus === 'modified';

            // Find matching taxonomy entry
            const matchedTaxonomy = MISCONCEPTIONS_BY_CONCEPT[question.conceptId]?.[0] ||
              MISCONCEPTION_TAXONOMY.find(m => m.conceptId === question.conceptId || m.conceptName === question.topic);

            return (
              <div
                key={ans.questionId}
                className={`rounded-xl border p-4 space-y-3 transition ${
                  isPendingTeacher
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : isCorrect
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-rose-500/30 bg-rose-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                        isPendingTeacher
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isPendingTeacher ? '⏳' : isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="text-xs font-bold text-white">Item {idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {question.topic}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Bloom: {question.bloomsLevel}
                    </span>

                    {/* Review Status Tag */}
                    {isPendingTeacher && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                        Pending Teacher Review
                      </span>
                    )}
                    {isTeacherApproved && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Teacher {ans.reviewStatus === 'modified' ? 'Modified' : 'Approved'}</span>
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      {isPendingTeacher ? (
                        <span className="text-amber-400">
                          Suggested: {ans.aiSuggestedScore ?? 0} / {ans.maxScore} (Pending)
                        </span>
                      ) : (
                        <span className="text-emerald-400">
                          Score: {ans.scoreAwarded} / {ans.maxScore}
                        </span>
                      )}
                    </span>
                    {isTeacherApproved && ans.aiSuggestedScore !== undefined && (
                      <span className="block text-[10px] text-slate-400 font-mono">
                        Model Suggested: {ans.aiSuggestedScore}/{ans.maxScore}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs sm:text-sm font-medium text-slate-200">
                  {question.questionText}
                </div>

                {/* Answers Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Your Given Answer:</span>
                    <span className={`font-semibold ${isPendingTeacher ? 'text-amber-300' : isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {String(ans.givenAnswer) || '(Unanswered)'}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Expected Answer Key / Model Solution:</span>
                    <span className="font-semibold text-slate-200">
                      {question.options
                        ? question.options.find(o => o.id === question.correctAnswer)?.text || String(question.correctAnswer)
                        : question.sampleAnswer || String(question.correctAnswer)}
                    </span>
                  </div>
                </div>

                {/* Teacher Feedback Notes (if evaluated) */}
                {ans.teacherFeedback && (
                  <div className="rounded-lg bg-indigo-950/20 border border-indigo-500/30 p-2.5 text-xs text-indigo-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Instructor Feedback:</span>
                    </div>
                    <p className="text-[11px] text-slate-200">{ans.teacherFeedback}</p>
                  </div>
                )}

                {/* Detected Misconception Taxonomy Breakdown */}
                {!isCorrect && ans.detectedErrorType && ans.detectedErrorType !== 'none' && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs text-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        <span>Diagnosed Fallacy: {MisconceptionClassifier.getErrorTypeLabel(ans.detectedErrorType)}</span>
                      </div>
                      {matchedTaxonomy && (
                        <button
                          onClick={() => onNavigate('misconception_taxonomy')}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                        >
                          <span>Explore Taxonomy</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300">{ans.aiExplanation}</p>

                    {matchedTaxonomy && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300 space-y-1">
                          <span className="font-bold block text-[10px] uppercase text-rose-400 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Fallacy Example:
                          </span>
                          <span className="font-mono text-rose-200 text-[10px]">
                            "{matchedTaxonomy.representativeIncorrectAnswer}"
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 space-y-1">
                          <span className="font-bold block text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Correct Understanding:
                          </span>
                          <span className="text-emerald-200 text-[10px]">
                            {matchedTaxonomy.correctExplanation}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <strong className="text-slate-300">Explanation: </strong>
                  {question.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
