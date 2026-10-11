/**
 * Question Bank Manager (Search, Filter, Create, Edit, Export)
 */

import React, { useState } from 'react';
import { User, Question, BloomsLevel, QuestionType } from '../../types';
import { storageService } from '../../services/storageService';
import { ReportService } from '../../services/reportService';
import { AIQuestionGenerator } from '../../ai/aiQuestionGenerator';
import {
  Database,
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  X,
  Eye,
  AlertCircle,
} from 'lucide-react';

interface QuestionBankManagerProps {
  user: User;
  onNavigate: (view: string) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ user, onNavigate }) => {
  const [questions, setQuestions] = useState(storageService.getQuestions());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterBloom, setFilterBloom] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  // New Question Form State
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newTopic, setNewTopic] = useState('Binary Search Trees');
  const [newBloom, setNewBloom] = useState<BloomsLevel>('Understand');
  const [newType, setNewType] = useState<QuestionType>('mcq');
  const [newDifficulty, setNewDifficulty] = useState<number>(0.5);
  const [newMarks, setNewMarks] = useState<number>(5);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('opt_1');
  const [newExplanation, setNewExplanation] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const subjects = ['All', 'Computer Science', 'Mathematics', 'AI & Data Science'];
  const bloomLevels = ['All', 'Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'All' || q.subject === filterSubject;
    const matchesBloom = filterBloom === 'All' || q.bloomsLevel === filterBloom;
    return matchesSearch && matchesSubject && matchesBloom;
  });

  const handleExportCSV = () => {
    const csv = ReportService.generateQuestionBankCSV();
    ReportService.downloadCSV('AAK_Exam_Question_Bank.csv', csv);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      storageService.deleteQuestion(id);
      setQuestions(storageService.getQuestions());
    }
  };

  const handleAiAutoFill = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const generatedList = AIQuestionGenerator.generateQuestions({
        subject: newSubject,
        topic: newTopic,
        difficulty: newDifficulty <= 0.35 ? 'Easy' : newDifficulty <= 0.65 ? 'Medium' : 'Hard',
        bloomsLevel: newBloom,
        questionType: newType,
        count: 1,
      });

      const generated = generatedList[0];
      if (generated) {
        setNewQuestionText(generated.questionText);
        if (generated.options && generated.options.length >= 4) {
          setNewOptionA(generated.options[0].text);
          setNewOptionB(generated.options[1].text);
          setNewOptionC(generated.options[2].text);
          setNewOptionD(generated.options[3].text);
        }
        setNewCorrectAnswer(String(generated.correctAnswer));
        setNewExplanation(generated.explanation);
      }
      setIsAiGenerating(false);
    }, 400);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: Question = {
      id: `q_custom_${Date.now()}`,
      subject: newSubject,
      topic: newTopic,
      subtopic: newTopic,
      conceptId: `C_${newTopic.replace(/\s+/g, '_')}`,
      bloomsLevel: newBloom,
      difficultyScore: newDifficulty,
      marks: newMarks,
      questionType: newType,
      questionText: newQuestionText,
      options:
        newType === 'mcq'
          ? [
              { id: 'opt_1', text: newOptionA || 'Option A', isCorrect: newCorrectAnswer === 'opt_1' || newCorrectAnswer === 'a' },
              { id: 'opt_2', text: newOptionB || 'Option B', isCorrect: newCorrectAnswer === 'opt_2' || newCorrectAnswer === 'b' },
              { id: 'opt_3', text: newOptionC || 'Option C', isCorrect: newCorrectAnswer === 'opt_3' || newCorrectAnswer === 'c' },
              { id: 'opt_4', text: newOptionD || 'Option D', isCorrect: newCorrectAnswer === 'opt_4' || newCorrectAnswer === 'd' },
            ]
          : undefined,
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation || 'Comprehensive standard solution and analytical derivation.',
      prerequisites: [newTopic],
      tags: [newTopic, newSubject],
      estimatedMinutes: 3,
      source: 'teacher',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    storageService.addQuestion(newQ);
    setQuestions(storageService.getQuestions());
    setShowCreateModal(false);
    // Reset form
    setNewQuestionText('');
    setNewExplanation('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="h-6 w-6 text-indigo-400" />
            <span>Question Bank Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {questions.length} Bloom's taxonomy calibrated questions with distractor misconception maps and rubric criteria.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Author New Question</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setFilterSubject(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterSubject === s
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}

          <span className="text-slate-600">|</span>

          <select
            value={filterBloom}
            onChange={e => setFilterBloom(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            {bloomLevels.map(b => (
              <option key={b} value={b}>Bloom: {b}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search question text or topic..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => (
          <div
            key={`${q.id}-${idx}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 hover:border-slate-700 transition space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 font-mono">#{q.id}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {q.subject}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {q.topic}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  Bloom: {q.bloomsLevel}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                  Diff: {q.difficultyScore}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  +{q.marks} Marks
                </span>
                <button
                  onClick={() => setPreviewQuestion(q)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  title="Preview Question"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                  title="Delete Question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed font-mono">
              {q.questionText}
            </p>

            {q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                {q.options.map(opt => (
                  <div
                    key={opt.id}
                    className={`p-2 rounded-lg border flex items-center gap-2 ${
                      opt.id === q.correctAnswer
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800">
                      {opt.id}
                    </span>
                    <span className="truncate">{opt.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No questions matched your search criteria.
          </div>
        )}
      </div>

      {/* Author New Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Author Question (Bloom Calibrated)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Bloom Level</label>
                  <select
                    value={newBloom}
                    onChange={e => setNewBloom(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  >
                    {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newMarks}
                    onChange={e => setNewMarks(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  />
                </div>
              </div>

              {/* Auto-Generate Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isAiGenerating}
                  onClick={handleAiAutoFill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isAiGenerating ? 'Synthesizing...' : 'Auto-Fill Calibrated Content'}</span>
                </button>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Question Prompt / Scenario</label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  placeholder="Enter problem statement, code snippet, or theoretical question..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-white font-mono"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Option A</label>
                  <input
                    type="text"
                    value={newOptionA}
                    onChange={e => setNewOptionA(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Option B</label>
                  <input
                    type="text"
                    value={newOptionB}
                    onChange={e => setNewOptionB(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Option C</label>
                  <input
                    type="text"
                    value={newOptionC}
                    onChange={e => setNewOptionC(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Option D</label>
                  <input
                    type="text"
                    value={newOptionD}
                    onChange={e => setNewOptionD(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Correct Option Key</label>
                  <select
                    value={newCorrectAnswer}
                    onChange={e => setNewCorrectAnswer(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  >
                    <option value="a">Option A</option>
                    <option value="b">Option B</option>
                    <option value="c">Option C</option>
                    <option value="d">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Difficulty (0.1 - 1.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    max={1.0}
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Analytical Solution & Explanation</label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={e => setNewExplanation(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-600/30"
                >
                  Save to Question Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Question Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-indigo-400">Preview Question #{previewQuestion.id}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{previewQuestion.topic}</span>
              </div>
              <button onClick={() => setPreviewQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-white leading-relaxed">
              {previewQuestion.questionText}
            </p>

            {previewQuestion.options && (
              <div className="space-y-2 text-xs">
                {previewQuestion.options.map(opt => (
                  <div
                    key={opt.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between ${
                      opt.id === previewQuestion.correctAnswer
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{opt.id.toUpperCase()}. {opt.text}</span>
                    {opt.id === previewQuestion.correctAnswer && <span className="text-[10px] text-emerald-400">Correct Key</span>}
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <strong className="text-slate-200">Explanation: </strong>
              {previewQuestion.explanation}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
