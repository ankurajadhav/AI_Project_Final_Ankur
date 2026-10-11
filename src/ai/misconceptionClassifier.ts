/**
 * AI Misconception Detection & Diagnostic Classifier
 * 
 * Analyzes incorrect student responses, identifies specific cognitive fallacies,
 * incorrect formula applications, careless slips, or prerequisite gaps,
 * grounded in the structured Misconception Taxonomy.
 */

import { Question, ErrorCategory } from '../types';
import { MISCONCEPTION_TAXONOMY, MISCONCEPTIONS_BY_CONCEPT } from '../data/misconceptionTaxonomy';

export interface MisconceptionDiagnosis {
  errorType: ErrorCategory;
  severity: 'High' | 'Medium' | 'Low';
  conceptName: string;
  problemSummary: string;
  detailedAnalysis: string;
  targetedRemedy: string;
  recommendedResourceAction: string;
  matchedMisconceptionId?: string;
  examplePattern?: string;
  correctExplanation?: string;
}

export class MisconceptionClassifier {
  /**
   * Diagnoses an incorrect answer for a given question against the Misconception Taxonomy
   */
  static diagnose(
    question: Question,
    givenAnswer: string | string[]
  ): MisconceptionDiagnosis {
    const givenStr = Array.isArray(givenAnswer)
      ? givenAnswer.join(', ').trim().toLowerCase()
      : String(givenAnswer).trim().toLowerCase();

    // 1. Direct distractor mapping if question defines misconceptionMapping
    if (question.misconceptionMapping && question.misconceptionMapping[givenStr]) {
      const mapped = question.misconceptionMapping[givenStr];
      return {
        errorType: mapped.errorType,
        severity: mapped.errorType === 'conceptual_misunderstanding' ? 'High' : 'Medium',
        conceptName: question.topic,
        problemSummary: `Selected distractor pattern: ${mapped.errorType.replace('_', ' ')}`,
        detailedAnalysis: mapped.explanation,
        targetedRemedy: `Review core concept "${question.topic}" and inspect why "${givenStr}" fails edge constraints.`,
        recommendedResourceAction: `Study remedial notes & video on ${question.topic}`,
      };
    }

    // 2. Structured Misconception Taxonomy lookup for question's conceptId
    const conceptTaxonomy = MISCONCEPTIONS_BY_CONCEPT[question.conceptId] || [];
    for (const item of conceptTaxonomy) {
      const incorrectKey = item.representativeIncorrectAnswer.toLowerCase();
      // Check if student answer matches key phrasing of representative incorrect pattern
      const keywords = incorrectKey.split(/\s+/).filter(w => w.length > 3);
      const matchesKeyword = keywords.length > 0 && keywords.some(kw => givenStr.includes(kw));

      if (matchesKeyword || (givenStr.length > 0 && item.description.toLowerCase().includes(givenStr))) {
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: question.topic,
          problemSummary: item.name,
          detailedAnalysis: item.description,
          targetedRemedy: item.correctiveFeedback,
          recommendedResourceAction: `Review curated remediation for ${item.conceptName}`,
          matchedMisconceptionId: item.id,
          examplePattern: item.example,
          correctExplanation: item.correctExplanation,
        };
      }
    }

    // 3. Keyword & Heuristic Error Pattern Analysis
    const textLower = question.questionText.toLowerCase();

    // Quadratic Equations heuristics
    if (textLower.includes('discriminant') || textLower.includes('quadratic')) {
      if (givenStr.includes('b^2+4ac') || givenStr.includes('b^2+4*a*c') || givenStr.includes('+ 4ac')) {
        const item = MISCONCEPTION_TAXONOMY.find(m => m.id === 'MISC_QUAD_DISCRIMINANT_SIGN');
        return {
          errorType: 'wrong_formula',
          severity: 'High',
          conceptName: 'Quadratic Equations',
          problemSummary: item?.name || 'Sign error in discriminant formula (b² - 4ac)',
          detailedAnalysis: item?.description || 'The discriminant formula is Δ = b² - 4ac. Adding 4ac causes incorrect root characterization.',
          targetedRemedy: item?.correctiveFeedback || 'Re-derive the quadratic formula by completing the square.',
          recommendedResourceAction: 'Review algebraic derivation of discriminant',
          matchedMisconceptionId: item?.id,
          examplePattern: item?.example,
          correctExplanation: item?.correctExplanation,
        };
      }
      if (givenStr.includes('real') && textLower.includes('negative discriminant')) {
        const item = MISCONCEPTION_TAXONOMY.find(m => m.id === 'MISC_QUAD_COMPLEX_ROOTS_REAL_PLANE');
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: 'Quadratic Equations',
          problemSummary: item?.name || 'Misinterpreting complex roots in real number plane',
          detailedAnalysis: item?.description || 'When Δ < 0, roots are complex conjugate numbers, not real intercepts.',
          targetedRemedy: item?.correctiveFeedback || 'Revise geometric meaning of parabolas with zero real intercepts.',
          recommendedResourceAction: 'Parabola vertex & discriminant visualizer',
          matchedMisconceptionId: item?.id,
          examplePattern: item?.example,
          correctExplanation: item?.correctExplanation,
        };
      }
    }

    // Linear Algebra commutativity heuristic
    if (textLower.includes('matrix') && (givenStr.includes('always commutative') || givenStr.includes('ab = ba'))) {
      const item = MISCONCEPTION_TAXONOMY.find(m => m.id === 'MISC_MATRIX_MULTIPLICATION_COMMUTATIVITY');
      return {
        errorType: 'conceptual_misunderstanding',
        severity: 'High',
        conceptName: 'Linear Algebra',
        problemSummary: item?.name || 'Assuming Matrix Multiplication is Commutative',
        detailedAnalysis: item?.description || 'In general, AB ≠ BA for matrix products.',
        targetedRemedy: item?.correctiveFeedback || 'Review geometric transformations and composition order.',
        recommendedResourceAction: 'Study Matrix Transformation Properties',
        matchedMisconceptionId: item?.id,
        examplePattern: item?.example,
        correctExplanation: item?.correctExplanation,
      };
    }

    // Calculus Chain rule heuristic
    if (textLower.includes('chain rule') || textLower.includes('derivative')) {
      const item = MISCONCEPTION_TAXONOMY.find(m => m.id === 'MISC_CALCULUS_CHAIN_RULE_OMISSION');
      if (item && (givenStr.includes("4(3x² - 5)³") || givenStr.includes('cos(3x²)'))) {
        return {
          errorType: 'wrong_formula',
          severity: 'High',
          conceptName: 'Calculus Basics',
          problemSummary: item.name,
          detailedAnalysis: item.description,
          targetedRemedy: item.correctiveFeedback,
          recommendedResourceAction: 'Watch lesson on Chain Rule inner derivative multiplication',
          matchedMisconceptionId: item.id,
          examplePattern: item.example,
          correctExplanation: item.correctExplanation,
        };
      }
    }

    // Binary Search Trees heuristics
    if (textLower.includes('bst') || textLower.includes('binary search tree')) {
      const item = MISCONCEPTION_TAXONOMY.find(m => m.id === 'MISC_BST_DELETION_LEAF_CONFUSION');
      if (item && (givenStr.includes('right child') || givenStr.includes('replace with left'))) {
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: 'Binary Search Trees',
          problemSummary: item.name,
          detailedAnalysis: item.description,
          targetedRemedy: item.correctiveFeedback,
          recommendedResourceAction: 'Inspect BST in-order successor deletion visualizer',
          matchedMisconceptionId: item.id,
          examplePattern: item.example,
          correctExplanation: item.correctExplanation,
        };
      }
    }

    // Graph Algorithms heuristics
    if (textLower.includes('bfs') || textLower.includes('dfs') || textLower.includes('dijkstra')) {
      if (givenStr.includes('dijkstra') && textLower.includes('negative edge')) {
        const item = MISCONCEPTION_TAXONOMY.find(m => m.id === 'MISC_GRAPH_DIJKSTRA_NEGATIVE_WEIGHTS');
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: 'Graph Algorithms',
          problemSummary: item?.name || 'Applying Dijkstra to graphs with negative edge weights',
          detailedAnalysis: item?.description || 'Dijkstra assumes non-decreasing path costs (greedy choice).',
          targetedRemedy: item?.correctiveFeedback || 'Review Bellman-Ford algorithm for negative edge weights.',
          recommendedResourceAction: 'Study shortest path algorithm selection criteria',
          matchedMisconceptionId: item?.id,
          examplePattern: item?.example,
          correctExplanation: item?.correctExplanation,
        };
      }
    }

    // AI & Data Science heuristics
    if (textLower.includes('regularization') || textLower.includes('l1') || textLower.includes('l2')) {
      const item = MISCONCEPTION_TAXONOMY.find(m => m.id === 'MISC_REGULARIZATION_L1_VS_L2_SPARSITY');
      if (item && givenStr.includes('l2 ridge regularization sets unimportant feature weights to exactly zero')) {
        return {
          errorType: 'conceptual_misunderstanding',
          severity: 'High',
          conceptName: 'Overfitting & Regularization',
          problemSummary: item.name,
          detailedAnalysis: item.description,
          targetedRemedy: item.correctiveFeedback,
          recommendedResourceAction: 'Study geometric difference between L1 diamond and L2 circle contours',
          matchedMisconceptionId: item.id,
          examplePattern: item.example,
          correctExplanation: item.correctExplanation,
        };
      }
    }

    // Default heuristic based on answer length & differences
    if (givenStr.length === 0) {
      return {
        errorType: 'incomplete_logic',
        severity: 'Medium',
        conceptName: question.topic,
        problemSummary: 'Question was left unattempted or answer was blank',
        detailedAnalysis: 'No candidate reasoning was supplied. This often signals low student confidence or time expiration.',
        targetedRemedy: 'Break problem into smaller sub-questions and attempt foundational step 1 first.',
        recommendedResourceAction: 'Review beginner walkthrough on this topic',
      };
    }

    return {
      errorType: 'careless_slip',
      severity: 'Medium',
      conceptName: question.topic,
      problemSummary: 'Calculation or syntax mismatch against standard answer key',
      detailedAnalysis: `The provided response ("${givenStr.slice(0, 40)}${givenStr.length > 40 ? '...' : ''}") differed from the expected model solution. Check for sign reversals, operator priority, or index bounds.`,
      targetedRemedy: 'Verify intermediate computation steps and check dimensional/type consistency.',
      recommendedResourceAction: 'Check worked example solution for this problem',
    };
  }

  static getTaxonomy(): typeof MISCONCEPTION_TAXONOMY {
    return MISCONCEPTION_TAXONOMY;
  }

  static getTaxonomyForConcept(conceptId: string) {
    return MISCONCEPTIONS_BY_CONCEPT[conceptId] || [];
  }

  static getErrorTypeLabel(errorType: ErrorCategory): string {
    switch (errorType) {
      case 'conceptual_misunderstanding':
        return 'Conceptual Misunderstanding';
      case 'wrong_formula':
        return 'Wrong Formula / Rule';
      case 'incomplete_logic':
        return 'Incomplete Logical Steps';
      case 'careless_slip':
        return 'Careless / Arithmetic Slip';
      case 'terminology_confusion':
        return 'Terminology Confusion';
      case 'prerequisite_gap':
        return 'Prerequisite Gap';
      case 'none':
        return 'Correct / Valid Solution';
    }
  }
}
