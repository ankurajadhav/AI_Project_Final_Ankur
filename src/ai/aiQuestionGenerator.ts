/**
 * AI Question Synthesis & Authoring Engine
 * 
 * Generates pedagogically structured assessment questions tagged with
 * Bloom's Taxonomy, difficulty scores, common misconception distractors,
 * and comprehensive explanations across engineering and mathematical topics.
 */

import { Question, BloomsLevel, QuestionType } from '../types';

export interface AIQuestionGenerateParams {
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bloomsLevel: BloomsLevel;
  questionType: QuestionType;
  count: number;
}

export class AIQuestionGenerator {
  static generateQuestions(params: AIQuestionGenerateParams): Question[] {
    const questions: Question[] = [];
    const diffScore = params.difficulty === 'Easy' ? 0.3 : params.difficulty === 'Medium' ? 0.55 : 0.85;

    for (let i = 0; i < params.count; i++) {
      const q = this.synthesizeSingleQuestion(params, i + 1, diffScore);
      questions.push(q);
    }

    return questions;
  }

  private static synthesizeSingleQuestion(
    params: AIQuestionGenerateParams,
    index: number,
    difficultyScore: number
  ): Question {
    const id = `ai_gen_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
    const topic = params.topic;
    const blooms = params.bloomsLevel;

    // Rich domain knowledge templates across topics
    if (topic.includes('Tree') || topic.includes('Binary') || topic.includes('BST')) {
      if (blooms === 'Remember') {
        return {
          id,
          subject: params.subject,
          topic: 'Binary Search Trees',
          subtopic: 'Tree Properties',
          conceptId: 'C4_Binary_Search_Trees',
          questionText: 'What is the maximum number of nodes in a binary tree of height h (where a root-only tree has height 0)?',
          questionType: 'mcq',
          options: [
            { id: 'opt_1', text: '2^(h+1) - 1', isCorrect: true },
            { id: 'opt_2', text: '2^h', isCorrect: false },
            { id: 'opt_3', text: '2^(h-1)', isCorrect: false },
            { id: 'opt_4', text: '2^(h+1)', isCorrect: false },
          ],
          correctAnswer: 'opt_1',
          explanation: 'A full binary tree of height h contains sum of 2^i for i=0 to h, which sums to 2^(h+1) - 1 nodes.',
          marks: 2,
          difficultyScore: 0.25,
          bloomsLevel: 'Remember',
          prerequisites: ['Binary Tree Basics'],
          misconceptionMapping: {
            'opt_2': {
              errorType: 'wrong_formula',
              explanation: '2^h is the number of nodes at the leaf level h only, not the total tree capacity.',
            },
          },
          tags: ['Trees', 'Formulas', 'Data Structures'],
          estimatedMinutes: 2,
          source: 'ai_generated',
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
      } else if (blooms === 'Apply' || blooms === 'Analyze') {
        return {
          id,
          subject: params.subject,
          topic: 'Binary Search Trees',
          subtopic: 'Tree Balancing & Rotations',
          conceptId: 'C4_Binary_Search_Trees',
          questionText: 'Given an AVL tree where the sequence [10, 20, 30] is inserted consecutively, which rotation operation restores balance and what is the resulting root node?',
          questionType: 'mcq',
          options: [
            { id: 'opt_1', text: 'Left Rotation (RR case), resulting root 20', isCorrect: true },
            { id: 'opt_2', text: 'Right Rotation (LL case), resulting root 10', isCorrect: false },
            { id: 'opt_3', text: 'Left-Right Double Rotation, resulting root 30', isCorrect: false },
            { id: 'opt_4', text: 'No rotation required, balance factor is 0', isCorrect: false },
          ],
          correctAnswer: 'opt_1',
          explanation: 'Consecutive insertions 10 -> 20 -> 30 create an unbalanced right-right heavy chain. A single Left rotation at node 10 elevates 20 to the root with left child 10 and right child 30.',
          marks: 4,
          difficultyScore: 0.65,
          bloomsLevel: blooms,
          prerequisites: ['AVL Tree Balance Factor', 'Binary Search Tree Property'],
          tags: ['AVL', 'Rotations', 'Tree Balance'],
          estimatedMinutes: 4,
          source: 'ai_generated',
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (topic.includes('Graph') || topic.includes('Traversal')) {
      return {
        id,
        subject: params.subject,
        topic: 'Graph Algorithms',
        subtopic: 'Shortest Path & Traversal',
        conceptId: 'C5_Graph_Algorithms',
        questionText: `Analyze the time complexity of Dijkstra's algorithm implemented with a Min-Indexed Binary Heap for a directed graph with V vertices and E edges.`,
        questionType: 'mcq',
        options: [
          { id: 'opt_1', text: 'O((V + E) log V)', isCorrect: true },
          { id: 'opt_2', text: 'O(V^2)', isCorrect: false },
          { id: 'opt_3', text: 'O(V * E)', isCorrect: false },
          { id: 'opt_4', text: 'O(E log E)', isCorrect: false },
        ],
        correctAnswer: 'opt_1',
        explanation: 'Each vertex is extracted from the priority queue once (V log V), and each edge relaxation invokes decrease-key at most once (E log V), yielding O((V + E) log V).',
        marks: 4,
        difficultyScore: 0.6,
        bloomsLevel: 'Analyze',
        prerequisites: ['Graph Representation', 'Priority Queues'],
        misconceptionMapping: {
          'opt_2': {
            errorType: 'conceptual_misunderstanding',
            explanation: 'O(V^2) is the complexity when using an unindexed adjacency matrix / array implementation without a min-heap.',
          },
        },
        tags: ['Graphs', 'Dijkstra', 'Complexity'],
        estimatedMinutes: 3,
        source: 'ai_generated',
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
    }

    if (topic.includes('Dynamic') || topic.includes('DP')) {
      return {
        id,
        subject: params.subject,
        topic: 'Dynamic Programming',
        subtopic: 'Optimal Substructure & Memoization',
        conceptId: 'C6_Dynamic_Programming',
        questionText: 'Explain the difference between Top-Down (Memoization) and Bottom-Up (Tabulation) Dynamic Programming with respect to call stack overhead and subproblem evaluation order.',
        questionType: 'descriptive',
        correctAnswer: 'Top-down uses recursion with memoization solving only required subproblems on-demand with call-stack overhead, while bottom-up iteratively fills a table in topological order avoiding recursion overhead.',
        explanation: 'Top-down evaluates subproblems recursively on-demand, caching return values. Bottom-up systematically solves all subproblems starting from base cases, eliminating function call stack overhead.',
        marks: 5,
        difficultyScore: 0.75,
        bloomsLevel: 'Evaluate',
        prerequisites: ['Recursion', 'DAG Subproblem Dependencies'],
        sampleAnswer: 'Top-down relies on recursion + hash table / cache to solve subproblems on demand, incurring function call overhead. Bottom-up evaluates iteratively from base cases in table form, guaranteeing O(1) loop transitions and no recursion stack limit.',
        rubricKeywords: ['recursion', 'memoization', 'tabulation', 'call stack', 'base cases', 'topological order', 'cache'],
        tags: ['DP', 'Memoization', 'Tabulation'],
        estimatedMinutes: 5,
        source: 'ai_generated',
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
    }

    // Default synthesized question
    return {
      id,
      subject: params.subject || 'Engineering Concepts',
      topic: params.topic || 'Core Foundations',
      subtopic: params.subtopic || 'General Principles',
      conceptId: 'C1_Quadratic_Equations',
      questionText: `Synthesized ${params.bloomsLevel} Question ${index} on ${params.topic}: Analyze the primary operational tradeoff between time complexity and space utilization in this context.`,
      questionType: 'mcq',
      options: [
        { id: 'opt_1', text: 'Precomputing intermediate states reduces query time from O(n) to O(1) at the cost of O(n) auxiliary space.', isCorrect: true },
        { id: 'opt_2', text: 'Space and time always decrease simultaneously without tradeoff.', isCorrect: false },
        { id: 'opt_3', text: 'Memory allocation has zero effect on cache locality and CPU cycle latency.', isCorrect: false },
        { id: 'opt_4', text: 'All algorithms can achieve O(1) time and O(1) space universally.', isCorrect: false },
      ],
      correctAnswer: 'opt_1',
      explanation: 'Fundamental space-time tradeoff: caching or precomputing subproblem states consumes auxiliary memory to accelerate future queries.',
      marks: 3,
      difficultyScore,
      bloomsLevel: params.bloomsLevel,
      prerequisites: ['Foundational Concepts'],
      tags: [params.topic, 'Synthesized', 'Tradeoffs'],
      estimatedMinutes: 3,
      source: 'ai_generated',
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
  }
}
