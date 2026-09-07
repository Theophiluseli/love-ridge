'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
} from 'lucide-react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'user' | 'admin';
  canInstallNatively?: boolean;
  onNativeInstall?: () => Promise<boolean>;
}

export default function PwaInstallModal({
  isOpen,
  onClose,
  targetRole = 'user',
  canInstallNatively = false,
  onNativeInstall,
}: PwaInstallModalProps) {
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));
  }, []);

  if (!isOpen) return null;

  async function handleInstallClick() {
    if (canInstallNatively && onNativeInstall) {
      setInstalling(true);
      try {
        const ok = await onNativeInstall();
        if (ok) {
          setInstalledSuccess(true);
          setTimeout(() => {
            onClose();
            setInstalledSuccess(false);
          }, 1500);
        }
      } finally {
        setInstalling(false);
      }
      return;
    }

    if (isIos) {
      setShowIosGuide(!showIosGuide);
      return;
    }

    // Default: if on desktop or android without prompt, show quick instruction
    setShowIosGuide(!showIosGuide);
  }

  const titleText = targetRole === 'admin' ? 'Install Admin App' : 'Install Loveridge App';
  const subtitleText =
    targetRole === 'admin'
      ? 'Add Loveridge Admin to Home Screen for fast control...'
      : 'Add Loveridge App to Home Screen for fast offline access...';
  const buttonText = targetRole === 'admin' ? 'Install Admin App' : 'Install Order App';

  return (
    <aside
      aria-label="Install Loveridge Application Banner"
      className="fixed bottom-3 inset-x-3 sm:bottom-5 sm:inset-x-auto sm:right-5 sm:max-w-md md:max-w-lg z-[90] animate-slide-up"
    >
      {/* iOS / Safari Guidance Drawer (Opens smoothly when clicked on iOS) */}
      {showIosGuide && (
        <div className="mb-1.5 p-3 bg-[#03261d] border border-emerald-500/40 rounded-xl shadow-2xl text-white space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
              Quick Install Steps
            </span>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="text-emerald-300 hover:text-white p-0.5"
              aria-label="Close instructions"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-[10px] text-emerald-100">
            <div className="p-1.5 bg-emerald-950/80 rounded-lg border border-emerald-600/30 text-center space-y-0.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] inline-flex items-center justify-center">1</span>
              <p className="font-semibold leading-tight">Tap <strong className="text-amber-300 inline-flex items-center gap-0.5">Share <Share className="w-2.5 h-2.5" /></strong></p>
              <p className="text-[9px] text-emerald-300/80">Bottom bar</p>
            </div>

            <div className="p-1.5 bg-emerald-950/80 rounded-lg border border-emerald-600/30 text-center space-y-0.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] inline-flex items-center justify-center">2</span>
              <p className="font-semibold leading-tight">Tap <strong className="text-amber-300 inline-flex items-center gap-0.5">Add <PlusSquare className="w-2.5 h-2.5" /></strong></p>
              <p className="text-[9px] text-emerald-300/80">Home Screen</p>
            </div>

            <div className="p-1.5 bg-emerald-950/80 rounded-lg border border-emerald-600/30 text-center space-y-0.5">
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] inline-flex items-center justify-center">3</span>
              <p className="font-semibold leading-tight">Tap <strong className="text-amber-300">Add</strong></p>
              <p className="text-[9px] text-emerald-300/80">Top right</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Mavidel-Style Compact Floating Bar with Loveridge Brand Colors */}
      <div className="bg-[#03261d]/95 hover:bg-[#03261d] transition-all backdrop-blur-2xl border border-emerald-500/30 shadow-2xl shadow-black/80 rounded-2xl py-1.5 px-2.5 sm:py-2 sm:px-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Compact Squircle Icon with Loveridge Logo */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#021f17] border-1.5 border-amber-400/60 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden p-0.5 shadow-2xs">
            <img
              src="/icons/icon-192x192.png"
              alt="Loveridge"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Middle: Compact Title & Subtitle */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0 stroke-[2.5]" />
            <h3 className="font-black text-amber-400 text-[11px] sm:text-xs tracking-tight truncate">
              {titleText}
            </h3>
          </div>
          <p className="text-[9.5px] sm:text-[10.5px] text-emerald-100/75 truncate mt-0.5 font-medium leading-none">
            {subtitleText}
          </p>
        </div>

        {/* Right: Compact Action Button & Close */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={installing || installedSuccess}
            className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[10.5px] sm:text-xs flex items-center gap-1 shadow-sm shadow-amber-950/30 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-70"
          >
            {installedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Installed</span>
              </>
            ) : installing ? (
              <span>Installing...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 stroke-[2.8]" />
                <span>{buttonText}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="text-emerald-300/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
            aria-label="Dismiss install banner"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
