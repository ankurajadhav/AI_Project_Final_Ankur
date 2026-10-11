/**
 * Sidebar Navigation Component with Role-Based Routing
 */

import React from 'react';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  FileCheck2,
  Dumbbell,
  Sparkles,
  BarChart3,
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  Award,
  History,
  User,
  Users,
  Building2,
  Database,
  PlusCircle,
  Wand2,
  FolderKanban,
  CheckCircle2,
  LineChart,
  PieChart,
  Activity,
  Cpu,
  FileSpreadsheet,
  Settings,
  Gift,
  LogOut,
  BookOpen,
} from 'lucide-react';

interface SidebarProps {
  role?: UserRole;
  userRole?: UserRole;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  userRole,
  activeView,
  onNavigate,
  onLogout,
}) => {
  const currentRole = role || userRole || 'student';

  const studentNavItems: { group: string; items: NavItem[] }[] = [
    {
      group: 'Core Assessment',
      items: [
        { id: 'student_dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my_exams', label: 'My Exams', icon: FileCheck2 },
        { id: 'practice_hub', label: 'Practice Hub', icon: Dumbbell },
        { id: 'ai_adaptive_test', label: 'Adaptive Test', icon: Sparkles, badge: 'Adaptive' },
      ],
    },
    {
      group: 'Mastery & Diagnostics',
      items: [
        { id: 'mastery_tracker', label: 'Concept Mastery (BKT)', icon: BrainCircuit },
        { id: 'weak_topics', label: 'Weak Topics & Remediation', icon: AlertTriangle },
        { id: 'misconception_taxonomy', label: 'Misconception Taxonomy', icon: BookOpen },
        { id: 'video_recommendations', label: 'Video Recommendations', icon: Lightbulb },
      ],
    },
    {
      group: 'Gamification & Profile',
      items: [
        { id: 'rewards_store', label: 'Rewards / Coupons', icon: Gift, badge: 'Store' },
        { id: 'student_profile', label: 'Profile & History', icon: User },
      ],
    },
  ];

  const teacherNavItems: { group: string; items: NavItem[] }[] = [
    {
      group: 'Overview & Classroom',
      items: [
        { id: 'teacher_dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'class_analytics', label: 'Class Analytics & Heatmap', icon: Users },
        { id: 'student_risk', label: 'Intervention Alerts', icon: AlertTriangle, badge: 'Risk' },
      ],
    },
    {
      group: 'Exam & Question Authoring',
      items: [
        { id: 'question_bank', label: 'Question Bank', icon: Database },
        { id: 'create_exam', label: 'Create Exam', icon: PlusCircle },
        { id: 'ai_exam_generator', label: 'Adaptive Exam Generator', icon: Wand2, badge: 'A*' },
        { id: 'teacher_grading_assistant', label: 'Grading Assistant', icon: CheckCircle2 },
      ],
    },
    {
      group: 'ML & Analytics Insights',
      items: [
        { id: 'grading_patterns', label: 'Grading Pattern (Random Forest)', icon: Cpu, badge: 'ML' },
        { id: 'misconception_taxonomy', label: 'Misconception Taxonomy', icon: BookOpen },
        { id: 'reports_export', label: 'Reports & Export', icon: FileSpreadsheet },
        { id: 'dataset_management', label: 'Dataset Management', icon: Settings },
      ],
    },
  ];

  const currentGroups = currentRole === 'teacher' || currentRole === 'admin' ? teacherNavItems : studentNavItems;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/90 flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6 overflow-y-auto pr-1">
        {currentGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1.5">
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {group.group}
            </div>
            <nav className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Recruiter & System Info Footer + Logout Button */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-3">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-slate-300">AAK Exam Engine</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              v2.4 Active
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Random Forest Regressor (100 Trees) + BKT Knowledge Tracing
          </p>
        </div>
      </div>
    </aside>
  );
};
