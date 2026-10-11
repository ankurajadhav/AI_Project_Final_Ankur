/**
 * Crisp, Modern Monogram & Vector Avatar Component
 * 
 * Replaces synthetic/AI stock photos with SVG-rendered monograms,
 * custom gradients, and role indicators.
 */

import React from 'react';

interface AvatarProps {
  name: string;
  role?: 'student' | 'teacher' | 'admin';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  studentId?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  role = 'student',
  size = 'md',
  className = '',
  studentId,
}) => {
  // Extract clean 2-letter initials
  const cleanName = (name || 'User').trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  let initials = 'U';
  if (parts.length === 1) {
    initials = parts[0].slice(0, 2).toUpperCase();
  } else if (parts.length >= 2) {
    if (parts[0].toLowerCase() === 'ms' || parts[0].toLowerCase() === 'mr' || parts[0].toLowerCase() === 'dr') {
      initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
  }

  // Pick deterministic palette based on name/id
  const getGradient = () => {
    if (role === 'teacher' || cleanName.toLowerCase().includes('annapurna')) {
      return 'from-emerald-500 via-teal-600 to-indigo-700 text-white shadow-emerald-950/40';
    }
    if (cleanName.toLowerCase().includes('ankur')) {
      return 'from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-indigo-950/40';
    }
    if (cleanName.toLowerCase().includes('akshat')) {
      return 'from-purple-600 via-violet-600 to-pink-500 text-white shadow-purple-950/40';
    }
    if (cleanName.toLowerCase().includes('karan')) {
      return 'from-amber-500 via-orange-600 to-rose-600 text-white shadow-amber-950/40';
    }
    // Fallback based on string hash
    const gradients = [
      'from-cyan-600 to-blue-700 text-white shadow-cyan-950/40',
      'from-emerald-600 to-teal-800 text-white shadow-emerald-950/40',
      'from-violet-600 to-indigo-800 text-white shadow-violet-950/40',
      'from-rose-600 to-pink-700 text-white shadow-rose-950/40',
    ];
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) hash += cleanName.charCodeAt(i);
    return gradients[hash % gradients.length];
  };

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl font-black',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center font-bold tracking-tight rounded-xl bg-gradient-to-br shadow-md select-none shrink-0 ring-1 ring-white/15 ${getGradient()} ${sizeClasses[size]} ${className}`}
      title={`${name} (${role.toUpperCase()})`}
    >
      <span>{initials}</span>

      {/* Role dot indicator */}
      {role === 'teacher' ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"
          title="Teacher / Instructor"
        />
      ) : (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-2 ring-slate-900"
          title="Student"
        />
      )}
    </div>
  );
};
