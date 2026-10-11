/**
 * Backend API Client & Persistent Database Connector
 * 
 * Provides network interface to the Express backend database with Bearer session auth,
 * role-based permission headers, and resilient fallback handling.
 */

import { ExamAttempt, ConceptMastery, TeacherReview, Exam, Question } from '../types';

class ApiClient {
  private token: string | null = null;
  private isBackendOnline: boolean = true;

  constructor() {
    this.token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('aak_exam_session_token') || 'demo_teacher_token' : 'demo_teacher_token';
  }

  setToken(token: string): void {
    this.token = token;
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('aak_exam_session_token', token);
      }
    } catch (e) {
      // Ignore if sessionStorage restricted
    }
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    try {
      sessionStorage.removeItem('aak_exam_session_token');
    } catch (e) {
      // Ignore
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      this.isBackendOnline = res.ok;
      return res.ok;
    } catch {
      this.isBackendOnline = false;
      return false;
    }
  }

  async fetchBackendState(): Promise<any | null> {
    try {
      const res = await fetch('/api/state', {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        console.warn('[ApiClient] Failed to fetch state from backend:', res.statusText);
        return null;
      }
      const data = await res.json();
      return data.state;
    } catch (err) {
      console.warn('[ApiClient] Backend server unreachable, using local persistence:', err);
      return null;
    }
  }

  async syncFullState(state: any): Promise<boolean> {
    try {
      const res = await fetch('/api/state/sync', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(state),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async submitExamAttempt(attempt: ExamAttempt): Promise<boolean> {
    try {
      const res = await fetch('/api/exams/attempts', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(attempt),
      });
      return res.ok;
    } catch (err) {
      console.warn('[ApiClient] Failed to persist exam attempt to backend:', err);
      return false;
    }
  }

  async updateMastery(mastery: ConceptMastery): Promise<boolean> {
    try {
      const res = await fetch('/api/mastery/update', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(mastery),
      });
      return res.ok;
    } catch (err) {
      console.warn('[ApiClient] Failed to persist mastery to backend:', err);
      return false;
    }
  }

  async submitTeacherApproval(reviewData: {
    id?: string;
    attemptId?: string;
    questionId: string;
    studentId?: string;
    studentName?: string;
    questionText?: string;
    studentAnswerText?: string;
    aiSuggestedScore: number;
    teacherApprovedScore: number;
    maxScore: number;
    status: 'approved' | 'modified' | 'pending_teacher_review' | string;
    feedbackNotes?: string;
  }): Promise<{ success: boolean; review?: TeacherReview; error?: string }> {
    try {
      const res = await fetch('/api/teacher/approve-grade', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(reviewData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Server rejected grade approval.' };
      }
      return { success: true, review: data.review };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async gradeSubmission(
    question: Question,
    studentAnswer: string
  ): Promise<any | null> {
    try {
      const res = await fetch('/api/ai/grade-submission', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ question, studentAnswer }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    } catch {
      return null;
    }
  }

  async importTeacherGradingRecords(records: any[]): Promise<{
    success: boolean;
    importedCount?: number;
    totalRecords?: number;
    error?: string;
    details?: string[];
  }> {
    try {
      const res = await fetch('/api/teacher/grading-records/import', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Import failed.', details: data.details };
      }
      return {
        success: true,
        importedCount: data.importedCount,
        totalRecords: data.totalRecords,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  async publishExam(exam: Exam): Promise<boolean> {
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(exam),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();
