/**
 * AI Personalized & Adaptive Test Launcher
 */

import React, { useState } from 'react';
import { User, ConceptMastery } from '../../types';
import { storageService } from '../../services/storageService';
import { MasteryService } from '../../services/masteryService';
import { AdaptiveExamGenerator, ExamGenerationResult } from '../../ai/adaptiveExamGenerator';
import { BKTEngine } from '../../ai/bktEngine';
import {
  Sparkles,
  BrainCircuit,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  Play,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AIPersonalizedTestLauncherProps {
  user: User;
  onStartExam: (examId: string) => void;
  onNavigate: (view: string) => void;
}

export const AIPersonalizedTestLauncher: React.FC<AIPersonalizedTestLauncherProps> = ({
  user,
  onStartExam,
  onNavigate,
}) => {
  const studentId = user.studentId || '101';
  const masteryMap = MasteryService.getStudentMasteryMap(studentId);
  const concepts = Object.values(masteryMap);
  const questions = storageService.getQuestions();

  const weakConcepts = concepts.filter(c => c.pMastery < 0.65).sort((a, b) => a.pMastery - b.pMastery);
  const targetConcepts = weakConcepts.length > 0 ? weakConcepts : concepts.slice(0, 3);

  const [questionCount, setQuestionCount] = useState<number>(30);
  const [focusPriority, setFocusPriority] = useState<'remediation' | 'balanced' | 'challenge'>('remediation');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [generatedResult, setGeneratedResult] = useState<ExamGenerationResult | null>(null);

  const handleLaunchAdaptiveTest = () => {
    setIsGenerating(true);
    setGenerationLogs(['Reading student BKT Bayesian posterior vector...']);

    setTimeout(() => {
      setGenerationLogs(prev => [
        ...prev,
        `Identified ${weakConcepts.length} mastery deficit concepts (P(M) < 0.65)`,
        `Applying Zone of Proximal Development (ZPD) heuristic...`,
      ]);
    }, 250);

    setTimeout(() => {
      setGenerationLogs(prev => [
        ...prev,
        `Executing Multi-Objective Constraint Solver (Bloom Taxonomies + Difficulty)...`,
      ]);
    }, 550);

    setTimeout(() => {
      const targetIds = targetConcepts.map(c => c.conceptName);
      const generated = AdaptiveExamGenerator.generateExam(questions, {
        totalQuestions: questionCount,
        selectedTopics: targetIds,
        targetStudentId: studentId,
        targetStudentName: user.displayName,
        studentMasteryMap: masteryMap,
        targetDifficulty: focusPriority === 'challenge' ? 'Hard' : focusPriority === 'remediation' ? 'Remediation' : 'Adaptive',
        durationMinutes: questionCount * 3,
      });

      if (generated.exam.id) {
        storageService.addExam(generated.exam as any);
        setGeneratedResult(generated);
        setIsGenerating(false);
      }
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-cyan-400" />
          <span>Adaptive Exam Synthesis Engine</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Dynamically constructs an assessment mathematically optimized to remediate your specific Bayesian Knowledge Tracing gaps.
        </p>
      </div>

      {/* Real-time Diagnostics Matrix */}
      <div className="rounded-2xl border border-indigo-500/20 bg-slate-900/70 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Targeted Knowledge Deficit Analysis</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">BKT Engine Active</span>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-300">
            The adaptive generator has analyzed your past responses and prioritized the following concepts:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {targetConcepts.slice(0, 3).map(c => {
              const color = BKTEngine.getStatusColor(c.status);
              return (
                <div key={c.conceptId} className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{c.conceptName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color.bg} ${color.text} ${color.border}`}>
                      {Math.round(c.pMastery * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        c.pMastery >= 0.6 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.round(c.pMastery * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Status: <strong className="text-slate-300">{c.status}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customization Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exam Length
            </label>
            <div className="flex gap-2">
              {[30, 20, 15].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setQuestionCount(cnt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {cnt} Questions (~{cnt * 1.5}m)
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pedagogical Objective
            </label>
            <div className="flex gap-2">
              {[
                { id: 'remediation', label: 'Remediation' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'challenge', label: 'Challenge' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setFocusPriority(mode.id as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                    focusPriority === mode.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Generation Console */}
        {isGenerating && (
          <div className="rounded-xl bg-slate-950 p-4 border border-indigo-500/30 space-y-2 font-mono text-xs text-indigo-300">
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <Cpu className="h-4 w-4 animate-spin" />
              <span>Synthesizing Personalized Exam...</span>
            </div>
            {generationLogs.map((log, idx) => (
              <div key={idx} className="text-[11px] text-slate-300">
                › {log}
              </div>
            ))}
          </div>
        )}

        {!generatedResult ? (
          <button
            disabled={isGenerating}
            onClick={handleLaunchAdaptiveTest}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition cursor-pointer"
          >
            <Play className="h-4 w-4" />
            <span>{isGenerating ? 'Synthesizing Calibrated Assessment...' : 'Synthesize Personalized Assessment'}</span>
          </button>
        ) : (
          <div className="space-y-5 pt-3 border-t border-slate-800">
            {/* Header info */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Adaptive Assessment Calibrated
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {generatedResult.exam.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="text-white font-semibold">{generatedResult.validationSummary.totalQuestions} Questions</span>
                    <span>•</span>
                    <span className="text-amber-400">{generatedResult.exam.totalMarks} Total Marks</span>
                    <span>•</span>
                    <span className="text-cyan-400">{generatedResult.exam.durationMinutes} Minutes</span>
                  </div>
                </div>

                <button
                  onClick={() => onStartExam(generatedResult.exam.id!)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-xs sm:text-sm font-bold text-white hover:opacity-95 transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Begin Exam Now</span>
                </button>
              </div>

              {/* Adaptation explanation */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Adaptive Rationale (How exam was adapted to your learning needs):</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {generatedResult.validationSummary.adaptationExplanation}
                </p>
              </div>
            </div>

            {/* Distribution Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Weak Topics Distribution */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Weak-Topic Distribution
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    {generatedResult.validationSummary.identifiedWeakTopics?.length || 0} Weak Topics
                  </span>
                </div>

                <div className="space-y-2">
                  {generatedResult.validationSummary.identifiedWeakTopics && generatedResult.validationSummary.identifiedWeakTopics.length > 0 ? (
                    generatedResult.validationSummary.identifiedWeakTopics.map((wt: any) => {
                      const count = generatedResult.selectedQuestions.filter(q => q.topic === wt.topic).length;
                      const total = generatedResult.validationSummary.totalQuestions;
                      const pct = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
                      const masteryDisplay = wt.pMastery !== null && wt.pMastery !== undefined ? `${wt.pMastery}%` : 'N/A';

                      return (
                        <div key={wt.topic} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white truncate max-w-[170px]">
                              {wt.topic}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Mastery: {masteryDisplay}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Selected Questions:</span>
                            <span className="font-mono font-bold text-indigo-400">
                              {count} of {total} ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-[11px] text-slate-400 italic p-3 text-center">
                      No weak topics under 65% threshold. General syllabus breadth tested.
                    </div>
                  )}
                </div>
              </div>

              {/* Bloom's Taxonomy Distribution (6 Levels) */}
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Bloom's Taxonomy Distribution (6 Levels)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">
                    Total: {generatedResult.validationSummary.totalQuestions} Questions
                  </span>
                </div>

                <div className="space-y-1.5">
                  {(['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'] as const).map(lvl => {
                    const count = generatedResult.selectedQuestions.filter(q => q.bloomsLevel === lvl).length;
                    const total = generatedResult.validationSummary.totalQuestions;
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

            {/* Questions Preview */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Selected Questions & Adaptive Rationale ({generatedResult.selectedQuestions.length} Items):
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {generatedResult.selectedQuestions.map((q, idx) => (
                  <div key={`${q.id}-${idx}`} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400">Q{idx + 1}</span>
                        <span className="text-white font-medium">{q.topic}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {q.bloomsLevel}
                        </span>
                      </div>
                      <span className="text-amber-400 font-bold">{q.marks} Marks</span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-2">{q.questionText}</p>
                    {generatedResult.validationSummary.selectionExplanations[q.id] && (
                      <p className="text-[10px] text-indigo-300/90 italic">
                        <strong>Why chosen:</strong> {generatedResult.validationSummary.selectionExplanations[q.id]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setGeneratedResult(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                Reconfigure Parameters
              </button>
              <button
                onClick={() => onStartExam(generatedResult.exam.id!)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white hover:opacity-95 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="h-4 w-4" />
                <span>Begin Assessment ({generatedResult.selectedQuestions.length} Questions)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
