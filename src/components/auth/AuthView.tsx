/**
 * Authentication & Quick Role Switcher View
 */

import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { AuthService } from '../../services/authService';
import { Avatar } from '../common/Avatar';
import {
  GraduationCap,
  Sparkles,
  Users,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  Award,
  CheckCircle2,
  Lock,
  BookOpen,
  Cpu,
  Flame,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'register'>('student');
  const [emailOrUsername, setEmailOrUsername] = useState('ankur');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const demoUsers = AuthService.getDemoUsers();

  const handleDemoLogin = (demoUser: User) => {
    AuthService.setCurrentUser(demoUser);
    onLoginSuccess(demoUser);
  };

  const handleTabChange = (newTab: 'student' | 'teacher' | 'register') => {
    setActiveTab(newTab);
    setErrorMsg(null);
    if (newTab === 'student') {
      setEmailOrUsername('ankur');
      setPassword('student123');
      setRole('student');
    } else if (newTab === 'teacher') {
      setEmailOrUsername('teacher');
      setPassword('teacher123');
      setRole('teacher');
    } else {
      setEmailOrUsername('');
      setPassword('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'register') {
      if (!emailOrUsername || !password || !displayName) {
        setErrorMsg('Please complete all required fields.');
        return;
      }
      const newUser = AuthService.register({
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@student.edu`,
        password,
        displayName,
        role,
        studentId: studentRollNo || undefined,
      });
      onLoginSuccess(newUser);
    } else {
      const user = AuthService.login(emailOrUsername, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMsg('User not found. Use 1-click profiles below or check your username/roll number.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Left Column: Brand, Team & Fast Demo Switches */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/40 text-white">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-white tracking-tight">AAK Exam</h1>
                <p className="text-xs text-indigo-300">Adaptive Assessment & ML Mastery Engine</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Teacher-Specific Grading Pattern Learning (Random Forest) + Bayesian Knowledge Tracing (BKT) + A* Adaptive Exam Generation.
            </p>

            {/* Team Credits Banner */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800/90 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="text-indigo-400">PROJECT TEAM</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Teacher: Ms Annapurna</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded">
                  <span className="text-slate-200 font-medium">Ankur Anil Jadhav</span>
                  <span className="font-mono text-[10px] text-indigo-300">24BDS0162</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded">
                  <span className="text-slate-200 font-medium">Akshat Gupta</span>
                  <span className="font-mono text-[10px] text-indigo-300">24BCE2930</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded">
                  <span className="text-slate-200 font-medium">Karan Singh</span>
                  <span className="font-mono text-[10px] text-indigo-300">24BCI0287</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Personas */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              1-Click Demo Logins
            </span>

            <div className="space-y-2">
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleDemoLogin(u)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={u.displayName} role={u.role} size="sm" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition flex items-center gap-1.5">
                        {u.displayName}
                        {u.studentId && (
                          <span className="font-mono text-[10px] text-slate-400 font-normal">
                            ({u.studentId})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {u.role === 'student' ? 'Student · BKT Mastery & Remediation' : 'Instructor · Model & Analytics Portal'}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      u.role === 'student'
                        ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Role-Specific Login & Signup Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-5">
          {/* Role Navigation Tabs */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => handleTabChange('student')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student Portal</span>
            </button>
            <button
              onClick={() => handleTabChange('teacher')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'teacher'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Teacher Portal</span>
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Register</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'student'
                ? 'Student Sign In'
                : activeTab === 'teacher'
                ? 'Teacher / Instructor Access'
                : 'Create Academic Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'student'
                ? 'Sign in as Ankur, Akshat, or Karan to practice and remediate knowledge gaps.'
                : activeTab === 'teacher'
                ? 'Sign in as Ms Annapurna to train grading patterns, generate exams, and inspect cohort risks.'
                : 'Register a new student or instructor profile.'}
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3 text-xs text-rose-300 font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold block mb-1">Account Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="student">Student (BKT Mastery & Remediation)</option>
                    <option value="teacher">Teacher (Grading Pattern & Exam Creation)</option>
                  </select>
                </div>

                {role === 'student' && (
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Student Roll Number / ID</label>
                    <input
                      type="text"
                      value={studentRollNo}
                      onChange={e => setStudentRollNo(e.target.value)}
                      placeholder="e.g. 24BDS0999"
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="text-slate-400 font-bold block mb-1">
                {activeTab === 'register' ? 'Email or Username' : 'Username, Email, or Roll No.'}
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={e => setEmailOrUsername(e.target.value)}
                placeholder={
                  activeTab === 'teacher'
                    ? 'teacher (Ms Annapurna)'
                    : 'ankur / akshat / karan / 24BDS0162'
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-bold block">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition focus:outline-none"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide password</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      <span>Show password</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 pr-10 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition focus:outline-none rounded-lg"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${
                activeTab === 'teacher'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              <span>
                {activeTab === 'register'
                  ? 'Create Academic Account'
                  : activeTab === 'teacher'
                  ? 'Access Teacher Dashboard (Ms Annapurna)'
                  : 'Enter Student Portal'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            {activeTab === 'register' ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('student')}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Need a new student or teacher account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Register
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
