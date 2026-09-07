'use client';

import React from 'react';
import { Download, Smartphone, ShieldCheck } from 'lucide-react';
import { usePwa } from '@/context/PwaContext';

interface PwaInstallButtonProps {
  variant?: 'navbar' | 'navbar-mobile' | 'admin-header' | 'admin-sidebar' | 'inline';
  className?: string;
  role?: 'user' | 'admin';
}

export default function PwaInstallButton({
  variant = 'navbar',
  className = '',
  role = 'user',
}: PwaInstallButtonProps) {
  const { openInstallModal, isInstalled } = usePwa();

  // If already installed in standalone mode, show a discreet status or hide
  if (isInstalled) {
    if (variant === 'admin-sidebar') {
      return (
        <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold flex items-center gap-2 border border-emerald-200">
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          <span>App Installed & Active</span>
        </div>
      );
    }
    return null;
  }

  if (variant === 'navbar') {
    return (
      <button
        type="button"
        onClick={() => openInstallModal(role)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-400/90 hover:bg-emerald-400 text-slate-950 transition-all shadow-sm hover:shadow-md hover:scale-102 cursor-pointer ${className}`}
        title="Install Loveridge App on your device"
      >
        <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install App</span>
      </button>
    );
  }

  if (variant === 'navbar-mobile') {
    return (
      <button
        type="button"
        onClick={() => openInstallModal(role)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-lg cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 stroke-[2.5]" />
          <span>Install Loveridge App</span>
        </div>
        <span className="text-[10px] font-extrabold bg-slate-950/10 px-2 py-0.5 rounded-full">
          Free
        </span>
      </button>
    );
  }

  if (variant === 'admin-header') {
    return (
      <button
        type="button"
        onClick={() => openInstallModal('admin')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all shadow-xs cursor-pointer ${className}`}
        title="Install Staff Admin Portal on your phone or desktop"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-700" />
        <span className="hidden sm:inline">Install Admin App</span>
        <span className="sm:hidden">Install</span>
      </button>
    );
  }

  if (variant === 'admin-sidebar') {
    return (
      <button
        type="button"
        onClick={() => openInstallModal('admin')}
        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200 transition shadow-2xs cursor-pointer ${className}`}
      >
        <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <span className="block truncate">Install Admin App</span>
          <span className="text-[10px] text-amber-700 font-medium block">Native phone & desktop</span>
        </div>
        <Download className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      </button>
    );
  }

  // Inline default
  return (
    <button
      type="button"
      onClick={() => openInstallModal(role)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-sm cursor-pointer ${className}`}
    >
      <Download className="w-4 h-4" />
      <span>Install App</span>
    </button>
  );
}
