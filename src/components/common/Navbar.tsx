/**
 * Common Navigation Bar Component
 */

import React, { useState } from 'react';
import { User } from '../../types';
import { authService } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { Avatar } from './Avatar';
import {
  Sparkles,
  LogOut,
  Bell,
  Award,
  BookOpen,
  GraduationCap,
  RefreshCw,
  ChevronDown,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeView?: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onSwitchRole?: (user: User) => void;
  onToggleSidebar?: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeView,
  onNavigate,
  onLogout,
  onSwitchRole,
  onToggleSidebar,
  onOpenLogin,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const rewardProfile = user?.studentId
    ? storageService.getRewardProfile(user.studentId)
    : null;

  const logs = storageService.getAuditLogs().slice(0, 5);

  const demoAccounts = [
    { username: 'teacher', label: 'Ms Annapurna (Faculty / Teacher)', role: 'Teacher' },
    { username: 'ankur', label: 'Ankur Anil Jadhav (24BDS0162)', role: 'Student' },
    { username: 'akshat', label: 'Akshat Gupta (24BCE2930)', role: 'Student' },
    { username: 'karan', label: 'Karan Singh (24BCI0287)', role: 'Student' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  AAK Exam
                </span>
              </div>
              <p className="hidden text-xs text-slate-400 sm:block">
                Adaptive Assessment & Teacher Grading Pattern Engine
              </p>
            </div>
          </div>

          {/* Right Section: Quick Switcher, Credits, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher Dropdown for Recruiters / Reviewers */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Quickly switch demo accounts"
            >
              <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Role Switcher:</span>
              <span className="font-semibold text-cyan-300">
                {user ? user.displayName.split(' ')[0] : 'Select Account'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-800 p-2 shadow-2xl shadow-black/50 z-50">
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Demo Persona
                </div>
                <div className="space-y-1">
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.username}
                      onClick={() => {
                        const switched = authService.switchUserQuick(acc.username);
                        if (switched && onSwitchRole) {
                          onSwitchRole(switched);
                        }
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                        user?.username === acc.username
                          ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                          : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{acc.label}</div>
                        <div className="text-[10px] text-slate-400">Account: {acc.username}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                        {acc.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Credits Badge */}
          {user?.role === 'student' && rewardProfile && (
            <button
              onClick={() => onNavigate('rewards')}
              className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
              title="View Reward Marketplace"
            >
              <Award className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>{rewardProfile.availableCredits}</span>
              <span className="hidden sm:inline text-[10px] text-amber-400/80">Credits</span>
            </button>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              title="System Activity & Alerts"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-700 bg-slate-800 p-3 shadow-2xl shadow-black/50 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-xs font-bold text-white">Live System Events</span>
                  <span className="text-[10px] text-slate-400">Audit Feed</span>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {logs.map(log => (
                    <div key={log.id} className="rounded-lg bg-slate-900/60 p-2 text-xs border border-slate-800">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-indigo-400">{log.action}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="mt-1 text-slate-300 text-[11px] leading-snug">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar name={user.displayName} role={user.role} size="sm" />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-white leading-none">{user.displayName}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{user.role === 'teacher' ? 'Faculty / Instructor' : `Student · ${user.studentId || ''}`}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
    </>
  );
};
