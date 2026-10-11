/**
 * Personalized Remediation & YouTube Recommendation Service
 */

import { RemediationPlan, LearningResource, Question } from '../types';
import { storageService } from './storageService';
import { BKTEngine } from '../ai/bktEngine';

export class RecommendationService {
  /**
   * Generates a targeted remediation plan for a specific student and concept
   */
  static getRemediationPlan(studentId: string, conceptId: string): RemediationPlan {
    const masteryMap = storageService.getMasteryRecords(studentId);
    const conceptMastery = masteryMap[conceptId];
    const pMastery = conceptMastery ? conceptMastery.pMastery : 0.50;
    const status = BKTEngine.getStatus(pMastery);

    const questions = storageService.getQuestions();
    const cleanName = conceptId.replace(/C\d+_/, '').replace(/_/g, ' ');
    const conceptQuestions = questions.filter(
      q => q.conceptId === conceptId ||
           q.topic.toLowerCase().includes(cleanName.toLowerCase()) ||
           cleanName.toLowerCase().includes(q.topic.toLowerCase())
    );
    const conceptName = conceptQuestions[0]?.topic || cleanName;

    const resources = storageService.getResources();
    let matchedResources = resources.filter(
      r => r.conceptId === conceptId ||
           r.conceptName.toLowerCase().includes(conceptName.toLowerCase()) ||
           conceptName.toLowerCase().includes(r.conceptName.toLowerCase())
    );

    if (matchedResources.length === 0) {
      matchedResources = resources.slice(0, 2);
    }

    const youtubeResources = matchedResources.filter(r => r.resourceType === 'youtube');
    const fallbackYoutube = resources.filter(r => r.resourceType === 'youtube').slice(0, 2);
    const finalYoutube = youtubeResources.length > 0 ? youtubeResources : fallbackYoutube;
    const readingResources = matchedResources.filter(r => r.resourceType !== 'youtube');

    // 2-item Micro Review questions (Remember/Understand + Apply)
    // Prioritize multiple-choice questions with options so the student can interactively select answers
    const mcqQuestions = conceptQuestions.filter(q => Array.isArray(q.options) && q.options.length > 0);
    const remQ = mcqQuestions.find(q => q.bloomsLevel === 'Remember' || q.bloomsLevel === 'Understand') ||
                 mcqQuestions[0] ||
                 conceptQuestions.find(q => q.bloomsLevel === 'Remember' || q.bloomsLevel === 'Understand');
    const appQ = mcqQuestions.find(q => (q.bloomsLevel === 'Apply' || q.bloomsLevel === 'Analyze') && q.id !== remQ?.id) ||
                 mcqQuestions.find(q => q.id !== remQ?.id) ||
                 conceptQuestions.find(q => (q.bloomsLevel === 'Apply' || q.bloomsLevel === 'Analyze') && q.id !== remQ?.id);

    const microReviewQuestions: Question[] = [];
    if (remQ) microReviewQuestions.push(remQ);
    if (appQ) microReviewQuestions.push(appQ);

    // Fallback: Ensure exactly 2 questions are always present
    if (microReviewQuestions.length < 2) {
      mcqQuestions.forEach(q => {
        if (microReviewQuestions.length < 2 && !microReviewQuestions.some(m => m.id === q.id)) {
          microReviewQuestions.push(q);
        }
      });
    }
    if (microReviewQuestions.length < 2) {
      conceptQuestions.forEach(q => {
        if (microReviewQuestions.length < 2 && !microReviewQuestions.some(m => m.id === q.id)) {
          microReviewQuestions.push(q);
        }
      });
    }
    if (microReviewQuestions.length < 2 && questions.length >= 2) {
      const allMcqs = questions.filter(q => Array.isArray(q.options) && q.options.length > 0);
      allMcqs.forEach(q => {
        if (microReviewQuestions.length < 2 && !microReviewQuestions.some(m => m.id === q.id)) {
          microReviewQuestions.push(q);
        }
      });
    }

    const primaryMisconception = conceptMastery?.recentErrorTypes?.[0] || 'conceptual_misunderstanding';

    // Tailored pedagogical feedback
    let feedback = `Your mastery in ${conceptName} is currently ${Math.round(pMastery * 100)}% (${status}). `;
    if (primaryMisconception === 'conceptual_misunderstanding') {
      feedback += 'Your past responses indicate a core conceptual misunderstanding rather than simple arithmetic. Revisit the visual intuition and definitions below before attempting more tests.';
    } else if (primaryMisconception === 'wrong_formula') {
      feedback += 'You have frequently applied an incorrect formula or sign convention. Review the mathematical derivation and boundary constraints.';
    } else if (primaryMisconception === 'careless_slip') {
      feedback += 'You grasp the main idea well, but minor calculation slips are lowering your test precision. Take extra care verifying step-by-step operations.';
    } else {
      feedback += 'Review the recommended curriculum below to advance your understanding from basic recall to analytical mastery.';
    }

    // Recommended learning sequence
    const recommendedLearningOrder = [
      `1. Conceptual Foundations & Terminology in ${conceptName}`,
      `2. Step-by-Step Worked Example Walkthrough`,
      `3. Visualizing Edge Cases and Invariants`,
      `4. Low-Stakes 2-Question Micro-Review`,
      `5. Adaptive Diagnostic Practice Test`,
    ];

    const sampleQ = questions.find(q => q.conceptId === conceptId);
    const subject = sampleQ?.subject || 'Computer Science';

    return {
      studentId,
      conceptId,
      conceptName,
      subject,
      pMastery,
      status,
      needsRemediation: pMastery < 0.65,
      teacherAlert: pMastery < 0.40,
      primaryMisconception,
      feedback,
      recommendedResources: readingResources.length > 0 ? readingResources : matchedResources,
      youtubeRecommendations: finalYoutube,
      microReviewQuestions,
      recommendedLearningOrder,
    };
  }

  /**
   * Retrieves all concept remediation plans for a student
   */
  static getAllRemediationPlans(studentId: string): RemediationPlan[] {
    const questions = storageService.getQuestions();
    const uniqueConcepts = Array.from(new Set(questions.map(q => q.conceptId)));
    return uniqueConcepts.map(cId => this.getRemediationPlan(studentId, cId));
  }

  /**
   * Retrieves all concepts needing urgent remediation for a student
   */
  static getStudentRemediationNeeds(studentId: string): RemediationPlan[] {
    const plans = this.getAllRemediationPlans(studentId);
    const weak = plans.filter(p => p.needsRemediation).sort((a, b) => a.pMastery - b.pMastery);
    return weak.length > 0 ? weak : plans.slice(0, 3);
  }
}
