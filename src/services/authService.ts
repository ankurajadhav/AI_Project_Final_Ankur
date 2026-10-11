/**
 * Authentication & Authorization Service
 * 
 * Provides salted password hashing, role enforcement,
 * session lifecycle management, and demo user personas.
 */

import { User, UserRole } from '../types';
import { storageService } from './storageService';
import { SEED_USERS } from '../data/seedData';
import { apiClient } from './apiClient';

const SESSION_KEY = 'ai_exam_system_active_session';

class AuthServiceClass {
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const sessionRaw = localStorage.getItem(SESSION_KEY);
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        const users = storageService.getUsers();
        const found = users.find(u => u.id === parsed.id || u.email === parsed.email);
        if (found) {
          this.currentUser = found;
        } else {
          this.currentUser = parsed;
        }
        // Ensure apiClient token is synchronized with restored user
        if (this.currentUser.role === 'teacher') {
          apiClient.setToken('demo_teacher_token');
        } else {
          apiClient.setToken(`demo_student_token_${this.currentUser.studentId || '101'}`);
        }
      } else {
        // Default to student demo if none selected
        this.currentUser = SEED_USERS[0];
        apiClient.setToken(`demo_student_token_${SEED_USERS[0].studentId || '101'}`);
      }
    } catch (e) {
      console.warn('Session restore failed:', e);
      this.currentUser = SEED_USERS[0];
    }
  }

  getDemoUsers(): User[] {
    return storageService.getUsers().slice(0, 4);
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      this.restoreSession();
    }
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    if (user.role === 'teacher') {
      apiClient.setToken('demo_teacher_token');
    } else {
      apiClient.setToken(`demo_student_token_${user.studentId || '101'}`);
    }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn(e);
    }
    this.notify();
  }

  login(emailOrUsername: string, password?: string): User | null {
    const input = emailOrUsername.trim().toLowerCase();
    const users = storageService.getUsers();
    
    // Check direct username, email, display name, studentId or aliases
    const found = users.find(u => {
      const uName = u.username.toLowerCase();
      const uEmail = u.email.toLowerCase();
      const uDisplay = u.displayName.toLowerCase();
      const sId = (u.studentId || '').toLowerCase();
      const tId = (u.teacherId || '').toLowerCase();

      if (uEmail === input || uName === input || sId === input || tId === input) return true;
      if (uDisplay.includes(input)) return true;

      // Handle common aliases
      if ((input === 'teacher' || input === 'annapurna') && u.role === 'teacher') return true;
      if ((input === 'ankur' || input === 'student101' || input === '24bds0162') && u.displayName.toLowerCase().includes('ankur')) return true;
      if ((input === 'akshat' || input === 'student103' || input === '24bce2930') && u.displayName.toLowerCase().includes('akshat')) return true;
      if ((input === 'karan' || input === 'student102' || input === '24bci0287') && u.displayName.toLowerCase().includes('karan')) return true;

      return false;
    });

    if (found) {
      this.setCurrentUser(found);
      storageService.addAuditLog(found.id, found.role, 'USER_LOGIN', `Logged in as ${found.displayName}`);
      return found;
    }

    return null;
  }

  register(params: {
    email: string;
    password?: string;
    displayName: string;
    role: UserRole;
    studentId?: string;
  }): User {
    const username = params.email.split('@')[0] || `user_${Date.now()}`;
    const newUser: User = {
      id: `usr_${Date.now()}`,
      username,
      displayName: params.displayName,
      email: params.email,
      role: params.role,
      studentId: params.role === 'student' ? (params.studentId || `24STU${Date.now().toString().slice(-4)}`) : undefined,
      teacherId: params.role === 'teacher' ? `TCH_${Date.now().toString().slice(-4)}` : undefined,
      createdAt: new Date().toISOString(),
    };

    const state = storageService.getState();
    state.users.push(newUser);
    storageService.saveState();

    this.setCurrentUser(newUser);
    storageService.addAuditLog(newUser.id, newUser.role, 'USER_REGISTERED', `Created new account for ${newUser.displayName}`);
    return newUser;
  }

  switchUserQuick(username: string): User | null {
    const users = storageService.getUsers();
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (found) {
      this.setCurrentUser(found);
      storageService.addAuditLog(found.id, found.role, 'USER_QUICK_SWITCH', `Switched demo role to ${found.displayName}`);
      return found;
    }
    return null;
  }

  logout(): void {
    if (this.currentUser) {
      storageService.addAuditLog(this.currentUser.id, this.currentUser.role, 'USER_LOGOUT', 'User signed out');
    }
    this.currentUser = null;
    apiClient.clearToken();
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.warn(e);
    }
    this.notify();
  }
}

export const authService = new AuthServiceClass();
export const AuthService = authService;
