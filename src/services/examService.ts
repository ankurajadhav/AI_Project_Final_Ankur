/**
 * Exam Lifecycle, Submission & Auto-Grading Service
 */

import {
  Exam,
  ExamAttempt,
  StudentAnswer,
  Question,
  ErrorCategory,
} from '../types';

import { storageService } from './storageService';
import { BKTEngine } from '../ai/bktEngine';
import { MisconceptionClassifier } from '../ai/misconceptionClassifier';
import { TeacherGradingAssistant } from '../ai/teacherGradingAssistant';
import { RewardService } from './rewardService';

export class ExamService {
  /**
   * Evaluates and grades a completed exam attempt
   */
  static submitExamAttempt(
    examId: string,
    studentId: string,
    studentName: string,
    rawAnswers: Record<string, string | string[]>,
    timeTakenMinutes: number
  ): ExamAttempt {
    const exam = storageService.getExams().find(e => e.id === examId);
    const allQuestions = storageService.getQuestions();
    const examQuestions = allQuestions.filter(q => exam?.questionIds.includes(q.id));

    let totalScoreAwarded = 0;
    let maxTotalScore = 0;
    let correctCount = 0;
    let hasPendingDescriptiveReview = false;
    const attemptId = `attempt_${Date.now()}_${studentId}`;

    const evaluatedAnswers: StudentAnswer[] = [];
    const topicStats: Record<string, { correct: number; total: number; conceptId: string }> = {};

    examQuestions.forEach(q => {
      const given = rawAnswers[q.id] || '';
      maxTotalScore += q.marks;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0, conceptId: q.conceptId };
      }
      topicStats[q.topic].total += 1;

      let isCorrect = false;
      let scoreAwarded = 0;
      let aiSuggestedScore: number | undefined;
      let detectedErrorType: ErrorCategory = 'none';
      let aiExplanation = '';

      if (q.questionType === 'mcq' || q.questionType === 'true_false' || q.questionType === 'numerical') {
        const correctStr = String(q.correctAnswer).trim().toLowerCase();
        const givenStr = String(given).trim().toLowerCase();

        isCorrect = givenStr === correctStr;
        if (isCorrect) {
          scoreAwarded = q.marks;
          correctCount += 1;
          topicStats[q.topic].correct += 1;
          aiExplanation = 'Correct! ' + q.explanation;
        } else {
          scoreAwarded = 0;
          const diagnosis = MisconceptionClassifier.diagnose(q, given);
          detectedErrorType = diagnosis.errorType;
          aiExplanation = `${diagnosis.problemSummary}. ${diagnosis.detailedAnalysis} Remedy: ${diagnosis.targetedRemedy}`;
        }
      } else {
        // Descriptive / Short Answer / Code Question - Evaluate with TeacherGradingAssistant
        const evalResult = TeacherGradingAssistant.evaluateSubmission(q, String(given));
        aiSuggestedScore = evalResult.suggestedScore;
        // Do not finalize mark before required teacher approval
        scoreAwarded = 0;
        isCorrect = false;
        hasPendingDescriptiveReview = true;
        aiExplanation = `AI Suggested Score: ${aiSuggestedScore}/${q.marks} (Awaiting Teacher Review). ${evalResult.detailedRationale}`;

        // Save pending teacher review record
        storageService.saveTeacherReview({
          id: `rev_pending_${Date.now()}_${q.id}`,
          attemptId,
          questionId: q.id,
          studentId,
          studentName,
          questionText: q.questionText,
          studentAnswerText: String(given),
          aiSuggestedScore,
          teacherApprovedScore: aiSuggestedScore,
          maxScore: q.marks,
          status: 'pending_teacher_review',
          rubricCriteria: (q.rubricKeywords || []).join(', '),
          teacherId: 'usr_teacher_1',
          reviewedAt: new Date().toISOString(),
        });
      }

      totalScoreAwarded += scoreAwarded;

      evaluatedAnswers.push({
        questionId: q.id,
        givenAnswer: given,
        isCorrect,
        scoreAwarded,
        aiSuggestedScore,
        maxScore: q.marks,
        timeSpentSeconds: Math.round((timeTakenMinutes * 60) / examQuestions.length),
        detectedErrorType,
        aiExplanation,
        isFlaggedForReview: aiSuggestedScore !== undefined,
        teacherApproved: aiSuggestedScore === undefined,
        reviewStatus: aiSuggestedScore !== undefined ? 'pending_teacher_review' : 'approved',
      });

      // Update Bayesian Knowledge Tracing Mastery state for student
      const currentMastery = storageService.getMasteryRecords(studentId)[q.conceptId];
      const updatedMastery = BKTEngine.processResponse(
        currentMastery,
        studentId,
        q.conceptId,
        q.topic,
        q.subject,
        isCorrect,
        detectedErrorType
      );
      storageService.updateStudentMastery(updatedMastery);
    });

    const percentageScore = maxTotalScore > 0 ? Math.round((totalScoreAwarded / maxTotalScore) * 100) : 0;
    const accuracy = examQuestions.length > 0 ? Math.round((correctCount / examQuestions.length) * 100) : 0;

    // Calculate strengths and weak topics
    const strengths: string[] = [];
    const weakTopics: string[] = [];
    const topicBreakdown: ExamAttempt['topicBreakdown'] = {};

    Object.entries(topicStats).forEach(([tName, s]) => {
      const p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      topicBreakdown[tName] = {
        correct: s.correct,
        total: s.total,
        percentage: p,
        conceptId: s.conceptId,
      };

      if (p >= 70) strengths.push(tName);
      else weakTopics.push(tName);
    });

    // Generate human-readable AI diagnostic narrative
    let aiDiagnostics = `You scored ${percentageScore}% (${totalScoreAwarded}/${maxTotalScore} marks) with ${accuracy}% accuracy in ${Math.round(timeTakenMinutes)} mins. `;
    if (strengths.length > 0) {
      aiDiagnostics += `Strong performance demonstrated in ${strengths.join(', ')}. `;
    }
    if (weakTopics.length > 0) {
      aiDiagnostics += `Targeted focus needed on ${weakTopics.join(', ')} due to recurring conceptual and formula slips. Recommended video lessons and micro-reviews have been added to your Remediation Hub.`;
    } else {
      aiDiagnostics += 'Excellent overall mastery across all assessed topic dimensions!';
    }

    // Award Credits
    let creditsEarned = 20; // Base completion
    if (percentageScore >= 80) creditsEarned += 30; // High score bonus
    else if (percentageScore >= 60) creditsEarned += 15;

    RewardService.awardCredits(studentId, creditsEarned, `Completed Exam: ${exam?.title || 'Assessment'}`);

    const attempt: ExamAttempt = {
      id: attemptId,
      examId,
      studentId,
      studentName,
      startedAt: new Date(Date.now() - timeTakenMinutes * 60000).toISOString(),
      submittedAt: new Date().toISOString(),
      status: hasPendingDescriptiveReview ? 'submitted' : 'graded',
      answers: evaluatedAnswers,
      totalScore: parseFloat(totalScoreAwarded.toFixed(1)),
      maxScore: maxTotalScore,
      percentageScore,
      accuracy,
      timeTakenMinutes: Math.round(timeTakenMinutes * 10) / 10,
      topicBreakdown,
      strengths,
      weakTopics,
      aiDiagnostics,
      creditsEarned,
      isAiGraded: true,
      teacherApproved: !hasPendingDescriptiveReview,
    };

    storageService.addExamAttempt(attempt);
    storageService.addAuditLog(
      studentId,
      'student',
      'EXAM_SUBMITTED',
      `Submitted exam ${exam?.title || examId} with score ${percentageScore}%.`,
      attempt.id
    );

    return attempt;
  }
}
