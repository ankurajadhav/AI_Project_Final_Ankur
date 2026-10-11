/**
 * Self-Serve Practice Hub
 */

import React, { useState } from 'react';
import { User, Question } from '../../types';
import { storageService } from '../../services/storageService';
import {
  Dumbbell,
  Play,
  Filter,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  Award,
} from 'lucide-react';

interface PracticeHubProps {
  user: User;
  onStartExam: (examId: string) => void;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({ user, onStartExam }) => {
  const questions = storageService.getQuestions();
  const topics = Array.from(new Set(questions.map(q => q.topic)));
  const subjects = Array.from(new Set(questions.map(q => q.subject)));

  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0] || 'Computer Science');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePractice = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let pool = questions.filter(q => q.subject === selectedSubject);
      if (selectedTopic !== 'All') {
        pool = pool.filter(q => q.topic === selectedTopic);
      }

      if (difficultyLevel === 'easy') {
        pool = pool.filter(q => q.difficultyScore <= 0.4);
      } else if (difficultyLevel === 'medium') {
        pool = pool.filter(q => q.difficultyScore > 0.4 && q.difficultyScore <= 0.7);
      } else if (difficultyLevel === 'hard') {
        pool = pool.filter(q => q.difficultyScore > 0.7);
      }

      if (pool.length === 0) {
        pool = questions.slice(0, questionCount);
      }

      // Shuffle & slice
      const chosen = pool.sort(() => 0.5 - Math.random()).slice(0, questionCount);

      const totalMarks = chosen.reduce((acc, q) => acc + q.marks, 0);
      const practiceExamId = `practice_${Date.now()}`;
      storageService.addExam({
        id: practiceExamId,
        title: `Self-Serve Practice: ${selectedTopic === 'All' ? selectedSubject : selectedTopic}`,
        description: `Custom ${questionCount}-question practice session calibrated for ${difficultyLevel} difficulty.`,
        subject: selectedSubject,
        topics: selectedTopic === 'All' ? topics : [selectedTopic],
        examType: 'practice_test',
        questionIds: chosen.map(q => q.id),
        totalMarks,
        passPercentage: 60,
        durationMinutes: questionCount * 3,
        status: 'published',
        bloomsDistribution: { Remember: 25, Understand: 25, Apply: 30, Analyze: 20, Evaluate: 0, Create: 0 },
        difficultyRating: 0.5,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      });

      setIsGenerating(false);
      onStartExam(practiceExamId);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-indigo-400" />
          <span>Interactive Practice Hub</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Build on-demand micro-practice tests tailored to your chosen subject, topic, and difficulty preference.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Subject Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Academic Subject
            </label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Topic Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Topic Filter
            </label>
            <select
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Topics ({selectedSubject})</option>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Question Count Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span className="uppercase tracking-wider">Number of Questions</span>
              <span className="text-indigo-400">{questionCount} Questions</span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>3 Quick Items</span>
              <span>8 Standard</span>
              <span>15 Deep Drill</span>
            </div>
          </div>

          {/* Difficulty Target */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Difficulty Calibration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['easy', 'medium', 'hard', 'mixed'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficultyLevel(diff)}
                  className={`py-2 rounded-xl text-xs font-bold capitalize transition border ${
                    difficultyLevel === diff
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Estimated Duration: ~{questionCount * 3} Minutes · BKT Mastery will update on submission</span>
          </div>
          <span className="text-amber-400 font-semibold">+20 Credits on completion</span>
        </div>

        <button
          disabled={isGenerating}
          onClick={handleGeneratePractice}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
        >
          <Play className="h-4 w-4" />
          <span>{isGenerating ? 'Synthesizing Questions...' : 'Start Practice Session Now'}</span>
        </button>
      </div>
    </div>
  );
};
