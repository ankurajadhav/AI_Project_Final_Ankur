/**
 * Canonical Subjects and Concepts Knowledge Graph
 * 
 * Defines 25 concepts organized systematically under 3 academic subjects:
 * 1. Mathematics (8 concepts)
 * 2. Computer Science (9 concepts)
 * 3. AI & Data Science (8 concepts)
 * 
 * Every concept specifies Corbett & Anderson BKT parameters:
 * P(L0) prior, P(T) transition, P(G) guess, P(S) slip.
 */

import { ConceptDefinition } from '../types';

export const SUPPORTED_SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'AI & Data Science',
] as const;

export type SupportedSubject = typeof SUPPORTED_SUBJECTS[number];

export const CONCEPTS_CATALOG: ConceptDefinition[] = [
  // ==========================================
  // SUBJECT 1: MATHEMATICS (8 CONCEPTS)
  // ==========================================
  {
    id: 'C1_Quadratic_Equations',
    name: 'Quadratic Equations',
    subject: 'Mathematics',
    description: 'Canonical second-order polynomials, discriminant properties, factoring, and parabolic vertex geometry.',
    prerequisites: ['Basic Algebra', 'Polynomial Operations'],
    pL0: 0.40,
    pT: 0.20,
    pG: 0.15,
    pS: 0.08,
  },
  {
    id: 'C2_Linear_Algebra',
    name: 'Linear Algebra',
    subject: 'Mathematics',
    description: 'Vector spaces, matrix multiplications, determinants, systems of linear equations, and basis transformation.',
    prerequisites: ['Coordinate Geometry', 'Systems of Equations'],
    pL0: 0.30,
    pT: 0.15,
    pG: 0.12,
    pS: 0.10,
  },
  {
    id: 'C3_Calculus_Basics',
    name: 'Calculus Basics',
    subject: 'Mathematics',
    description: 'Limits, instantaneous rate of change, derivatives, chain rule, and definite integrals.',
    prerequisites: ['Functions and Graphs', 'Trigonometry'],
    pL0: 0.25,
    pT: 0.14,
    pG: 0.10,
    pS: 0.12,
  },
  {
    id: 'C4_Probability_Statistics',
    name: 'Probability & Statistics',
    subject: 'Mathematics',
    description: 'Sample spaces, conditional probability, Bayes theorem, expected value, and normal distributions.',
    prerequisites: ['Basic Set Theory', 'Arithmetic Combinatorics'],
    pL0: 0.35,
    pT: 0.18,
    pG: 0.14,
    pS: 0.10,
  },
  {
    id: 'C5_Discrete_Math',
    name: 'Discrete Mathematics',
    subject: 'Mathematics',
    description: 'Propositional logic, truth tables, mathematical induction, set operations, and relations.',
    prerequisites: ['Logic Fundamentals'],
    pL0: 0.38,
    pT: 0.19,
    pG: 0.15,
    pS: 0.09,
  },
  {
    id: 'C6_Matrix_Operations',
    name: 'Matrix Operations & Inversion',
    subject: 'Mathematics',
    description: 'Gaussian elimination, matrix rank, identity matrices, inverse calculation, and orthogonal matrices.',
    prerequisites: ['Linear Algebra'],
    pL0: 0.28,
    pT: 0.15,
    pG: 0.11,
    pS: 0.12,
  },
  {
    id: 'C7_Differential_Equations',
    name: 'Differential Equations',
    subject: 'Mathematics',
    description: 'First-order separable differential equations, integrating factors, and homogeneous solutions.',
    prerequisites: ['Calculus Basics', 'Integration Techniques'],
    pL0: 0.22,
    pT: 0.13,
    pG: 0.09,
    pS: 0.14,
  },
  {
    id: 'C8_Vector_Spaces',
    name: 'Vector Spaces & Subspaces',
    subject: 'Mathematics',
    description: 'Linear independence, span, dimension, kernel, and nullity theorem in Euclidean spaces.',
    prerequisites: ['Linear Algebra'],
    pL0: 0.26,
    pT: 0.14,
    pG: 0.10,
    pS: 0.13,
  },

  // ==========================================
  // SUBJECT 2: COMPUTER SCIENCE (9 CONCEPTS)
  // ==========================================
  {
    id: 'C4_Binary_Search_Trees', // preserved existing ID
    name: 'Binary Search Trees',
    subject: 'Computer Science',
    description: 'Binary search tree invariant, in-order predecessor/successor, node insertion, deletion, and tree balancing.',
    prerequisites: ['Pointers & References', 'Binary Trees'],
    pL0: 0.35,
    pT: 0.22,
    pG: 0.15,
    pS: 0.09,
  },
  {
    id: 'C5_Graph_Algorithms', // preserved existing ID
    name: 'Graph Algorithms',
    subject: 'Computer Science',
    description: 'Graph representations, breadth-first search (BFS), depth-first search (DFS), Dijkstra shortest path, and topological sort.',
    prerequisites: ['Queues & Stacks', 'Recursion'],
    pL0: 0.28,
    pT: 0.16,
    pG: 0.12,
    pS: 0.11,
  },
  {
    id: 'C6_Dynamic_Programming', // preserved existing ID
    name: 'Dynamic Programming',
    subject: 'Computer Science',
    description: 'Overlapping subproblems, optimal substructure, memoization tables, bottom-up tabulation, and state transitions.',
    prerequisites: ['Recursion', 'Divide and Conquer'],
    pL0: 0.20,
    pT: 0.12,
    pG: 0.08,
    pS: 0.14,
  },
  {
    id: 'C12_Sorting_Searching',
    name: 'Sorting & Searching',
    subject: 'Computer Science',
    description: 'Comparison-based sorting (MergeSort, QuickSort, HeapSort), binary search, and lower bound asymptotic proofs.',
    prerequisites: ['Asymptotic Analysis (Big-O)'],
    pL0: 0.45,
    pT: 0.25,
    pG: 0.18,
    pS: 0.08,
  },
  {
    id: 'C13_Greedy_Algorithms',
    name: 'Greedy Algorithms',
    subject: 'Computer Science',
    description: 'Greedy choice property, interval scheduling, Huffman coding, and Kruskal/Prim minimum spanning trees.',
    prerequisites: ['Graph Algorithms', 'Sorting'],
    pL0: 0.32,
    pT: 0.18,
    pG: 0.13,
    pS: 0.10,
  },
  {
    id: 'C14_Hash_Tables',
    name: 'Hash Tables & Collision Resolution',
    subject: 'Computer Science',
    description: 'Hash functions, uniform hashing assumption, chaining vs open addressing, load factor, and amortized lookup.',
    prerequisites: ['Arrays', 'Linked Lists'],
    pL0: 0.40,
    pT: 0.21,
    pG: 0.16,
    pS: 0.09,
  },
  {
    id: 'C15_Recursion_Backtracking',
    name: 'Recursion & Backtracking',
    subject: 'Computer Science',
    description: 'Recursive call stack, base case guarantees, state tree exploration, pruning, and N-Queens/Subset generation.',
    prerequisites: ['Call Stack Execution', 'Functions'],
    pL0: 0.30,
    pT: 0.17,
    pG: 0.12,
    pS: 0.12,
  },
  {
    id: 'C16_Object_Oriented_Design',
    name: 'Object-Oriented Design',
    subject: 'Computer Science',
    description: 'Encapsulation, inheritance, polymorphism, abstract interfaces, and SOLID design principles.',
    prerequisites: ['Structured Programming'],
    pL0: 0.48,
    pT: 0.22,
    pG: 0.17,
    pS: 0.08,
  },
  {
    id: 'C17_Operating_Systems_Memory',
    name: 'OS Memory & Concurrency',
    subject: 'Computer Science',
    description: 'Virtual memory paging, cache locality, process threads, mutual exclusion, semaphores, and race conditions.',
    prerequisites: ['Computer Architecture Basics'],
    pL0: 0.25,
    pT: 0.15,
    pG: 0.11,
    pS: 0.12,
  },

  // ==========================================
  // SUBJECT 3: AI & DATA SCIENCE (8 CONCEPTS)
  // ==========================================
  {
    id: 'C18_Supervised_Learning',
    name: 'Supervised Learning Basics',
    subject: 'AI & Data Science',
    description: 'Feature-label pairs, hypothesis space, mean squared error, cross-entropy loss, and train/test evaluation split.',
    prerequisites: ['Probability & Statistics', 'Calculus Basics'],
    pL0: 0.35,
    pT: 0.20,
    pG: 0.14,
    pS: 0.09,
  },
  {
    id: 'C19_Neural_Networks',
    name: 'Neural Networks & Perceptrons',
    subject: 'AI & Data Science',
    description: 'Artificial neurons, activation functions (ReLU, Sigmoid, Softmax), forward propagation, and backpropagation gradients.',
    prerequisites: ['Supervised Learning', 'Matrix Operations'],
    pL0: 0.24,
    pT: 0.14,
    pG: 0.10,
    pS: 0.13,
  },
  {
    id: 'C20_Overfitting_Regularization',
    name: 'Overfitting & Regularization',
    subject: 'AI & Data Science',
    description: 'Bias-variance tradeoff, model complexity, L1 (Lasso), L2 (Ridge) weight decay, dropout, and cross-validation folds.',
    prerequisites: ['Supervised Learning Basics'],
    pL0: 0.30,
    pT: 0.18,
    pG: 0.13,
    pS: 0.11,
  },
  {
    id: 'C21_Evaluation_Metrics',
    name: 'Model Evaluation Metrics',
    subject: 'AI & Data Science',
    description: 'Confusion matrix, True/False Positives, Precision, Recall, F1-Score, ROC curves, AUC, and class imbalance handling.',
    prerequisites: ['Probability & Statistics'],
    pL0: 0.38,
    pT: 0.22,
    pG: 0.15,
    pS: 0.08,
  },
  {
    id: 'C22_Gradient_Descent',
    name: 'Gradient Descent Optimization',
    subject: 'AI & Data Science',
    description: 'Cost function surface, learning rate tuning, batch vs stochastic vs mini-batch gradient descent, and momentum.',
    prerequisites: ['Calculus Basics', 'Vector Spaces'],
    pL0: 0.28,
    pT: 0.16,
    pG: 0.11,
    pS: 0.12,
  },
  {
    id: 'C23_Decision_Trees_Ensembles',
    name: 'Decision Trees & Random Forests',
    subject: 'AI & Data Science',
    description: 'Information gain, Gini impurity, bagging, random subspace projection, out-of-bag error, and variance reduction.',
    prerequisites: ['Supervised Learning Basics'],
    pL0: 0.36,
    pT: 0.20,
    pG: 0.14,
    pS: 0.09,
  },
  {
    id: 'C24_Dimensionality_Reduction',
    name: 'Dimensionality Reduction (PCA)',
    subject: 'AI & Data Science',
    description: 'Curse of dimensionality, covariance matrices, Principal Component Analysis (PCA), eigenvectors, and explained variance.',
    prerequisites: ['Linear Algebra', 'Matrix Operations'],
    pL0: 0.22,
    pT: 0.13,
    pG: 0.09,
    pS: 0.14,
  },
  {
    id: 'C25_NLP_Foundations',
    name: 'NLP & Text Processing',
    subject: 'AI & Data Science',
    description: 'Corpus tokenization, stop-word removal, n-grams, TF-IDF vectorization, word embeddings, and cosine similarity.',
    prerequisites: ['Linear Algebra', 'Python Data Structures'],
    pL0: 0.32,
    pT: 0.17,
    pG: 0.13,
    pS: 0.10,
  },
];

export const CONCEPTS_BY_ID: Record<string, ConceptDefinition> = Object.fromEntries(
  CONCEPTS_CATALOG.map(c => [c.id, c])
);

export const CONCEPTS_BY_SUBJECT: Record<string, ConceptDefinition[]> = CONCEPTS_CATALOG.reduce(
  (acc, c) => {
    if (!acc[c.subject]) acc[c.subject] = [];
    acc[c.subject].push(c);
    return acc;
  },
  {} as Record<string, ConceptDefinition[]>
);
