/**
 * Global Type Definitions for AAK Exam System
 */

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: UserRole;
  studentId?: string;
  classId?: string;
  teacherId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type BloomsLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export type QuestionType = 'mcq' | 'descriptive' | 'short_answer' | 'code_question' | 'true_false' | 'numerical';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  conceptId: string;
  questionText: string;
  questionType: QuestionType;
  options?: QuestionOption[];
  correctAnswer: string;
  sampleAnswer?: string;
  gradingRubric?: string;
  explanation?: string;
  marks: number;
  difficultyScore: number;
  bloomsLevel: BloomsLevel;
  prerequisites?: string[];
  keyPhrases?: string[];
  rubricKeywords?: string[];
  tags?: string[];
  estimatedMinutes?: number;
  source?: string;
  status?: 'active' | 'archived' | 'draft';
  createdAt?: string;
  misconceptionMapping?: any;
}

export interface ConceptDefinition {
  id: string;
  name: string;
  subject: string;
  description: string;
  prerequisites: string[];
  pL0: number; // Prior mastery
  pT: number;  // Transition probability
  pG: number;  // Guess probability
  pS: number;  // Slip probability
}

export type MasteryStatus = 'Mastered' | 'In Progress' | 'Developing' | 'Weak' | 'Strong' | 'Critical';

export interface ConceptMasteryHistoryItem {
  timestamp: string;
  pL?: number;
  pMastery?: number;
  correct?: boolean;
  wasCorrect?: boolean;
}

export interface ConceptMastery {
  studentId?: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  pL?: number;
  pMastery: number;
  status: MasteryStatus;
  totalOpportunities?: number;
  correctCount?: number;
  totalAttempts?: number;
  correctAttempts?: number;
  lastUpdated?: string;
  lastAttemptAt?: string;
  recentErrorTypes?: string[];
  history?: ConceptMasteryHistoryItem[];
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  passPercentage?: number;
  questionIds: string[];
  classId?: string;
  createdBy?: string;
  approvedBy?: string;
  status?: 'published' | 'draft' | 'archived';
  createdAt?: string;
  bloomsDistribution?: Record<BloomsLevel, number>;
  topicDistribution?: Record<string, number>;
  topics?: string[];
  examType?: 'practice' | 'formal' | 'adaptive' | 'diagnostic' | 'teacher_formal' | 'adaptive_hybrid' | string;
  targetStudentId?: string;
  difficultyRating?: number | string;
  targetClassId?: string;
  scheduledAt?: string;
}

export interface StudentAnswer {
  questionId: string;
  answerText?: string | string[];
  givenAnswer?: string | string[];
  selectedOptionId?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
  scoreAwarded?: number;
  maxMarks?: number;
  maxScore?: number;
  teacherGraded?: boolean;
  teacherMarks?: number;
  teacherApprovedScore?: number;
  teacherFeedback?: string;
  teacherApproved?: boolean;
  reviewStatus?: string;
  suggestedMarks?: number;
  suggestedFeedback?: string;
  aiSuggestedScore?: number;
  aiExplanation?: string;
  keyPhraseMatches?: string[];
  misconceptionIdentified?: string;
  bloomsLevel?: BloomsLevel;
  timeSpentSeconds?: number;
  detectedErrorType?: string;
  isFlaggedForReview?: boolean;
}

export interface TopicPerformance {
  total: number;
  correct: number;
  percentage: number;
  conceptId?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName?: string;
  startTime?: string;
  startedAt?: string;
  submitTime?: string;
  submittedAt?: string;
  answers: Record<string, StudentAnswer> | any[] | any;
  totalScore: number;
  maxScore: number;
  percentage?: number;
  percentageScore?: number;
  accuracy?: number;
  timeTakenMinutes?: number;
  strengths?: string[];
  status: 'in-progress' | 'submitted' | 'graded';
  teacherApproved?: boolean;
  conceptMasteryChanges?: Record<string, { before: number; after: number }>;
  topicPerformance?: Record<string, TopicPerformance>;
  topicBreakdown?: Record<string, TopicPerformance>;
  bloomsPerformance?: Record<string, TopicPerformance>;
  weakTopics?: string[];
  recommendedNextSteps?: string[];
  aiDiagnostics?: string;
  creditsEarned?: number;
  isAiGraded?: boolean;
}

export interface TeacherReview {
  id: string;
  submissionId?: string;
  attemptId?: string;
  studentId: string;
  studentName?: string;
  questionId: string;
  questionText?: string;
  examId?: string;
  studentAnswerText: string;
  correctAnswerText?: string;
  suggestedMarks?: number;
  suggestedFeedback?: string;
  aiSuggestedScore?: number;
  teacherMarks?: number;
  teacherApprovedScore?: number;
  maxScore?: number;
  teacherFeedback?: string;
  feedbackNotes?: string;
  teacherId?: string;
  isApproved?: boolean;
  rubricCriteria?: string;
  status: 'approved' | 'modified' | 'pending' | 'pending_teacher_review' | string;
  reviewedAt: string;
}

export interface TeacherGradingRecord {
  id: string;
  questionId?: string;
  studentId?: string;
  answerText?: string;
  lengthChars?: number;
  keyPhraseCoverage?: number;
  semanticSimilarity?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  structureScore?: number;
  teacherScore?: number;
  maxScore?: number;
  normalizedTeacherScore?: number;
  bloomsLevel?: BloomsLevel;
  teacherFeedback?: string;
  gradedAt?: string;
  correctness?: number;
  presentationScore?: number;
  effortWeight?: number;
  explanationDepth?: number;
  keywordDensity?: number;
  questionDifficulty?: number;
  teacherGrade?: number;
  questionType?: string;
  timestamp?: string;
}

export interface RewardCoupon {
  id: string;
  title: string;
  description?: string;
  costPoints?: number;
  costCredits?: number;
  partner?: string;
  valueINR?: number;
  discountPercent?: number;
  category?: string;
  code?: string;
  isRedeemed?: boolean;
  redeemedAt?: string;
  redeemedBy?: string;
  expiryDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  pointsReward?: number;
  creditsReward?: number;
  unlocked?: boolean;
  isUnlocked?: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
}

export interface StudentRewardProfile {
  studentId: string;
  totalPoints?: number;
  totalCredits?: number;
  availableCredits?: number;
  lifetimeEarnedCredits?: number;
  currentStreakDays: number;
  longestStreakDays?: number;
  examsCompleted?: number;
  masteredConceptsCount?: number;
  lastActiveDate?: string;
  redeemedCouponIds?: string[];
  redeemedCoupons?: RewardCoupon[];
  unlockedAchievementIds?: string[];
  achievements?: Achievement[];
}

export type ErrorCategory =
  | 'Conceptual'
  | 'Procedural'
  | 'Factual'
  | 'Careless'
  | 'none'
  | 'misconception'
  | 'calculation'
  | 'conceptual_misunderstanding'
  | 'wrong_formula'
  | 'incomplete_logic'
  | 'careless_slip'
  | 'terminology_confusion'
  | 'prerequisite_gap'
  | string;

export interface MisconceptionItem {
  id: string;
  conceptId: string;
  conceptName: string;
  subject: string;
  errorCategory?: ErrorCategory;
  name?: string;
  description?: string;
  representativeIncorrectAnswer?: string;
  correctExplanation?: string;
  example?: string;
  correctiveFeedback?: string;
  relatedQuestionIds?: string[];
  misconceptionPattern?: string;
  triggerCondition?: string;
  remedy?: string;
  exampleQuestion?: string;
  incorrectAnswer?: string;
  correctiveExplanation?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  subject?: string;
  conceptId: string;
  conceptName?: string;
  type?: 'video' | 'article' | 'practice' | 'youtube' | 'worked_example';
  resourceType?: 'video' | 'article' | 'practice' | 'youtube' | 'worked_example';
  url: string;
  durationMinutes?: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  channelName?: string;
  prerequisites?: string[];
}

export interface StudentRiskSummary {
  studentId: string;
  studentName: string;
  email?: string;
  classId?: string;
  overallMastery?: number;
  averageMastery?: number;
  recentTestAverage?: number;
  weakConceptsCount?: number;
  weakConceptNames?: string[];
  criticalConcepts?: string[];
  reason?: string;
  riskLevel: 'High' | 'Medium' | 'Low' | 'On Track' | 'Needs Attention' | 'Intervention Recommended';
  lastExamScore?: number;
  attendanceRate?: number;
  trend?: 'Improving' | 'Stable' | 'Declining' | string;
  frequentMisconceptions?: string[];
  unattemptedExamsCount?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userRole?: string;
  timestamp: string;
  details?: string;
  entityId?: string;
  metadata?: any;
}

export interface RFModelMetrics {
  nEstimators?: number;
  numTrees?: number;
  maxDepth?: number;
  numSamples?: number;
  trainingSamples?: number;
  testSamples?: number;
  mae?: number;
  rmse?: number;
  meanAbsoluteError?: number;
  rootMeanSquaredError?: number;
  r2Score?: number;
  cvScore?: number;
  isTrained?: boolean;
  featureImportances: any;
  trainedAt?: string;
  lastTrainedAt?: string;
  datasetSource?: string;
  genuineDataStatus?: string;
  evaluationTestSamples?: any[];
}

export interface EvaluationComparisonRecord {
  id?: string;
  recordId?: string;
  questionId: string;
  studentAnswerSnippet?: string;
  keyPhraseCoverage?: number;
  lengthChars?: number;
  suggestedScore?: number;
  aiSuggestedScore?: number;
  teacherScore?: number;
  teacherReferenceScore?: number;
  absoluteError?: number;
  scoreDifference?: number;
  withinTolerance?: boolean;
  bloomsLevel?: BloomsLevel;
  errorCategory?: string;
  evaluationStatus?: string;
  topic?: string;
  maxMarks?: number;
}

export interface RemediationPlan {
  studentId?: string;
  conceptId: string;
  conceptName: string;
  subject?: string;
  currentMastery?: number;
  targetMastery?: number;
  recommendedQuestions?: Question[];
  resources?: LearningResource[];
  recommendedResources?: LearningResource[];
  priority?: 'Urgent' | 'High' | 'Medium';
  needsRemediation?: boolean;
  pMastery?: number;
  status?: string;
  microReviewQuestions?: any[];
  primaryMisconception?: any;
  feedback?: string;
  recommendedLearningOrder?: string[];
  youtubeRecommendations?: any[];
  teacherAlert?: boolean | string;
}
