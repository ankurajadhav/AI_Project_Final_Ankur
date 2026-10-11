/**
 * Misconception Taxonomy Reference & Diagnostic Explorer
 * 
 * Formal cognitive error catalog mapping recurring student fallacies,
 * sign inversions, and boundary mistakes to academic concepts,
 * incorrect reasoning examples, correct understandings, and corrective feedback.
 */

import React, { useState } from 'react';
import { User, MisconceptionItem } from '../../types';
import { MISCONCEPTION_TAXONOMY, MISCONCEPTIONS_BY_SUBJECT } from '../../data/misconceptionTaxonomy';
import { storageService } from '../../services/storageService';
import {
  BookOpen,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MisconceptionTaxonomyViewProps {
  user: User;
  onNavigate?: (view: string) => void;
  onStartExam?: (examId: string) => void;
}

export const MisconceptionTaxonomyView: React.FC<MisconceptionTaxonomyViewProps> = ({
  user,
  onNavigate,
  onStartExam,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedConcept, setSelectedConcept] = useState<string>('All');

  const questions = storageService.getQuestions();

  // Subjects list
  const subjects = ['All', 'Mathematics', 'Computer Science', 'AI & Data Science'];

  // Filter taxonomy entries
  const filteredTaxonomy = MISCONCEPTION_TAXONOMY.filter(item => {
    if (selectedSubject !== 'All' && item.subject !== selectedSubject) {
      return false;
    }
    if (selectedConcept !== 'All' && item.conceptId !== selectedConcept) {
      return false;
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchConcept = item.conceptName.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchIncorrect = item.representativeIncorrectAnswer.toLowerCase().includes(q);
      const matchCorrect = item.correctExplanation.toLowerCase().includes(q);
      return matchId || matchName || matchConcept || matchDesc || matchIncorrect || matchCorrect;
    }
    return true;
  });

  // Unique concepts for the active subject
  const availableConcepts = Array.from(
    new Set(
      MISCONCEPTION_TAXONOMY
        .filter(m => selectedSubject === 'All' || m.subject === selectedSubject)
        .map(m => JSON.stringify({ id: m.conceptId, name: m.conceptName }))
    )
  ).map(str => JSON.parse(str) as { id: string; name: string });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            <span>Structured Misconception Taxonomy</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Catalog of frequent cognitive fallacies, sign inversions, and boundary mistakes with contrasting examples, correct mathematical explanations, and corrective recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {filteredTaxonomy.length} / {MISCONCEPTION_TAXONOMY.length} Misconceptions Cataloged
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by fallacy name, formula, concept, or reasoning pattern..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setSelectedConcept('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Concept Dropdown */}
          <div className="w-full md:w-64">
            <select
              value={selectedConcept}
              onChange={e => setSelectedConcept(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Concepts ({availableConcepts.length})</option>
              {availableConcepts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Taxonomy Entries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTaxonomy.map(item => {
          const mappedQuestions = (item.relatedQuestionIds || [])
            .map(qid => questions.find(q => q.id === qid))
            .filter(Boolean);

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.id}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {item.subject}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {item.conceptName}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white pt-1">{item.name}</h3>
                  </div>
                </div>

                {/* Explanation of Misconception */}
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                  <strong className="text-amber-400 block mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Fallacy Mechanism:</span>
                  </strong>
                  <span>{item.description}</span>
                </div>

                {/* Incorrect vs Correct Reasoning Comparison */}
                <div className="space-y-2">
                  {/* Incorrect pattern */}
                  <div className="rounded-xl bg-rose-950/20 border border-rose-500/30 p-3 text-xs space-y-1">
                    <div className="font-bold text-rose-400 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Example of Incorrect Answer / Reasoning:</span>
                    </div>
                    <p className="text-rose-200/90 font-mono text-[11px] pl-5">
                      "{item.representativeIncorrectAnswer}"
                    </p>
                  </div>

                  {/* Correct understanding */}
                  <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-3 text-xs space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Correct Mathematical / Algorithmic Understanding:</span>
                    </div>
                    <p className="text-emerald-200/90 text-xs pl-5 leading-relaxed">
                      {item.correctExplanation}
                    </p>
                  </div>
                </div>

                {/* Detailed Contrasting Example */}
                {item.example && (
                  <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Concrete Scenario / Worked Example:
                    </span>
                    <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                      {item.example}
                    </p>
                  </div>
                )}

                {/* Corrective Feedback & Recommendation */}
                <div className="rounded-xl bg-indigo-950/20 border border-indigo-500/30 p-3 text-xs space-y-1">
                  <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    <span>Corrective Feedback & Learning Recommendation:</span>
                  </div>
                  <p className="text-slate-300 text-xs pl-5 leading-relaxed">
                    {item.correctiveFeedback}
                  </p>
                </div>
              </div>

              {/* Card Footer: Mapped Questions & Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-semibold">Mapped Assessment Items:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {mappedQuestions.length > 0 ? (
                      mappedQuestions.map((q, qIdx) => q && (
                        <span
                          key={`${item.id}-${q.id}-${qIdx}`}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300"
                          title={q.questionText}
                        >
                          {q.id} ({q.bloomsLevel})
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">
                        Mapped to concept "{item.conceptName}"
                      </span>
                    )}
                  </div>
                </div>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('weak_topics')}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition shrink-0"
                  >
                    <span>Remediate in Hub</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredTaxonomy.length === 0 && (
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 space-y-3">
            <AlertTriangle className="h-10 w-10 mx-auto text-amber-400" />
            <h3 className="text-base font-bold text-white">No Misconception Entries Found</h3>
            <p className="text-xs max-w-sm mx-auto">
              No misconception entries matched "{searchQuery}". Try searching by another concept name or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setSelectedConcept('All');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
