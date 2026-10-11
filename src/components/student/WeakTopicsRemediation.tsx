/**
 * Targeted Weak Topics Remediation & Concept Recovery Hub
 */

import React, { useState, useEffect } from 'react';
import { User, Question, LearningResource, RemediationPlan } from '../../types';
import { storageService } from '../../services/storageService';
import { RecommendationService } from '../../services/recommendationService';
import { BKTEngine } from '../../ai/bktEngine';
import { MisconceptionClassifier } from '../../ai/misconceptionClassifier';
import { MISCONCEPTIONS_BY_CONCEPT } from '../../data/misconceptionTaxonomy';
import { RewardService } from '../../services/rewardService';
import { AdaptiveExamGenerator } from '../../ai/adaptiveExamGenerator';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Search,
  RotateCcw,
  Video,
  X,
  Target,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';

interface WeakTopicsRemediationProps {
  user: User;
  onNavigate: (view: string) => void;
  onStartExam?: (examId: string) => void;
}

export const WeakTopicsRemediation: React.FC<WeakTopicsRemediationProps> = ({
  user,
  onNavigate,
  onStartExam,
}) => {
  const studentId = user.studentId || '101';
  
  // All plans state
  const [allPlans, setAllPlans] = useState<RemediationPlan[]>(() => {
    const raw = RecommendationService.getAllRemediationPlans(studentId);
    // Deduplicate by conceptName to provide a clean list
    const seen = new Set<string>();
    return raw.filter(p => {
      if (seen.has(p.conceptName)) return false;
      seen.add(p.conceptName);
      return true;
    });
  });

  const urgentCount = allPlans.filter(p => (p.pMastery ?? 0) < 0.65).length;
  const developingCount = allPlans.filter(p => (p.pMastery ?? 0) >= 0.65 && (p.pMastery ?? 0) < 0.85).length;

  const [activeTab, setActiveTab] = useState<'urgent' | 'developing' | 'all'>(() => {
    const weak = RecommendationService.getStudentRemediationNeeds(studentId);
    return weak.some(p => (p.pMastery ?? 0) < 0.65) ? 'urgent' : 'all';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConceptId, setSelectedConceptId] = useState<string>(() => {
    const weak = RecommendationService.getStudentRemediationNeeds(studentId);
    return weak[0]?.conceptId || allPlans[0]?.conceptId || 'C6_Dynamic_Programming';
  });

  // Active plan for selected concept
  const activePlan = RecommendationService.getRemediationPlan(studentId, selectedConceptId);

  // Micro-review interactive state
  const [microAnswers, setMicroAnswers] = useState<Record<string, string>>({});
  const [evaluatedResults, setEvaluatedResults] = useState<Record<string, { isCorrect: boolean; feedback: string }> | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [stepChecklist, setStepChecklist] = useState<Record<string, boolean>>({});

  // Active modal video for instant watching
  const [activeModalVideo, setActiveModalVideo] = useState<LearningResource | null>(null);

  const CURATED_THUMBNAILS: Record<string, string> = {
    res_quad_01: 'https://img.youtube.com/vi/IHZwWFHWa-w/hqdefault.jpg',
    res_quad_02: 'https://img.youtube.com/vi/6DYDCl-8vs0/hqdefault.jpg',
    res_bst_01: 'https://img.youtube.com/vi/gcULXE7ViZw/hqdefault.jpg',
    res_graph_01: 'https://img.youtube.com/vi/oDqjPvD54Ss/hqdefault.jpg',
    res_dp_01: 'https://img.youtube.com/vi/oBt53YbR9Kk/hqdefault.jpg',
    res_la_01: 'https://img.youtube.com/vi/Ip3X9LOh2dk/hqdefault.jpg',
    res_calc_01: 'https://img.youtube.com/vi/YG15m2VwSjA/hqdefault.jpg',
    res_ood_01: 'https://img.youtube.com/vi/pTB0EiLXUC8/hqdefault.jpg',
    res_rec_01: 'https://img.youtube.com/vi/mBNrRy2_hVs/hqdefault.jpg',
    res_ml_01: 'https://img.youtube.com/vi/Gv9_4yMHFhI/hqdefault.jpg',
    res_hash_01: 'https://img.youtube.com/vi/shs0KM3wKv8/hqdefault.jpg',
    res_nn_01: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
    res_metrics_01: 'https://img.youtube.com/vi/4jRBRDbJemM/hqdefault.jpg',
    res_sort_01: 'https://img.youtube.com/vi/SLauY6PpjW4/hqdefault.jpg',
  };

  const getEffectiveVideoId = (video: LearningResource): string => {
    if (video.id === 'res_quad_02' && (!video.youtubeVideoId || video.youtubeVideoId === '7K1sB05pE0A')) {
      return '6DYDCl-8vs0';
    }
    return video.youtubeVideoId || '6DYDCl-8vs0';
  };

  const getVideoThumbnail = (video: LearningResource): string => {
    if (video.id === 'res_quad_02') {
      return 'https://img.youtube.com/vi/6DYDCl-8vs0/hqdefault.jpg';
    }
    if (CURATED_THUMBNAILS[video.id]) return CURATED_THUMBNAILS[video.id];
    if (video.thumbnailUrl) return video.thumbnailUrl;
    const yId = getEffectiveVideoId(video);
    if (yId && yId !== '7K1sB05pE0A') {
      return `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80';
  };

  // Reset micro review answers when user selects a different topic
  useEffect(() => {
    setMicroAnswers({});
    setEvaluatedResults(null);
    setIsCompleted(false);
  }, [selectedConceptId]);

  // Refresh plans when mastery changes
  const refreshPlans = () => {
    const updated = RecommendationService.getAllRemediationPlans(studentId);
    const seen = new Set<string>();
    const deduped = updated.filter(p => {
      if (seen.has(p.conceptName)) return false;
      seen.add(p.conceptName);
      return true;
    });
    setAllPlans(deduped);
  };

  const handleSelectAnswer = (qId: string, optId: string) => {
    if (isCompleted) return;
    setMicroAnswers(prev => ({ ...prev, [qId]: optId }));
  };

  const handleTextAnswer = (qId: string, text: string) => {
    if (isCompleted) return;
    setMicroAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const toggleStep = (stepIdx: number) => {
    const key = `${selectedConceptId}_step_${stepIdx}`;
    setStepChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetMicroReview = () => {
    setMicroAnswers({});
    setEvaluatedResults(null);
    setIsCompleted(false);
  };

  const handleSubmitMicroReview = () => {
    const results: Record<string, { isCorrect: boolean; feedback: string }> = {};
    let correctCount = 0;

    activePlan.microReviewQuestions.forEach(q => {
      const given = microAnswers[q.id] || '';
      let isCorrect = false;

      if (q.options && q.options.length > 0) {
        const selectedOpt = q.options.find(o => o.id === given);
        isCorrect = selectedOpt
          ? !!selectedOpt.isCorrect || String(selectedOpt.id).toLowerCase() === String(q.correctAnswer).toLowerCase()
          : String(given).toLowerCase() === String(q.correctAnswer).toLowerCase();
      } else {
        // Descriptive / short answer: substantive response counts as completed review
        isCorrect = String(given).trim().length >= 8;
      }

      if (isCorrect) correctCount += 1;

      // Update student BKT mastery
      const current = storageService.getMasteryRecords(studentId)[q.conceptId];
      const updated = BKTEngine.processResponse(
        current,
        studentId,
        q.conceptId,
        q.topic,
        q.subject,
        isCorrect,
        isCorrect ? 'none' : 'conceptual_misunderstanding'
      );
      storageService.updateStudentMastery(updated);

      results[q.id] = {
        isCorrect,
        feedback: isCorrect
          ? 'Correct! ' + (q.explanation || 'Demonstrated solid grasp of key invariants.')
          : (q.options && q.options.length > 0
              ? MisconceptionClassifier.diagnose(q, given).problemSummary + '. ' + (q.explanation || '')
              : 'Review key definition: ' + (q.explanation || 'Remember to check termination conditions and invariants.')),
      };
    });

    setEvaluatedResults(results);
    setIsCompleted(true);
    refreshPlans();

    // Award remediation credits
    RewardService.awardCredits(studentId, 25, `Remediation Micro-Review in ${activePlan.conceptName}`);

    if (correctCount > 0) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Launch targeted 30-question diagnostic exam on this topic
  const handleLaunchTopicExam = () => {
    const allQuestions = storageService.getQuestions();
    const generated = AdaptiveExamGenerator.generateExam(allQuestions, {
      title: `${activePlan.conceptName}: 30-Question Mastery Evaluation`,
      subject: activePlan.subject || 'All',
      selectedTopics: [activePlan.conceptName],
      totalQuestions: 30,
      durationMinutes: 45,
      targetStudentId: studentId,
      targetStudentName: user.displayName,
      targetDifficulty: 'Remediation',
    });

    if (generated.exam.id) {
      storageService.addExam(generated.exam as any);
      if (onStartExam) {
        onStartExam(generated.exam.id);
      } else {
        onNavigate('my_exams');
      }
    }
  };

  // Filter plans based on tab & search
  const filteredPlans = allPlans.filter(p => {
    const matchesSearch =
      p.conceptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.conceptId.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'urgent') return (p.pMastery ?? 0) < 0.65;
    if (activeTab === 'developing') return (p.pMastery ?? 0) >= 0.65 && (p.pMastery ?? 0) < 0.85;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <span>Targeted Weak Topics & Remediation Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Personalized recovery roadmaps, cognitive misconception diagnoses, video tutorials, and interactive 2-question micro-reviews.
          </p>
        </div>
        <button
          onClick={handleLaunchTopicExam}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:opacity-95 transition"
        >
          <Target className="h-4 w-4" />
          <span>Launch 30-Question Assessment on {activePlan.conceptName.split(' ')[0]}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topic Browser */}
        <div className="space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('urgent')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'urgent'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Needs Attention ({urgentCount})
            </button>
            <button
              onClick={() => setActiveTab('developing')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'developing'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              In Progress ({developingCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({allPlans.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter topics..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* List of Concepts */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredPlans.map(plan => {
              const isSel = plan.conceptId === selectedConceptId;
              const color = BKTEngine.getStatusColor(plan.status);

              return (
                <button
                  key={plan.conceptId}
                  onClick={() => {
                    setSelectedConceptId(plan.conceptId);
                    setMicroAnswers({});
                    setEvaluatedResults(null);
                    setIsCompleted(false);
                  }}
                  className={`w-full text-left rounded-2xl p-4 border transition space-y-2.5 cursor-pointer ${
                    isSel
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white leading-snug truncate pr-2">
                      {plan.conceptName}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${color.bg} ${color.text} ${color.border}`}>
                      {Math.round(plan.pMastery * 100)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        plan.pMastery >= 0.75
                          ? 'bg-emerald-500'
                          : plan.pMastery >= 0.6
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.round(plan.pMastery * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate">
                      Deficit: {MisconceptionClassifier.getErrorTypeLabel(plan.primaryMisconception)}
                    </span>
                    <span className="font-semibold text-indigo-400">Review →</span>
                  </div>
                </button>
              );
            })}

            {filteredPlans.length === 0 && (
              <div className="p-6 text-center text-slate-400 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                No concepts found matching your filter.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Active Plan Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {/* Concept Overview & Diagnostic Feedback */}
          <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Topic Diagnosis & Recovery
                </span>
                <h3 className="text-xl font-bold text-white mt-1.5">{activePlan.conceptName}</h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-amber-400 leading-none">
                  {Math.round(activePlan.pMastery * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Current BKT Posterior</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {activePlan.feedback}
            </p>

            {/* Interactive 5-Step Learning Roadmap */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Personalized 5-Step Remediation Sequence:</span>
                <span className="text-[11px] text-indigo-400 font-normal">Check off as you complete</span>
              </h4>
              <div className="space-y-2">
                {activePlan.recommendedLearningOrder.map((step, idx) => {
                  const key = `${selectedConceptId}_step_${idx}`;
                  const isChecked = !!stepChecklist[key];

                  return (
                    <button
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left text-xs transition cursor-pointer ${
                        isChecked
                          ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                          : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-500 shrink-0" />
                      )}
                      <span className={isChecked ? 'line-through opacity-80' : ''}>{step}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Curated Video Lesson Section */}
          {activePlan.youtubeRecommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Play className="h-4 w-4 text-rose-500 fill-rose-500" />
                  <span>Curated High-Yield Video Lesson</span>
                </div>
                <button
                  onClick={() => onNavigate('video_recommendations')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  Browse Full Video Library →
                </button>
              </div>

              {activePlan.youtubeRecommendations.slice(0, 1).map(yt => (
                <div
                  key={yt.id}
                  className="flex flex-col sm:flex-row items-start gap-4 rounded-xl bg-slate-950 p-4 border border-slate-800"
                >
                  <div
                    onClick={() => setActiveModalVideo(yt)}
                    className="w-full sm:w-44 h-28 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center relative cursor-pointer group"
                  >
                    <img
                      src={getVideoThumbnail(yt)}
                      alt={yt.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const yId = getEffectiveVideoId(yt);
                        if (yId && !target.src.includes('mqdefault.jpg') && target.src.includes('hqdefault.jpg')) {
                          target.src = `https://img.youtube.com/vi/${yId}/mqdefault.jpg`;
                        } else {
                          target.onerror = null;
                          target.src = CURATED_THUMBNAILS[yt.id] || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80';
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg">
                        <Play className="h-5 w-5 fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-mono text-white">
                      {yt.durationMinutes}m
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20">
                        {yt.channelName}
                      </span>
                      <span className="text-[10px] text-slate-400">{yt.durationMinutes} mins</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{yt.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{yt.description}</p>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => yt.youtubeVideoId && setActiveModalVideo(yt)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                      >
                        <Play className="h-3 w-3 fill-rose-400" />
                        <span>Watch in App</span>
                      </button>
                      <a
                        href={yt.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Open on YouTube</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Structured Misconception Taxonomy Breakdown */}
          {(() => {
            const conceptMisconceptions = MISCONCEPTIONS_BY_CONCEPT[selectedConceptId] || [];
            if (conceptMisconceptions.length === 0) return null;

            return (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">
                      Common Misconceptions in {activePlan.conceptName} ({conceptMisconceptions.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigate('misconception_taxonomy')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>Browse All Taxonomy</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {conceptMisconceptions.slice(0, 2).map(m => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">{m.name}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {m.id}
                        </span>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {m.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 text-rose-300 space-y-1">
                          <span className="font-bold block text-[10px] uppercase text-rose-400 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Common Error:
                          </span>
                          <span className="text-rose-200">"{m.representativeIncorrectAnswer}"</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 space-y-1">
                          <span className="font-bold block text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Correct Reasoning:
                          </span>
                          <span className="text-emerald-200">{m.correctExplanation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 2-Question Low-Stakes Micro-Review */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Low-Stakes Micro-Review Practice</h3>
                <p className="text-xs text-slate-400">Answer 2 targeted questions to immediately recalculate your mastery probability.</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                +25 Credits
              </span>
            </div>

            <div className="space-y-4">
              {activePlan.microReviewQuestions.map((q, idx) => {
                const evalInfo = evaluatedResults ? evaluatedResults[q.id] : null;

                return (
                  <div
                    key={`${q.id}-${idx}`}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-400">Practice Question {idx + 1} of 2</span>
                      <span className="text-[10px] text-slate-400">Bloom: {q.bloomsLevel}</span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                      {q.questionText}
                    </p>

                    {/* Options: Multiple choice buttons OR Descriptive Textarea */}
                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSel = microAnswers[q.id] === opt.id;
                          const isOptionCorrect =
                            opt.isCorrect ||
                            String(opt.id).toLowerCase() === String(q.correctAnswer).toLowerCase();

                          let optClass = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80';
                          if (isSel) optClass = 'bg-indigo-600/30 border-indigo-500 text-white font-semibold';
                          if (evalInfo) {
                            if (isOptionCorrect) {
                              optClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isSel && !evalInfo.isCorrect) {
                              optClass = 'bg-rose-500/20 border-rose-500 text-rose-300';
                            }
                          }

                          const letter = String.fromCharCode(65 + optIdx);

                          return (
                            <button
                              key={opt.id}
                              disabled={isCompleted}
                              onClick={() => handleSelectAnswer(q.id, opt.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition cursor-pointer ${optClass}`}
                            >
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-700 text-[11px] font-bold">
                                {letter}
                              </span>
                              <span className="flex-1">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <textarea
                          disabled={isCompleted}
                          value={microAnswers[q.id] || ''}
                          onChange={e => handleTextAnswer(q.id, e.target.value)}
                          placeholder="Type your explanation or worked reasoning here..."
                          rows={3}
                          className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none leading-relaxed"
                        />
                        {!isCompleted && (
                          <p className="text-[10px] text-slate-400">
                            Enter your conceptual explanation above to evaluate against the core rubric.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Feedback box on submission */}
                    {evalInfo && (
                      <div
                        className={`rounded-lg p-3 text-xs border ${
                          evalInfo.isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <strong>{evalInfo.isCorrect ? '✓ Well Done: ' : '✗ Diagnostic Tip: '}</strong>
                        <span>{evalInfo.feedback}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!isCompleted ? (
              <button
                onClick={handleSubmitMicroReview}
                disabled={
                  activePlan.microReviewQuestions.length === 0 ||
                  !activePlan.microReviewQuestions.every(q => {
                    const ans = microAnswers[q.id];
                    return ans !== undefined && String(ans).trim().length > 0;
                  })
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Answers & Recalculate Mastery (+25 Credits)</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center justify-center gap-1.5">
                    <Award className="h-4 w-4 text-amber-400" />
                    <span>Micro-Review Complete! +25 Credits Added to Balance</span>
                  </div>
                  <p className="text-slate-300">
                    Bayesian Knowledge Tracing has updated your posterior probability for {activePlan.conceptName} to {Math.round(activePlan.pMastery * 100)}%.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    onClick={handleResetMicroReview}
                    className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Try Another Practice</span>
                  </button>
                  <button
                    onClick={handleLaunchTopicExam}
                    className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>Take 30-Question Assessment</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">{activeModalVideo.title}</h3>
                <p className="text-xs text-slate-400">{activeModalVideo.channelName} · {activeModalVideo.conceptName}</p>
              </div>
              <button
                onClick={() => setActiveModalVideo(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${getEffectiveVideoId(activeModalVideo)}?autoplay=1`}
                title={activeModalVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>Duration: ~{activeModalVideo.durationMinutes} mins</span>
              <a
                href={activeModalVideo.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <span>Watch directly on YouTube</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
