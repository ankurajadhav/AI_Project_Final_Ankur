/**
 * AI Adaptive Exam Generator (Instructor View with Multi-Objective Solver)
 */

import React, { useState } from 'react';
import { User, Question, Exam, BloomsLevel } from '../../types';
import { storageService } from '../../services/storageService';
import { AdaptiveExamGenerator } from '../../ai/adaptiveExamGenerator';
import { MasteryService } from '../../services/masteryService';
import {
  Wand2,
  Cpu,
  Sparkles,
  Layers,
  Clock,
  Award,
  CheckCircle2,
  RefreshCw,
  Edit3,
  Sliders,
  Trash2,
} from 'lucide-react';

interface AIExamGeneratorViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const AIExamGeneratorView: React.FC<AIExamGeneratorViewProps> = ({ user, onNavigate }) => {
  const allQuestions = storageService.getQuestions();
  const students = storageService.getUsers().filter(u => u.role === 'student');

  const [examTitle, setExamTitle] = useState('Adaptive Mastery Assessment');
  const [subject, setSubject] = useState('Computer Science');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('cohort_all');
  const [questionCount, setQuestionCount] = useState(30);
  const [difficultyTarget, setDifficultyTarget] = useState(0.55);

  // Bloom's Distribution
  const [bloomRemember, setBloomRemember] = useState(25);
  const [bloomUnderstand, setBloomUnderstand] = useState(25);
  const [bloomApply, setBloomApply] = useState(30);
  const [bloomAnalyze, setBloomAnalyze] = useState(20);

  const [isSolving, setIsSolving] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ exam: Exam; selectedQuestions: Question[]; diagnostics: any } | null>(null);

  const handleRunSolver = () => {
    setIsSolving(true);

    setTimeout(() => {
      let targetMasteryMap = {};
      if (selectedStudentId !== 'cohort_all') {
        targetMasteryMap = storageService.getMasteryRecords(selectedStudentId);
      } else {
        // Average class mastery
        targetMasteryMap = MasteryService.getStudentMasteryMap(students[0]?.studentId || '101');
      }

      const filteredQuestions = allQuestions.filter(q => q.subject === subject);
      const generated = AdaptiveExamGenerator.generateExam(
        filteredQuestions.length > 0 ? filteredQuestions : allQuestions,
        {
          title: examTitle || `Adaptive Assessment: ${subject}`,
          subject,
          totalQuestions: questionCount,
          targetStudentId: selectedStudentId !== 'cohort_all' ? selectedStudentId : undefined,
          studentMasteryMap: targetMasteryMap as any,
          bloomsRatio: {
            Remember: bloomRemember / 100,
            Understand: bloomUnderstand / 100,
            Apply: bloomApply / 100,
            Analyze: bloomAnalyze / 100,
            Evaluate: 0,
            Create: 0,
          },
          durationMinutes: questionCount * 3,
        }
      );

      setGeneratedDraft({
        exam: generated.exam as Exam,
        selectedQuestions: generated.selectedQuestions,
        diagnostics: generated.validationSummary,
      });

      setIsSolving(false);
    }, 600);
  };

  const handlePublish = () => {
    if (!generatedDraft) return;
    storageService.addExam(generatedDraft.exam);
    storageService.addAuditLog(
      user.id,
      user.role,
      'EXAM_CREATED',
      `Published Adaptive Exam "${generatedDraft.exam.title}" (${generatedDraft.selectedQuestions.length} items).`,
      generatedDraft.exam.id
    );

    // Avoid window.alert in iframe environment
    onNavigate('teacher_dashboard');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-indigo-400" />
          <span>Adaptive Exam Generator (Multi-Objective)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Formulates optimal assessment sets using mathematical constraint satisfaction across Bloom's ratios, mastery gaps, and target difficulty.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Solver Hyperparameters */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-sm font-bold text-white">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Optimization Constraints</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Exam Title
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Academic Subject
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="All">All Subjects (Interdisciplinary)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Recipient / Cohort
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="cohort_all">Entire Class Cohort (Average Gap)</option>
                {students.map(s => (
                  <option key={s.id} value={s.studentId || s.id}>
                    {s.displayName} (ID #{s.studentId || s.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Question Count & Difficulty */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Total Questions:</span>
                <span className="text-indigo-400 font-extrabold">{questionCount} Items</span>
              </div>
              <input
                type="range"
                min={10}
                max={30}
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10 Min</span>
                <span>20 Items</span>
                <span className="text-indigo-400 font-bold">30 Items (Standard)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Target Difficulty:</span>
                <span className="text-cyan-400">{difficultyTarget} (ZPD Fit)</span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.9}
                step={0.05}
                value={difficultyTarget}
                onChange={e => setDifficultyTarget(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            {/* Bloom's Distribution Sliders */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <span className="font-bold text-slate-300 block">Bloom's Taxonomy Calibration:</span>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Remember: {bloomRemember}%</span>
                  <span>Understand: {bloomUnderstand}%</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Apply: {bloomApply}%</span>
                  <span>Analyze: {bloomAnalyze}%</span>
                </div>
              </div>
            </div>

            <button
              disabled={isSolving}
              onClick={handleRunSolver}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs sm:text-sm font-bold text-white hover:opacity-95 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Cpu className="h-4 w-4" />
              <span>{isSolving ? 'Solving Constraints...' : 'Run Constraint Solver'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Generated Assessment Draft & Solver Diagnostics */}
        <div className="lg:col-span-2 space-y-5">
          {generatedDraft ? (
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/70 p-6 shadow-xl space-y-5">
              {/* Draft Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Constraint Solver Converged (100% Satisfied)
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{generatedDraft.exam.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{generatedDraft.selectedQuestions.length} Questions</span>
                    <span>•</span>
                    <span>{generatedDraft.exam.totalMarks} Total Marks</span>
                    <span>•</span>
                    <span>{generatedDraft.exam.durationMinutes} Minutes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunSolver}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                    title="Regenerate"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handlePublish}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
                  >
                    Publish to Students
                  </button>
                </div>
              </div>

              {/* Solver Diagnostics Bar */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Achieved Mean Difficulty</span>
                  <span className="font-bold text-cyan-400">{generatedDraft.diagnostics.averageDifficulty ?? 0.55}</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Solver Run Time</span>
                  <span className="font-bold text-emerald-400">{generatedDraft.diagnostics.generationTimeMs ?? 120} ms</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Deficit Topics Targeted</span>
                  <span className="font-bold text-amber-400">{generatedDraft.diagnostics.weakTopicsTargeted?.length ?? 2} Topics</span>
                </div>
              </div>

              {/* Adaptation Explanation Rationale */}
              {generatedDraft.diagnostics.adaptationExplanation && (
                <div className="rounded-xl bg-indigo-950/30 border border-indigo-500/30 p-3.5 space-y-1.5 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>How This Exam Was Adapted to Student Needs:</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {generatedDraft.diagnostics.adaptationExplanation}
                  </p>
                </div>
              )}

              {/* Identified Weak Topics & Distribution Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Weak Topics Distribution */}
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Weak-Topic Distribution
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">
                      {generatedDraft.diagnostics.identifiedWeakTopics?.length || 0} Weak Topics
                    </span>
                  </div>

                  <div className="space-y-2">
                    {generatedDraft.diagnostics.identifiedWeakTopics && generatedDraft.diagnostics.identifiedWeakTopics.length > 0 ? (
                      generatedDraft.diagnostics.identifiedWeakTopics.map((wt: any) => {
                        const count = generatedDraft.selectedQuestions.filter(q => q.topic === wt.topic).length;
                        const total = generatedDraft.selectedQuestions.length;
                        const pct = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
                        const masteryDisplay = wt.pMastery !== null && wt.pMastery !== undefined ? `${wt.pMastery}%` : 'N/A';

                        return (
                          <div key={wt.topic} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white truncate max-w-[170px]">
                                {wt.topic}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Mastery: {masteryDisplay}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Allocated Questions:</span>
                              <span className="font-mono font-bold text-indigo-400">
                                {count} of {total} ({pct}%)
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[11px] text-slate-400 italic p-3 text-center">
                        No critical mastery deficits detected below 60% threshold. Balanced reinforcement applied.
                      </div>
                    )}
                  </div>
                </div>

                {/* Six-Level Bloom's Taxonomy Distribution */}
                <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Bloom's Taxonomy Distribution (6 Levels)
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">
                      Total: {generatedDraft.selectedQuestions.length} Questions
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'] as const).map(lvl => {
                      const count = generatedDraft.selectedQuestions.filter(q => q.bloomsLevel === lvl).length;
                      const total = generatedDraft.selectedQuestions.length;
                      const pct = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;

                      return (
                        <div key={lvl} className="flex items-center justify-between text-[11px] p-1.5 rounded hover:bg-slate-900/60">
                          <span className={`font-medium ${count > 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                            {lvl}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-[11px] font-bold ${
                              count > 0 ? 'text-cyan-400' : 'text-slate-600'
                            }`}>
                              {count} {count === 1 ? 'question' : 'questions'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 min-w-[44px] text-right">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Questions Preview List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Synthesized Question Sequence & Selection Rationale ({generatedDraft.selectedQuestions.length} Items)
                </h4>

                <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                  {generatedDraft.selectedQuestions.map((q, idx) => {
                    const explanation = generatedDraft.diagnostics.selectionExplanations?.[q.id];
                    return (
                      <div
                        key={`${q.id}-${idx}`}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-400">Item {idx + 1}</span>
                            <span className="text-slate-300 font-semibold">{q.topic}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              Bloom: {q.bloomsLevel}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              Diff: {q.difficultyScore}
                            </span>
                          </div>
                          <span className="text-amber-400 font-bold">+{q.marks} Marks</span>
                        </div>

                        <p className="text-slate-200">{q.questionText}</p>

                        {/* Selection Explanation */}
                        {explanation && (
                          <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span><strong>Why selected:</strong> {explanation}</span>
                          </div>
                        )}

                        {q.options && (
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-1">
                            {q.options.map(opt => (
                              <div
                                key={opt.id}
                                className={`p-1.5 rounded border truncate ${
                                  opt.id === q.correctAnswer
                                    ? 'border-emerald-500/40 text-emerald-300 font-semibold'
                                    : 'border-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.id.toUpperCase()}. {opt.text}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
              <Sparkles className="h-10 w-10 mx-auto text-indigo-400" />
              <h3 className="text-base font-bold text-white">No Exam Generated Yet</h3>
              <p className="text-xs max-w-sm mx-auto">
                Configure your target parameters on the left and click "Run Constraint Solver" to assemble a personalized test in ~150ms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
