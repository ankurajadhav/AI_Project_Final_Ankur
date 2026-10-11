/**
 * Distraction-Free Active Exam Taking Room
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, Exam, Question, ExamAttempt } from '../../types';
import { storageService } from '../../services/storageService';
import { ExamService } from '../../services/examService';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Send,
  X,
} from 'lucide-react';

interface ActiveExamTakerProps {
  user: User;
  examId: string;
  onFinishExam?: (attempt: ExamAttempt) => void;
  onComplete?: (attemptId: string) => void;
  onCancel: () => void;
}

export const ActiveExamTaker: React.FC<ActiveExamTakerProps> = ({
  user,
  examId,
  onFinishExam,
  onComplete,
  onCancel,
}) => {
  const exam = storageService.getExams().find(e => e.id === examId);
  const allQuestions = storageService.getQuestions();
  
  // Assemble EXACTLY 30 questions for this exam
  let initialQuestions: Question[] = exam
    ? allQuestions.filter(q => exam.questionIds.includes(q.id))
    : [];

  // If questions are fewer than 30, supplement from question pool to guarantee exactly 30 questions
  if (initialQuestions.length < 30) {
    const existingIds = new Set(initialQuestions.map(q => q.id));
    const extra = allQuestions.filter(q => !existingIds.has(q.id));
    const needed = 30 - initialQuestions.length;
    const added = extra.slice(0, needed);
    initialQuestions = [...initialQuestions, ...added];
    // Sync the exam object in storage if it had fewer than 30 questions
    if (exam && exam.questionIds.length < 30) {
      exam.questionIds = initialQuestions.map(q => q.id);
      exam.totalMarks = initialQuestions.reduce((s, q) => s + q.marks, 0);
      storageService.updateExam(exam);
    }
  }

  // Cap at exactly 30 questions
  const questions: Question[] = initialQuestions.slice(0, 30);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState((exam?.durationMinutes || 20) * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore transient draft from sessionStorage if present (prevent storing answers in localStorage)
  useEffect(() => {
    const draftKey = `exam_draft_${examId}_${user.studentId || user.id}`;
    try {
      const saved = sessionStorage.getItem(draftKey) || localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.flagged) setFlagged(parsed.flagged);
      }
      // Clean up legacy localStorage if it existed
      localStorage.removeItem(draftKey);
    } catch (e) {
      console.warn(e);
    }
  }, [examId, user.id, user.studentId]);

  // Autosave answers in transient sessionStorage on change
  useEffect(() => {
    const draftKey = `exam_draft_${examId}_${user.studentId || user.id}`;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ answers, flagged }));
    } catch (e) {
      // Ignore
    }
  }, [answers, flagged, examId, user.id, user.studentId]);

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAutoSubmit = useCallback(() => {
    const timeTaken = (Date.now() - startTime) / 60000;
    const attempt = ExamService.submitExamAttempt(
      examId,
      user.studentId || user.id,
      user.displayName,
      answers,
      Math.max(1, timeTaken)
    );
    // Clear draft
    sessionStorage.removeItem(`exam_draft_${examId}_${user.studentId || user.id}`);
    localStorage.removeItem(`exam_draft_${examId}_${user.studentId || user.id}`);
    if (onComplete) {
      onComplete(attempt.id);
    } else if (onFinishExam) {
      onFinishExam(attempt);
    }
  }, [answers, examId, onComplete, onFinishExam, startTime, user.displayName, user.id, user.studentId]);

  const handleManualSubmit = () => {
    setIsSubmitting(true);
    const timeTaken = (Date.now() - startTime) / 60000;
    const attempt = ExamService.submitExamAttempt(
      examId,
      user.studentId || user.id,
      user.displayName,
      answers,
      Math.max(1, timeTaken)
    );
    sessionStorage.removeItem(`exam_draft_${examId}_${user.studentId || user.id}`);
    localStorage.removeItem(`exam_draft_${examId}_${user.studentId || user.id}`);
    setIsSubmitting(false);
    if (onComplete) {
      onComplete(attempt.id);
    } else if (onFinishExam) {
      onFinishExam(attempt);
    }
  };

  if (!exam || questions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-4">
        <AlertCircle className="h-10 w-10 mx-auto text-amber-400" />
        <h3 className="text-lg font-bold text-white">Assessment not found or has no active questions.</h3>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold">
          Return to Exams
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ.id] || '';
  const isFlagged = !!flagged[currentQ.id];

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[k];
    return Array.isArray(val) ? val.length > 0 : String(val).trim().length > 0;
  }).length;

  const flaggedCount = Object.values(flagged).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6">
      {/* Top Test Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Save progress and return to dashboard? You can resume this exam later.')) {
                onCancel();
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
            title="Save & Exit"
          >
            <X className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white leading-tight">{exam.title}</h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{exam.subject}</span>
              <span>•</span>
              <span className="text-indigo-400">{questions.length} Questions</span>
              <span>•</span>
              <span className="text-amber-400">{exam.totalMarks} Total Marks</span>
            </div>
          </div>
        </div>

        {/* Timer & Submit CTA */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              secondsLeft < 300
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTime(secondsLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="mt-4 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Cols: Question Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-6">
            {/* Question Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  Q{currentIndex + 1}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {currentQ.topic}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  Bloom: {currentQ.bloomsLevel}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  +{currentQ.marks} Marks
                </span>
                <button
                  onClick={() => {
                    setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                    isFlagged
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Flag className="h-3 w-3" />
                  <span>{isFlagged ? 'Flagged for Review' : 'Mark Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              {currentQ.questionText}
            </div>

            {/* Options / Input Field depending on questionType */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options && currentQ.options.length > 0 ? (
                currentQ.options.map(opt => {
                  const isSelected = currentAnswer === opt.id || (Array.isArray(currentAnswer) && currentAnswer.includes(opt.id));
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setAnswers(prev => ({ ...prev, [currentQ.id]: opt.id }));
                      }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition ${
                        isSelected
                          ? 'bg-indigo-600/25 text-white border-indigo-500 shadow-md shadow-indigo-600/10'
                          : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'border-slate-600 text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                      <span className="flex-1">{opt.text}</span>
                    </button>
                  );
                })
              ) : (
                /* Descriptive / Short Answer Textarea */
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Type your solution, step-by-step reasoning or mathematical explanation:</span>
                    <span>Rubric Evaluator Active</span>
                  </label>
                  <textarea
                    rows={6}
                    value={String(currentAnswer)}
                    onChange={e => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                    placeholder="Enter comprehensive answer explaining logic, steps, formulas or trade-offs..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs sm:text-sm text-slate-100 font-mono focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setAnswers(prev => {
                    const copy = { ...prev };
                    delete copy[currentQ.id];
                    return copy;
                  });
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear Selection</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition"
                  >
                    <span>Review & Submit</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Question Navigation Matrix */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Questions Palette ({answeredCount}/{questions.length} Answered)
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAns = !!answers[q.id] && String(answers[q.id]).trim().length > 0;
                const isFlg = !!flagged[q.id];
                const isCur = currentIndex === idx;

                let btnClass = 'bg-slate-800 text-slate-400 border-slate-700';
                if (isAns) btnClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
                if (isFlg) btnClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
                if (isCur) btnClass += ' ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900';

                return (
                  <button
                    key={`${q.id}-${idx}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex h-10 w-full items-center justify-center rounded-xl border text-xs font-semibold transition ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlg && (
                      <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-emerald-500/30 border border-emerald-500/50" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-amber-500/30 border border-amber-500/50" />
                <span>Flagged for review ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-slate-800 border border-slate-700" />
                <span>Unanswered ({questions.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Submit Assessment?</h3>
                <p className="text-xs text-slate-400">Your answers will be evaluated by the diagnostic scoring engine.</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions Answered:</span>
                <span className="font-bold text-emerald-400">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Flagged for Review:</span>
                <span className="font-bold text-amber-400">{flaggedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered:</span>
                <span className="font-bold text-rose-400">{questions.length - answeredCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Keep Reviewing
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleManualSubmit}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
              >
                {isSubmitting ? 'Evaluating Scoring Engine...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
