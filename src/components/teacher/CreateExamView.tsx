/**
 * Manual Exam Creator & Scheduler
 */

import React, { useState } from 'react';
import { User, Exam, Question } from '../../types';
import { storageService } from '../../services/storageService';
import {
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface CreateExamViewProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const CreateExamView: React.FC<CreateExamViewProps> = ({ user, onNavigate }) => {
  const allQuestions = storageService.getQuestions();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [formError, setFormError] = useState('');

  const topics = ['All', ...Array.from(new Set(allQuestions.map(q => q.topic)))];

  const filteredQuestions = allQuestions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = filterTopic === 'All' || q.topic === filterTopic;
    const matchesSub = q.subject === subject;
    return matchesSearch && matchesTopic && matchesSub;
  });

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleAutoSelect30 = () => {
    const pool = filteredQuestions.length >= 30 ? filteredQuestions : allQuestions;
    const selected30 = pool.slice(0, 30).map(q => q.id);
    setSelectedQuestionIds(selected30);
  };

  const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.includes(q.id));
  const totalMarks = selectedQuestions.reduce((acc, q) => acc + q.marks, 0);

  const handlePublishExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedQuestionIds.length === 0) {
      setFormError('Please enter an exam title and select at least one question.');
      return;
    }
    setFormError('');

    const examTopics = Array.from(new Set(selectedQuestions.map(q => q.topic)));

    const newExam: Exam = {
      id: `exam_${Date.now()}`,
      title,
      description: description || `Standard academic assessment covering ${examTopics.join(', ')}.`,
      subject,
      topics: examTopics,
      examType: 'teacher_formal',
      questionIds: selectedQuestionIds,
      totalMarks,
      passPercentage: 60,
      durationMinutes,
      status: 'published',
      bloomsDistribution: { Remember: 25, Understand: 25, Apply: 30, Analyze: 20, Evaluate: 0, Create: 0 },
      difficultyRating: 0.5,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };

    storageService.addExam(newExam);
    storageService.addAuditLog(
      user.id,
      user.role,
      'EXAM_CREATED',
      `Published exam "${title}" with ${selectedQuestionIds.length} questions.`,
      newExam.id
    );

    // Successfully published, route to dashboard
    onNavigate('teacher_dashboard');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-indigo-400" />
            <span>Create & Schedule Standard Exam</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Handpick questions from the calibrated bank or configure assessment properties.
          </p>
        </div>
        <button
          onClick={() => onNavigate('ai_exam_generator')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:opacity-95"
        >
          <Sparkles className="h-4 w-4" />
          <span>Switch to Adaptive Exam Generator</span>
        </button>
      </div>

      <form onSubmit={handlePublishExam} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Exam Configuration Parameters */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white">Assessment Parameters</h3>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Exam Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Midterm Evaluation: Algorithms & Data Structures"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs sm:text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subject
              </label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="AI & Data Science">AI & Data Science</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Instructions / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional instructions for students..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Real-time Summary Box */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Questions:</span>
                <span className="font-bold text-white">{selectedQuestionIds.length} Items</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Marks:</span>
                <span className="font-bold text-amber-400">{totalMarks} Marks</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Time / Item:</span>
                <span className="font-bold text-slate-200">
                  {selectedQuestionIds.length > 0 ? (durationMinutes / selectedQuestionIds.length).toFixed(1) : 0} mins
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedQuestionIds.length === 0}
              className="w-full py-3 rounded-xl bg-indigo-600 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-600/30"
            >
              Publish Exam to Cohort
            </button>
          </div>
        </div>

        {/* Right 2 Cols: Question Picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-white">
                  Select Questions ({selectedQuestionIds.length}/30 Selected)
                </h3>
                <button
                  type="button"
                  onClick={handleAutoSelect30}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold hover:bg-indigo-600/50 transition cursor-pointer"
                >
                  Auto-Select 30 Questions
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterTopic}
                  onChange={e => setFilterTopic(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-white"
                >
                  {topics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Questions Selection List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredQuestions.map((q, idx) => {
                const isSelected = selectedQuestionIds.includes(q.id);

                return (
                  <div
                    key={`${q.id}-${idx}`}
                    onClick={() => toggleQuestion(q.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/20'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center text-[10px] ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && '✓'}
                        </div>
                        <span className="text-xs font-bold text-slate-300">{q.topic}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Bloom: {q.bloomsLevel}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-400">+{q.marks} Marks</span>
                    </div>

                    <p className="text-xs text-slate-200 line-clamp-2">{q.questionText}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
