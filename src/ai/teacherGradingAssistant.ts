/**
 * Teacher AI Grading Assistant
 * 
 * Provides automated rubric evaluation, concept coverage detection,
 * missing step analysis, and human-in-the-loop review recommendations
 * for open-ended / descriptive student submissions.
 */

import { Question, StudentAnswer } from '../types';
import { randomForestService } from './randomForestModel';
import { apiClient } from '../services/apiClient';

export interface RubricCriteriaEvaluation {
  criteriaName: string;
  maxScore: number;
  awardedScore: number;
  status: 'met' | 'partially_met' | 'missing';
  feedback: string;
}

export interface AIGradingSuggestion {
  questionId: string;
  suggestedScore: number;
  maxScore: number;
  percentage: number;
  confidence: number;
  detectedConcepts: string[];
  missingConcepts: string[];
  rubricBreakdown: RubricCriteriaEvaluation[];
  detailedRationale: string;
  actionableGuidance?: string;
  predictedTeacherAlignmentScore: number;
  isAiGraded: boolean;
  modelUsed?: string;
  status: 'pending_teacher_review' | 'approved' | 'modified';
}

export class TeacherGradingAssistant {
  /**
   * Generates a comprehensive rubric-based grading suggestion for an answer (local Random Forest engine)
   */
  static evaluateSubmission(
    question: Question,
    studentAnswerText: string
  ): AIGradingSuggestion {
    const text = (studentAnswerText || '').trim();
    const textLower = text.toLowerCase();
    const maxScore = Number(question.marks) || 10;

    const rubricKeywords = question.rubricKeywords && question.rubricKeywords.length > 0
      ? question.rubricKeywords
      : ['definition', 'proof', 'complexity', 'example', 'analysis', 'steps', 'edge case'];

    // 0. Blank or whitespace response check
    if (!text) {
      return {
        questionId: question.id,
        suggestedScore: 0,
        maxScore,
        percentage: 0,
        confidence: 0.99,
        detectedConcepts: [],
        missingConcepts: rubricKeywords,
        rubricBreakdown: [
          {
            criteriaName: 'Conceptual Correctness & Core Principles',
            maxScore: parseFloat((maxScore * 0.5).toFixed(1)),
            awardedScore: 0,
            status: 'missing',
            feedback: 'No response submitted. Core principles not addressed.',
          },
          {
            criteriaName: 'Technical Depth & Keyword Coverage',
            maxScore: parseFloat((maxScore * 0.3).toFixed(1)),
            awardedScore: 0,
            status: 'missing',
            feedback: 'No domain keywords or terminology detected.',
          },
          {
            criteriaName: 'Structure, Clarity & Presentation',
            maxScore: parseFloat((maxScore * 0.2).toFixed(1)),
            awardedScore: 0,
            status: 'missing',
            feedback: 'No written explanation provided.',
          },
        ],
        detailedRationale: 'Zero marks assigned: No student response provided.',
        actionableGuidance: 'Provide a complete written explanation covering definitions, key steps, and invariants.',
        predictedTeacherAlignmentScore: 0,
        isAiGraded: true,
        modelUsed: 'deterministic',
        status: 'pending_teacher_review',
      };
    }

    // 1. Keyword and concept matching (with word boundary / partial awareness)
    const detectedKeywords = rubricKeywords.filter(kw => {
      const kwLower = kw.toLowerCase();
      return textLower.includes(kwLower) || 
        kwLower.split(/\s+/).some(part => part.length > 3 && textLower.includes(part));
    });
    const missingKeywords = rubricKeywords.filter(kw => !detectedKeywords.includes(kw));

    const keywordRatio = rubricKeywords.length > 0
      ? detectedKeywords.length / rubricKeywords.length
      : 0.8;

    // 2. Length & presentation metrics
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const hasStructure = text.includes('\n') || text.includes('1.') || text.includes('- ') || text.includes(':') || text.includes(';');
    
    // Penalize ultra-short answers (< 5 words)
    let presentationScore = 0.3;
    if (wordCount >= 30) presentationScore = 0.8 + (hasStructure ? 0.2 : 0);
    else if (wordCount >= 15) presentationScore = 0.6 + (hasStructure ? 0.2 : 0);
    else if (wordCount >= 5) presentationScore = 0.45;
    else presentationScore = 0.2;
    presentationScore = Math.min(1.0, Math.max(0.1, presentationScore));

    const effortScore = Math.min(1.0, Math.max(0.1, wordCount / 40));

    // 3. Solution Correctness estimation
    let correctnessEstimate = 0.5;
    if (question.questionType === 'mcq' || question.questionType === 'true_false' || question.questionType === 'numerical') {
      const correctStr = String(question.correctAnswer).trim().toLowerCase();
      correctnessEstimate = textLower === correctStr ? 1.0 : 0.0;
    } else {
      // Descriptive / short answer evaluation
      // Match against sample benchmark answer if present
      let sampleSimilarity = 0.5;
      if (question.sampleAnswer) {
        const sampleWords = question.sampleAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matchCount = sampleWords.filter(w => textLower.includes(w)).length;
        sampleSimilarity = sampleWords.length > 0 ? matchCount / sampleWords.length : 0.5;
      }

      const lengthFactor = Math.min(1.0, wordCount / 25);
      correctnessEstimate = Math.min(1.0, (keywordRatio * 0.55 + sampleSimilarity * 0.3 + lengthFactor * 0.15));
      if (wordCount < 6 && keywordRatio < 0.3) {
        correctnessEstimate = Math.min(0.2, correctnessEstimate);
      }
    }

    const explanationDepth = Math.min(1.0, Math.max(0.1, keywordRatio * 0.6 + (wordCount > 35 ? 0.4 : (wordCount / 50) * 0.3)));

    // 4. Pass through Random Forest Grading Model
    const rfExplanation = randomForestService.explainPrediction(
      correctnessEstimate,
      explanationDepth,
      presentationScore,
      keywordRatio,
      effortScore,
      question.difficultyScore
    );

    let rawPredictedPercent = rfExplanation.predictedGrade;
    if (wordCount < 4) {
      rawPredictedPercent = Math.min(15, rawPredictedPercent);
    }
    const finalScaledScore = parseFloat(((rawPredictedPercent / 100) * maxScore).toFixed(1));

    // 5. Construct Rubric Breakdown
    const corePrinciplesMax = parseFloat((maxScore * 0.5).toFixed(1));
    const technicalDepthMax = parseFloat((maxScore * 0.3).toFixed(1));
    const clarityMax = parseFloat((maxScore * 0.2).toFixed(1));

    const coreAwarded = parseFloat((corePrinciplesMax * correctnessEstimate).toFixed(1));
    const techAwarded = parseFloat((technicalDepthMax * keywordRatio).toFixed(1));
    const clarityAwarded = parseFloat((clarityMax * presentationScore).toFixed(1));

    const rubricBreakdown: RubricCriteriaEvaluation[] = [
      {
        criteriaName: 'Conceptual Correctness & Core Principles',
        maxScore: corePrinciplesMax,
        awardedScore: coreAwarded,
        status: correctnessEstimate >= 0.75 ? 'met' : correctnessEstimate >= 0.4 ? 'partially_met' : 'missing',
        feedback: correctnessEstimate >= 0.75 
          ? 'Accurately captures fundamental theorem/logic and system behavior.'
          : correctnessEstimate >= 0.4
          ? 'Partially addresses core concepts but lacks key invariants or reasoning.'
          : 'Fails to explain core principles or contains significant conceptual gaps.',
      },
      {
        criteriaName: 'Technical Depth & Keyword Coverage',
        maxScore: technicalDepthMax,
        awardedScore: techAwarded,
        status: keywordRatio >= 0.70 ? 'met' : keywordRatio >= 0.35 ? 'partially_met' : 'missing',
        feedback: detectedKeywords.length > 0
          ? `Included ${detectedKeywords.length} of ${rubricKeywords.length} expected terms (${detectedKeywords.slice(0, 3).join(', ')}${detectedKeywords.length > 3 ? '...' : ''}).`
          : `Omitted key domain terms: ${rubricKeywords.slice(0, 3).join(', ')}.`,
      },
      {
        criteriaName: 'Structure, Clarity & Presentation',
        maxScore: clarityMax,
        awardedScore: clarityAwarded,
        status: presentationScore >= 0.7 ? 'met' : presentationScore >= 0.4 ? 'partially_met' : 'missing',
        feedback: hasStructure 
          ? 'Well-organized stepwise response with clear formatting.' 
          : wordCount > 20
          ? 'Readable prose; structured numbered steps or bullet points would improve clarity.'
          : 'Brief or unstructured answer.',
      },
    ];

    let guidance = '';
    if (missingKeywords.length > 0) {
      guidance = `Strengthen answer by integrating expected concepts: ${missingKeywords.slice(0, 3).join(', ')}.`;
    } else {
      guidance = 'Excellent technical depth and conceptual rigor across all rubric checkpoints.';
    }

    return {
      questionId: question.id,
      suggestedScore: Math.min(maxScore, finalScaledScore),
      maxScore,
      percentage: Math.round((finalScaledScore / maxScore) * 100),
      confidence: rfExplanation.confidence,
      detectedConcepts: detectedKeywords.length > 0 ? detectedKeywords : [question.topic],
      missingConcepts: missingKeywords,
      rubricBreakdown,
      detailedRationale: `AI Grading Pattern Model estimated ${rawPredictedPercent}% match. ${rfExplanation.interpretation}`,
      actionableGuidance: guidance,
      predictedTeacherAlignmentScore: rawPredictedPercent,
      isAiGraded: true,
      modelUsed: 'Random Forest Ensemble (100 Trees)',
      status: 'pending_teacher_review',
    };
  }

  /**
   * Asynchronously evaluates submission with server-side Gemini AI model if available,
   * with seamless fallback to the local Random Forest engine.
   */
  static async evaluateSubmissionAsync(
    question: Question,
    studentAnswerText: string
  ): Promise<AIGradingSuggestion> {
    try {
      const serverResult = await apiClient.gradeSubmission(question, studentAnswerText);
      if (serverResult && typeof serverResult.suggestedScore === 'number' && serverResult.modelUsed !== 'local_engine' && serverResult.modelUsed !== 'client_fallback') {
        const maxScore = Number(question.marks) || 10;
        return {
          questionId: question.id,
          suggestedScore: serverResult.suggestedScore,
          maxScore,
          percentage: serverResult.percentage || Math.round((serverResult.suggestedScore / maxScore) * 100),
          confidence: serverResult.confidence || 0.92,
          detectedConcepts: serverResult.detectedConcepts || [],
          missingConcepts: serverResult.missingConcepts || [],
          rubricBreakdown: serverResult.rubricBreakdown || [],
          detailedRationale: serverResult.detailedRationale || 'Evaluated against grading rubric criteria.',
          actionableGuidance: serverResult.actionableGuidance || '',
          predictedTeacherAlignmentScore: serverResult.percentage || Math.round((serverResult.suggestedScore / maxScore) * 100),
          isAiGraded: true,
          modelUsed: 'Grading Pattern Evaluator',
          status: 'pending_teacher_review',
        };
      }
    } catch (e) {
      console.warn('[TeacherGradingAssistant] Server evaluation fallback to local:', e);
    }

    return this.evaluateSubmission(question, studentAnswerText);
  }
}
