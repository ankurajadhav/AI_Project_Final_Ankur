/**
 * Report Generation & Data Export Service
 */

import { storageService } from './storageService';
import { MasteryService } from './masteryService';

export class ReportService {
  /**
   * Generates a CSV string of class-wide student performance and mastery
   */
  static generateClassPerformanceCSV(): string {
    const students = storageService.getUsers().filter(u => u.role === 'student');
    const attempts = storageService.getExamAttempts();

    const headers = [
      'Student ID',
      'Student Name',
      'Email',
      'Risk Level',
      'Average Mastery %',
      'Recent Test Avg %',
      'Total Tests Taken',
      'Credits Earned',
      'Critical Concepts',
      'Primary Flag Reason',
    ];

    const rows = students.map(s => {
      const sid = s.studentId || s.id;
      const risk = MasteryService.getStudentRiskSummary(sid, s.displayName);
      const studentAttempts = attempts.filter(a => a.studentId === sid);
      const reward = storageService.getRewardProfile(sid);

      return [
        `"${sid}"`,
        `"${s.displayName}"`,
        `"${s.email}"`,
        `"${risk.riskLevel}"`,
        `${Math.round(risk.averageMastery * 100)}`,
        `${risk.recentTestAverage}`,
        `${studentAttempts.length}`,
        `${reward.availableCredits}`,
        `"${risk.criticalConcepts.join(', ') || 'None'}"`,
        `"${risk.reason.replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Generates a CSV export of the live Question Bank with Bloom's Taxonomy & Difficulty
   */
  static generateQuestionBankCSV(): string {
    const questions = storageService.getQuestions();
    const headers = [
      'Question ID',
      'Subject',
      'Topic',
      'Subtopic',
      'Concept ID',
      'Bloom Level',
      'Difficulty Score',
      'Marks',
      'Question Type',
      'Question Text',
      'Correct Answer',
      'Source',
      'Status',
    ];

    const rows = questions.map(q => [
      `"${q.id}"`,
      `"${q.subject}"`,
      `"${q.topic}"`,
      `"${q.subtopic}"`,
      `"${q.conceptId}"`,
      `"${q.bloomsLevel}"`,
      `${q.difficultyScore}`,
      `${q.marks}`,
      `"${q.questionType}"`,
      `"${q.questionText.replace(/"/g, '""')}"`,
      `"${String(q.correctAnswer).replace(/"/g, '""')}"`,
      `"${q.source}"`,
      `"${q.status}"`,
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Helper to trigger browser download of CSV string
   */
  static downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
