/**
 * Persistent Storage & Database Layer
 * 
 * Manages normalized entities, backend database synchronization, local caching,
 * teacher review persistence, and initializes seed records with 25-concept mastery mapping.
 */

import {
  User,
  Question,
  LearningResource,
  TeacherGradingRecord,
  RewardCoupon,
  Achievement,
  Exam,
  ExamAttempt,
  ConceptMastery,
  AuditLog,
  StudentRewardProfile,
  TeacherReview,
} from '../types';

import {
  SEED_USERS,
  SEED_QUESTIONS,
  SEED_RESOURCES,
  SEED_COUPONS,
  SEED_ACHIEVEMENTS,
  SEED_EXAMS,
  SEED_TEACHER_REVIEWS,
  SEED_EXAM_ATTEMPTS,
  generateSeedTeacherGradingRecords,
} from '../data/seedData';

import { CONCEPTS_CATALOG } from '../data/conceptsData';
import { randomForestService } from '../ai/randomForestModel';
import { BKTEngine } from '../ai/bktEngine';
import { apiClient } from './apiClient';

export interface AppState {
  users: User[];
  questions: Question[];
  resources: LearningResource[];
  teacherGradingRecords: TeacherGradingRecord[];
  teacherReviews: TeacherReview[];
  coupons: RewardCoupon[];
  achievements: Achievement[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  masteryRecords: Record<string, Record<string, ConceptMastery>>; // [studentId][conceptId] => ConceptMastery
  rewardProfiles: Record<string, StudentRewardProfile>; // [studentId] => StudentRewardProfile
  auditLogs: AuditLog[];
  lastModelTrainingTime?: string;
}

const LEGACY_STORAGE_KEY = 'ai_intelligent_exam_system_v2_state';
const MIGRATION_FLAG_KEY = 'aak_exam_db_migrated';
const PREFERENCES_KEY = 'aak_exam_ui_preferences';

class StorageService {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
    this.ensureInitialized();
    // Asynchronously synchronize with persistent backend database
    this.fetchFromBackend();
  }

  private loadState(): AppState {
    const initialState = this.getInitialState();
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            const merged: AppState = {
              ...initialState,
              ...parsed,
            };
            // Schedule safe migration to backend database
            setTimeout(() => this.migrateLegacyBrowserData(merged), 100);
            return merged;
          }
        }
      }
    } catch (e) {
      console.warn('[StorageService] Could not parse legacy browser data:', e);
    }

    return initialState;
  }

  private getInitialState(): AppState {
    const records = generateSeedTeacherGradingRecords();
    return {
      users: [...SEED_USERS],
      questions: [...SEED_QUESTIONS],
      resources: [...SEED_RESOURCES],
      teacherGradingRecords: records,
      teacherReviews: [...SEED_TEACHER_REVIEWS],
      coupons: [...SEED_COUPONS],
      achievements: [...SEED_ACHIEVEMENTS],
      exams: [...SEED_EXAMS],
      examAttempts: [...SEED_EXAM_ATTEMPTS],
      masteryRecords: {},
      rewardProfiles: {},
      auditLogs: [
        {
          id: 'log_init',
          timestamp: new Date().toISOString(),
          userId: 'system',
          userRole: 'admin',
          action: 'SYSTEM_INITIALIZED',
          details: 'Seeded initial question bank, teacher grading dataset, and demo users.',
        },
      ],
    };
  }

  /**
   * Safe migration process:
   * 1. Transfers legacy browser data to persistent backend database.
   * 2. Verifies backend confirmation before removing sensitive records from localStorage.
   * 3. Retains non-sensitive preferences only in browser storage.
   */
  private async migrateLegacyBrowserData(legacyState: AppState): Promise<void> {
    try {
      const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
      if (alreadyMigrated) {
        // Verified previously; safely remove sensitive personal records and exam attempts from localStorage
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return;
      }

      console.info('[StorageService] Initiating verified migration to backend database...');
      const success = await apiClient.syncFullState(legacyState);
      if (success) {
        localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
          migratedAt: new Date().toISOString(),
          databaseEngine: 'Node.js/Express (/data/aak_exam_db.json)',
          theme: 'dark',
        }));
        // Safe deletion only after verified successful backend persistence
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        console.info('[StorageService] Migration verified successfully. Sensitive records removed from browser storage.');
      } else {
        console.warn('[StorageService] Migration verification pending; preserving data safely.');
      }
    } catch (err) {
      console.warn('[StorageService] Migration error, preserving existing data safely:', err);
    }
  }

  private async fetchFromBackend(): Promise<void> {
    try {
      const backendState = await apiClient.fetchBackendState();
      if (backendState && typeof backendState === 'object') {
        if (Array.isArray(backendState.users) && backendState.users.length > 0) {
          this.state.users = backendState.users;
        }
        if (Array.isArray(backendState.questions) && backendState.questions.length > 0) {
          this.state.questions = backendState.questions;
        }
        if (Array.isArray(backendState.teacherReviews)) {
          this.state.teacherReviews = backendState.teacherReviews;
        }
        if (Array.isArray(backendState.teacherGradingRecords) && backendState.teacherGradingRecords.length > 0) {
          this.state.teacherGradingRecords = backendState.teacherGradingRecords;
        }
        if (Array.isArray(backendState.exams) && backendState.exams.length > 0) {
          this.state.exams = backendState.exams;
        }
        if (Array.isArray(backendState.examAttempts)) {
          this.state.examAttempts = backendState.examAttempts;
        }
        if (backendState.masteryRecords && Object.keys(backendState.masteryRecords).length > 0) {
          this.state.masteryRecords = { ...this.state.masteryRecords, ...backendState.masteryRecords };
        }
        if (backendState.rewardProfiles && Object.keys(backendState.rewardProfiles).length > 0) {
          this.state.rewardProfiles = { ...this.state.rewardProfiles, ...backendState.rewardProfiles };
        }
        if (Array.isArray(backendState.auditLogs) && backendState.auditLogs.length > 0) {
          this.state.auditLogs = backendState.auditLogs;
        }

        // Retrain model if records updated
        if (this.state.teacherGradingRecords.length >= 5) {
          randomForestService.train(this.state.teacherGradingRecords);
        }

        this.notifyListeners();
      }
    } catch (err) {
      console.warn('[StorageService] Could not reach backend DB on boot, continuing with in-memory state.');
    }
  }

  private ensureInitialized(): void {
    // 1. Ensure user roster synchronization (Ms Annapurna as teacher)
    if (this.state.users) {
      this.state.users = this.state.users.map(u => {
        if (u.role === 'teacher' || u.id === 'usr_teacher_1') {
          return {
            ...u,
            displayName: 'Ms Annapurna',
            username: 'teacher',
            email: 'annapurna@university.edu',
            teacherId: 'TCH_ANNAPURNA',
          };
        }
        return u;
      });
      if (this.state.users.length === 0) {
        this.state.users = [...SEED_USERS];
      }
    }

    // Ensure questions are strictly unique by id and have up-to-date options
    const uniqueQuestionMap = new Map<string, Question>();
    this.state.questions.forEach(q => uniqueQuestionMap.set(q.id, q));
    SEED_QUESTIONS.forEach(q => {
      const existing = uniqueQuestionMap.get(q.id);
      if (!existing) {
        uniqueQuestionMap.set(q.id, q);
      } else if ((!existing.options || existing.options.length === 0) && q.options && q.options.length > 0) {
        uniqueQuestionMap.set(q.id, {
          ...existing,
          options: q.options,
          questionType: q.questionType,
          correctAnswer: q.correctAnswer || existing.correctAnswer,
        });
      }
    });
    this.state.questions = Array.from(uniqueQuestionMap.values());

    // Ensure all resources have valid YouTube IDs, thumbnails and types
    this.state.resources = SEED_RESOURCES.map(seedRes => {
      const existing = this.state.resources?.find(r => r.id === seedRes.id);
      if (!existing) return seedRes;
      const validYoutubeId = (!existing.youtubeVideoId || existing.youtubeVideoId === '7K1sB05pE0A')
        ? seedRes.youtubeVideoId
        : existing.youtubeVideoId;
      return {
        ...existing,
        youtubeVideoId: validYoutubeId,
        thumbnailUrl: existing.thumbnailUrl || seedRes.thumbnailUrl,
        resourceType: existing.resourceType || seedRes.resourceType,
      };
    });

    // 2. Train Random Forest model on seed grading records
    if (this.state.teacherGradingRecords.length >= 5) {
      randomForestService.train(this.state.teacherGradingRecords);
      this.state.lastModelTrainingTime = new Date().toISOString();
    }

    // 3. Initialize student mastery maps across all 25 concepts if empty
    if (Object.keys(this.state.masteryRecords).length === 0) {
      const studentProfiles = [
        { id: '24BDS0162', credits: 480, streak: 5, mathBoost: 0.10, csBoost: 0.05, aiBoost: 0.12 },
        { id: '24BCE2930', credits: 340, streak: 3, mathBoost: -0.05, csBoost: -0.10, aiBoost: 0.02 },
        { id: '24BCI0287', credits: 290, streak: 4, mathBoost: 0.05, csBoost: -0.05, aiBoost: -0.08 },
        // Fallback backward compatibility IDs
        { id: '101', credits: 480, streak: 5, mathBoost: 0.10, csBoost: 0.05, aiBoost: 0.12 },
        { id: '102', credits: 290, streak: 4, mathBoost: 0.05, csBoost: -0.05, aiBoost: -0.08 },
        { id: '103', credits: 340, streak: 3, mathBoost: -0.05, csBoost: -0.10, aiBoost: 0.02 },
      ];

      studentProfiles.forEach(sp => {
        const sid = sp.id;
        this.state.masteryRecords[sid] = {};
        this.state.rewardProfiles[sid] = {
          studentId: sid,
          totalCredits: sp.credits,
          availableCredits: sp.credits,
          lifetimeEarnedCredits: sp.credits + 150,
          currentStreakDays: sp.streak,
          lastActiveDate: new Date().toISOString(),
          achievements: [...SEED_ACHIEVEMENTS],
          redeemedCoupons: [],
        };

        // Seed mastery for all canonical concepts
        CONCEPTS_CATALOG.forEach(c => {
          let boost = 0;
          if (c.subject === 'Mathematics') boost = sp.mathBoost;
          else if (c.subject === 'Computer Science') boost = sp.csBoost;
          else if (c.subject === 'AI & Data Science') boost = sp.aiBoost;

          // Compute baseline with slight concept variance
          let baseVal = Math.min(0.95, Math.max(0.20, c.pL0 + 0.35 + boost + (Math.sin(c.id.length) * 0.10)));
          baseVal = Math.round(baseVal * 100) / 100;

          this.state.masteryRecords[sid][c.id] = {
            studentId: sid,
            conceptId: c.id,
            conceptName: c.name,
            subject: c.subject,
            pMastery: baseVal,
            status: BKTEngine.getStatus(baseVal),
            totalAttempts: 5,
            correctAttempts: Math.round(baseVal * 5),
            lastAttemptAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
            recentErrorTypes: baseVal < 0.6 ? ['conceptual_misunderstanding', 'wrong_formula'] : [],
            history: [
              { timestamp: new Date(Date.now() - 86400000 * 7).toISOString(), pMastery: Math.max(0.2, baseVal - 0.15), wasCorrect: false },
              { timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), pMastery: Math.max(0.25, baseVal - 0.08), wasCorrect: true },
              { timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), pMastery: baseVal, wasCorrect: baseVal >= 0.5 },
            ],
          };
        });
      });
    }

    this.saveState();
  }

  saveState(): void {
    try {
      // Store non-sensitive preferences only in localStorage (Requirement 6 compliant)
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
        theme: 'dark',
        lastUpdated: new Date().toISOString(),
        databasePersistence: 'active',
      }));
    } catch (e) {
      // Ignore
    }

    this.notifyListeners();

    // Persist complete application data to the backend database
    apiClient.syncFullState(this.state).catch(err => {
      console.warn('[StorageService] Backend state synchronization warning:', err);
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb());
  }

  // Getters
  getState(): AppState {
    return this.state;
  }

  getUsers(): User[] {
    return this.state.users;
  }

  getQuestions(): Question[] {
    return this.state.questions;
  }

  getResources(): LearningResource[] {
    return this.state.resources;
  }

  getTeacherGradingRecords(): TeacherGradingRecord[] {
    return this.state.teacherGradingRecords;
  }

  getTeacherReviews(): TeacherReview[] {
    return this.state.teacherReviews || [];
  }

  getExams(): Exam[] {
    return this.state.exams;
  }

  getExamAttempts(): ExamAttempt[] {
    return this.state.examAttempts;
  }

  getMasteryRecords(studentId: string): Record<string, ConceptMastery> {
    return this.state.masteryRecords[studentId] || {};
  }

  getAllMasteryRecords(): Record<string, Record<string, ConceptMastery>> {
    return this.state.masteryRecords;
  }

  getRewardProfile(studentId: string): StudentRewardProfile {
    if (!this.state.rewardProfiles[studentId]) {
      this.state.rewardProfiles[studentId] = {
        studentId,
        totalCredits: 100,
        availableCredits: 100,
        lifetimeEarnedCredits: 100,
        currentStreakDays: 1,
        lastActiveDate: new Date().toISOString(),
        achievements: [...SEED_ACHIEVEMENTS],
        redeemedCoupons: [],
      };
      this.saveState();
    }
    return this.state.rewardProfiles[studentId];
  }

  getCoupons(): RewardCoupon[] {
    return this.state.coupons;
  }

  getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  // Mutations
  addAuditLog(userId: string, userRole: User['role'], action: string, details: string, entityId?: string): void {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      action,
      details,
      entityId,
    };
    this.state.auditLogs.unshift(log);
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs.pop();
    }
    this.saveState();
  }

  addQuestion(question: Question): void {
    this.state.questions.unshift(question);
    this.saveState();
  }

  updateQuestion(question: Question): void {
    const idx = this.state.questions.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      this.state.questions[idx] = question;
      this.saveState();
    }
  }

  deleteQuestion(questionId: string): void {
    this.state.questions = this.state.questions.filter(q => q.id !== questionId);
    this.saveState();
  }

  addExam(exam: Exam): void {
    this.state.exams.unshift(exam);
    this.saveState();
  }

  updateExam(exam: Exam): void {
    const idx = this.state.exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) {
      this.state.exams[idx] = exam;
      this.saveState();
    }
  }

  addExamAttempt(attempt: ExamAttempt): void {
    this.state.examAttempts.unshift(attempt);
    apiClient.submitExamAttempt(attempt).catch(() => {});
    this.saveState();
  }

  updateStudentMastery(mastery: ConceptMastery): void {
    if (!this.state.masteryRecords[mastery.studentId]) {
      this.state.masteryRecords[mastery.studentId] = {};
    }
    this.state.masteryRecords[mastery.studentId][mastery.conceptId] = mastery;
    apiClient.updateMastery(mastery).catch(() => {});
    this.saveState();
  }

  // Teacher Approval Workflow Mutation
  saveTeacherReview(review: TeacherReview): void {
    if (!Array.isArray(this.state.teacherReviews)) {
      this.state.teacherReviews = [];
    }

    const idx = this.state.teacherReviews.findIndex(
      r => (review.id && r.id === review.id) ||
           (review.attemptId && r.attemptId === review.attemptId && r.questionId === review.questionId)
    );

    if (idx >= 0) {
      this.state.teacherReviews[idx] = review;
    } else {
      this.state.teacherReviews.unshift(review);
    }

    // If matching attempt exists, update it
    if (review.attemptId) {
      const attempt = this.state.examAttempts.find(a => a.id === review.attemptId);
      if (attempt && Array.isArray(attempt.answers)) {
        const answer = attempt.answers.find(ans => ans.questionId === review.questionId);
        if (answer) {
          answer.scoreAwarded = review.teacherApprovedScore;
          answer.teacherApprovedScore = review.teacherApprovedScore;
          answer.teacherFeedback = review.feedbackNotes;
          answer.teacherApproved = true;
          answer.reviewStatus = review.status;

          // Recalculate totalScore and percentageScore from finalized scores
          const total = attempt.answers.reduce((sum, ans) => sum + (ans.scoreAwarded || 0), 0);
          attempt.totalScore = parseFloat(total.toFixed(1));
          attempt.percentageScore = attempt.maxScore > 0 ? Math.round((attempt.totalScore / attempt.maxScore) * 100) : 0;

          // Check if all answers in the attempt have now been approved
          const allApproved = attempt.answers.every(ans => ans.teacherApproved !== false);
          if (allApproved) {
            attempt.teacherApproved = true;
            attempt.status = 'graded';
          }
        }
      }
    }

    this.addAuditLog(
      review.teacherId,
      'teacher',
      'TEACHER_GRADE_APPROVED',
      `Teacher evaluated item ${review.questionId}: status=${review.status}, final score=${review.teacherApprovedScore}/${review.maxScore}.`,
      review.id
    );

    apiClient.submitTeacherApproval({
      attemptId: review.attemptId,
      questionId: review.questionId,
      studentId: review.studentId,
      aiSuggestedScore: review.aiSuggestedScore,
      teacherApprovedScore: review.teacherApprovedScore,
      maxScore: review.maxScore,
      status: review.status,
      feedbackNotes: review.feedbackNotes,
    }).catch(() => {});

    this.saveState();
  }

  updateRewardProfile(profile: StudentRewardProfile): void {
    this.state.rewardProfiles[profile.studentId] = profile;
    this.saveState();
  }

  addGradingRecords(records: TeacherGradingRecord[]): void {
    this.state.teacherGradingRecords.push(...records);
    randomForestService.train(this.state.teacherGradingRecords);
    this.state.lastModelTrainingTime = new Date().toISOString();
    apiClient.importTeacherGradingRecords(records).catch(() => {});
    this.saveState();
  }

  retrainGradingModel(): void {
    randomForestService.train(this.state.teacherGradingRecords);
    this.state.lastModelTrainingTime = new Date().toISOString();
    this.saveState();
  }

  resetToDefaultData(): void {
    this.state = this.getInitialState();
    this.ensureInitialized();
    this.saveState();
  }
}

export const storageService = new StorageService();
