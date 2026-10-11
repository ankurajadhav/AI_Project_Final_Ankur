/**
 * Bayesian Knowledge Tracing (BKT) Engine
 * 
 * Implements the standard Corbett & Anderson (1994) Hidden Markov Model formulation
 * with mathematically exact Bayesian belief updating, learning transition,
 * parameter introspection, and verification test cases.
 */

import { ConceptMastery, MasteryStatus, ErrorCategory } from '../types';
import { CONCEPTS_CATALOG } from '../data/conceptsData';

export interface BKTParameters {
  pL0: number; // Prior knowledge P(L0)
  pT: number;  // Transition probability P(T) - learning rate
  pG: number;  // Guess probability P(G)
  pS: number;  // Slip probability P(S)
}

export interface DetailedBKTStepResult {
  pPrior: number;
  isCorrect: boolean;
  params: BKTParameters;
  pObserved: number;
  pTransition: number;
  pNext: number;
  stepCalculations: {
    observationFormula: string;
    numerator: number;
    denominator: number;
    transitionFormula: string;
  };
}

// Build map from canonical concepts catalog with fallback
export const DEFAULT_BKT_PARAMS: Record<string, BKTParameters> = {
  default: { pL0: 0.35, pT: 0.18, pG: 0.15, pS: 0.10 },
  ...Object.fromEntries(
    CONCEPTS_CATALOG.map(c => [
      c.id,
      { pL0: c.pL0, pT: c.pT, pG: c.pG, pS: c.pS },
    ])
  ),
};

export class BKTEngine {
  static getStatus(pMastery: number): MasteryStatus {
    if (pMastery >= 0.90) return 'Mastered';
    if (pMastery >= 0.75) return 'Strong';
    if (pMastery >= 0.60) return 'Developing';
    if (pMastery >= 0.40) return 'Weak';
    return 'Critical';
  }

  static getStatusColor(status: MasteryStatus | string): { bg: string; text: string; border: string } {
    switch (status) {
      case 'Mastered':
        return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'Strong':
        return { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' };
      case 'Developing':
      case 'In Progress':
        return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'Weak':
        return { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' };
      case 'Critical':
      default:
        return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' };
    }
  }

  /**
   * Evaluates exact mathematical BKT update step
   * Correct Answer:
   *   p_observed = [p × (1 − P(S))] / [p × (1 − P(S)) + (1 − p) × P(G)]
   * Incorrect Answer:
   *   p_observed = [p × P(S)] / [p × P(S) + (1 − p) × (1 − P(G))]
   * Learning Transition:
   *   p_next = p_observed + (1 − p_observed) × P(T)
   */
  static calculateDetailedStep(
    p: number,
    isCorrect: boolean,
    customParams?: BKTParameters | string
  ): DetailedBKTStepResult {
    let params: BKTParameters;
    if (typeof customParams === 'string') {
      params = DEFAULT_BKT_PARAMS[customParams] || DEFAULT_BKT_PARAMS.default;
    } else if (customParams) {
      params = customParams;
    } else {
      params = DEFAULT_BKT_PARAMS.default;
    }

    const { pT, pG, pS } = params;
    const clampedP = Math.max(0.001, Math.min(0.999, p));

    let pObserved: number;
    let numerator: number;
    let denominator: number;
    let observationFormula: string;

    if (isCorrect) {
      numerator = clampedP * (1 - pS);
      const falseAlarm = (1 - clampedP) * pG;
      denominator = numerator + falseAlarm;
      pObserved = denominator > 0 ? numerator / denominator : clampedP;
      observationFormula = `[${clampedP.toFixed(3)} × (1 - ${pS.toFixed(2)})] / [${clampedP.toFixed(3)} × (1 - ${pS.toFixed(2)}) + (1 - ${clampedP.toFixed(3)}) × ${pG.toFixed(2)}]`;
    } else {
      numerator = clampedP * pS;
      const trueMiss = (1 - clampedP) * (1 - pG);
      denominator = numerator + trueMiss;
      pObserved = denominator > 0 ? numerator / denominator : clampedP;
      observationFormula = `[${clampedP.toFixed(3)} × ${pS.toFixed(2)}] / [${clampedP.toFixed(3)} × ${pS.toFixed(2)} + (1 - ${clampedP.toFixed(3)}) × (1 - ${pG.toFixed(2)})]`;
    }

    const pTransition = (1 - pObserved) * pT;
    const pNext = Math.min(0.999, Math.max(0.001, pObserved + pTransition));
    const transitionFormula = `${pObserved.toFixed(4)} + (1 - ${pObserved.toFixed(4)}) × ${pT.toFixed(2)}`;

    return {
      pPrior: clampedP,
      isCorrect,
      params,
      pObserved: parseFloat(pObserved.toFixed(4)),
      pTransition: parseFloat(pTransition.toFixed(4)),
      pNext: parseFloat(pNext.toFixed(4)),
      stepCalculations: {
        observationFormula,
        numerator: parseFloat(numerator.toFixed(6)),
        denominator: parseFloat(denominator.toFixed(6)),
        transitionFormula,
      },
    };
  }

  /**
   * Update belief state after an observation (isCorrect)
   */
  static updateMastery(
    currentPL: number,
    isCorrect: boolean,
    conceptId: string = 'default'
  ): {
    pPosteriorObs: number;
    nextPMastery: number;
    improvement: number;
    detailed: DetailedBKTStepResult;
  } {
    const detailed = this.calculateDetailedStep(currentPL, isCorrect, conceptId);
    return {
      pPosteriorObs: detailed.pObserved,
      nextPMastery: detailed.pNext,
      improvement: parseFloat((detailed.pNext - currentPL).toFixed(4)),
      detailed,
    };
  }

  /**
   * Known verification test cases for auditing BKT engine correctness
   */
  static runVerificationTestCases(): {
    name: string;
    passed: boolean;
    input: any;
    expected: any;
    actual: any;
  }[] {
    const testCases = [
      {
        name: 'Correct Answer Observation Verification',
        p: 0.35,
        isCorrect: true,
        params: { pL0: 0.35, pT: 0.18, pG: 0.15, pS: 0.10 },
        // p_obs = (0.35 * 0.90) / (0.35 * 0.90 + 0.65 * 0.15) = 0.315 / 0.4125 = 0.7636
        // p_next = 0.7636 + (1 - 0.7636) * 0.18 = 0.8062
        expectedObs: 0.7636,
        expectedNext: 0.8062,
      },
      {
        name: 'Incorrect Answer Observation Verification',
        p: 0.35,
        isCorrect: false,
        params: { pL0: 0.35, pT: 0.18, pG: 0.15, pS: 0.10 },
        // p_obs = (0.35 * 0.10) / (0.35 * 0.10 + 0.65 * 0.85) = 0.035 / 0.5875 = 0.0596
        // p_next = 0.0596 + (1 - 0.0596) * 0.18 = 0.2288
        expectedObs: 0.0596,
        expectedNext: 0.2288,
      },
      {
        name: 'Initial Prior Boundary P(L0) Step',
        p: 0.40,
        isCorrect: true,
        params: { pL0: 0.40, pT: 0.20, pG: 0.15, pS: 0.08 },
        // p_obs = (0.40 * 0.92) / (0.40 * 0.92 + 0.60 * 0.15) = 0.368 / (0.368 + 0.09) = 0.368 / 0.458 = 0.8035
        // p_next = 0.8035 + (1 - 0.8035) * 0.20 = 0.8035 + 0.0393 = 0.8428
        expectedObs: 0.8035,
        expectedNext: 0.8428,
      },
    ];

    return testCases.map(tc => {
      const result = this.calculateDetailedStep(tc.p, tc.isCorrect, tc.params);
      const obsDiff = Math.abs(result.pObserved - tc.expectedObs);
      const nextDiff = Math.abs(result.pNext - tc.expectedNext);
      const passed = obsDiff < 0.002 && nextDiff < 0.002;
      return {
        name: tc.name,
        passed,
        input: { p: tc.p, isCorrect: tc.isCorrect, params: tc.params },
        expected: { pObserved: tc.expectedObs, pNext: tc.expectedNext },
        actual: { pObserved: result.pObserved, pNext: result.pNext },
      };
    });
  }

  /**
   * Initializes or updates a ConceptMastery object with a new response
   */
  static processResponse(
    existingMastery: ConceptMastery | undefined,
    studentId: string,
    conceptId: string,
    conceptName: string,
    subject: string,
    isCorrect: boolean,
    errorType: ErrorCategory = 'none'
  ): ConceptMastery {
    const params = DEFAULT_BKT_PARAMS[conceptId] || DEFAULT_BKT_PARAMS.default;
    const initialPL = existingMastery ? existingMastery.pMastery : params.pL0;

    const { nextPMastery } = this.updateMastery(initialPL, isCorrect, conceptId);
    const status = this.getStatus(nextPMastery);

    const history = existingMastery?.history ? [...existingMastery.history] : [];
    history.push({
      timestamp: new Date().toISOString(),
      pMastery: nextPMastery,
      wasCorrect: isCorrect,
    });

    const recentErrors = existingMastery?.recentErrorTypes ? [...existingMastery.recentErrorTypes] : [];
    if (!isCorrect && errorType !== 'none') {
      recentErrors.push(errorType);
      if (recentErrors.length > 5) recentErrors.shift();
    }

    return {
      studentId,
      conceptId,
      conceptName,
      subject,
      pMastery: nextPMastery,
      status,
      totalAttempts: (existingMastery?.totalAttempts || 0) + 1,
      correctAttempts: (existingMastery?.correctAttempts || 0) + (isCorrect ? 1 : 0),
      lastAttemptAt: new Date().toISOString(),
      recentErrorTypes: recentErrors,
      history,
    };
  }
}
