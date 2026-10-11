/**
 * Student Knowledge Mastery & Risk Analysis Service
 */

import { ConceptMastery, StudentRiskSummary, MasteryStatus } from '../types';
import { storageService } from './storageService';
import { BKTEngine } from '../ai/bktEngine';

export class MasteryService {
  /**
   * Retrieves mastery map for a student, ensuring all available concepts have an entry
   */
  static getStudentMasteryMap(studentId: string): Record<string, ConceptMastery> {
    const raw = storageService.getMasteryRecords(studentId);
    const questions = storageService.getQuestions();
    
    // Ensure all question concepts exist
    const allConcepts = Array.from(new Set(questions.map(q => ({ id: q.conceptId, name: q.topic, subject: q.subject }))));
    
    allConcepts.forEach(c => {
      if (!raw[c.id]) {
        raw[c.id] = {
          studentId,
          conceptId: c.id,
          conceptName: c.name,
          subject: c.subject,
          pMastery: 0.50,
          status: BKTEngine.getStatus(0.50),
          totalAttempts: 0,
          correctAttempts: 0,
          recentErrorTypes: [],
          history: [],
        };
      }
    });

    return raw;
  }

  static getAverageMastery(studentId: string): number {
    const map = this.getStudentMasteryMap(studentId);
    const values = Object.values(map);
    if (values.length === 0) return 0.50;
    const sum = values.reduce((acc, curr) => acc + curr.pMastery, 0);
    return parseFloat((sum / values.length).toFixed(2));
  }

  static getStudentRiskSummary(studentId: string, studentName: string): StudentRiskSummary {
    const masteryMap = this.getStudentMasteryMap(studentId);
    const avgMastery = this.getAverageMastery(studentId);
    const attempts = storageService.getExamAttempts().filter(a => a.studentId === studentId);

    const recentTestScores = attempts.slice(0, 3).map(a => a.percentageScore);
    const recentAvg = recentTestScores.length > 0
      ? recentTestScores.reduce((a, b) => a + b, 0) / recentTestScores.length
      : avgMastery * 100;

    let trend: 'improving' | 'steady' | 'declining' = 'steady';
    if (recentTestScores.length >= 2) {
      if (recentTestScores[0] > recentTestScores[1] + 5) trend = 'improving';
      else if (recentTestScores[0] < recentTestScores[1] - 5) trend = 'declining';
    }

    const criticalConcepts: string[] = [];
    const weakConcepts: string[] = [];

    Object.values(masteryMap).forEach(m => {
      if (m.status === 'Critical') criticalConcepts.push(m.conceptName);
      else if (m.status === 'Weak') weakConcepts.push(m.conceptName);
    });

    let riskLevel: 'On Track' | 'Needs Attention' | 'Intervention Recommended' = 'On Track';
    let reason = 'Student demonstrates stable knowledge across assessed topics.';

    if (criticalConcepts.length >= 2 || avgMastery < 0.40 || (trend === 'declining' && avgMastery < 0.50)) {
      riskLevel = 'Intervention Recommended';
      reason = `Critical mastery deficit (<40%) in ${criticalConcepts.slice(0, 2).join(', ')} combined with declining attempt accuracy.`;
    } else if (criticalConcepts.length === 1 || weakConcepts.length >= 2 || avgMastery < 0.60) {
      riskLevel = 'Needs Attention';
      reason = `Mastery gaps flagged in ${[...criticalConcepts, ...weakConcepts].slice(0, 2).join(', ')}. Targeted micro-review recommended.`;
    }

    const unattempted = storageService.getExams().filter(e => 
      e.status === 'published' && !attempts.some(a => a.examId === e.id)
    ).length;

    return {
      studentId,
      studentName,
      riskLevel,
      averageMastery: avgMastery,
      recentTestAverage: Math.round(recentAvg),
      trend,
      criticalConcepts: [...criticalConcepts, ...weakConcepts],
      frequentMisconceptions: ['conceptual_misunderstanding', 'wrong_formula'],
      unattemptedExamsCount: unattempted,
      reason,
    };
  }

  static getClassroomMasteryHeatmap(): {
    students: { id: string; name: string; avgMastery: number; risk: string }[];
    topics: { id: string; name: string; subject: string; classAvg: number }[];
    grid: { studentId: string; conceptId: string; pMastery: number; status: MasteryStatus }[];
  } {
    const users = storageService.getUsers().filter(u => u.role === 'student');
    const questions = storageService.getQuestions();
    const topicsMap = new Map<string, { id: string; name: string; subject: string; sum: number; count: number }>();

    questions.forEach(q => {
      if (!topicsMap.has(q.conceptId)) {
        topicsMap.set(q.conceptId, { id: q.conceptId, name: q.topic, subject: q.subject || 'Computer Science', sum: 0, count: 0 });
      }
    });

    const students: { id: string; name: string; avgMastery: number; risk: string }[] = [];
    const grid: { studentId: string; conceptId: string; pMastery: number; status: MasteryStatus }[] = [];

    users.forEach(u => {
      const sid = u.studentId || u.id;
      const mMap = this.getStudentMasteryMap(sid);
      const risk = this.getStudentRiskSummary(sid, u.displayName);
      students.push({
        id: sid,
        name: u.displayName,
        avgMastery: risk.averageMastery,
        risk: risk.riskLevel,
      });

      topicsMap.forEach((tData, cId) => {
        const entry = mMap[cId] || { pMastery: 0.5, status: 'Developing' };
        tData.sum += entry.pMastery;
        tData.count += 1;
        grid.push({
          studentId: sid,
          conceptId: cId,
          pMastery: entry.pMastery,
          status: entry.status,
        });
      });
    });

    const topics: { id: string; name: string; subject: string; classAvg: number }[] = [];
    topicsMap.forEach((t) => {
      topics.push({
        id: t.id,
        name: t.name,
        subject: t.subject,
        classAvg: parseFloat((t.sum / (t.count || 1)).toFixed(2)),
      });
    });

    return { students, topics, grid };
  }
}
