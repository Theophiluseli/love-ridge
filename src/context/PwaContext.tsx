'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import PwaInstallModal from '@/components/PwaInstallModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaContextType {
  isInstalled: boolean;
  canInstallNatively: boolean;
  openInstallModal: (target?: 'user' | 'admin') => void;
  closeInstallModal: () => void;
  promptNativeInstall: () => Promise<boolean>;
  targetRole: 'user' | 'admin';
}

const PwaContext = createContext<PwaContextType | null>(null);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    // 1. Check if already running in standalone display mode
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(Boolean(isStandalone));
      return Boolean(isStandalone);
    };

    const standalone = checkStandalone();

    // Auto-detect if currently in admin section
    if (window.location.pathname.startsWith('/admin')) {
      setTargetRole('admin');
    }

    // Auto-show Mavidel-style floating banner on page load if not installed and not dismissed in session
    if (!standalone) {
      const dismissed = sessionStorage.getItem('loveridge_pwa_banner_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setModalOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    // 2. Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    try {
      mediaQuery.addEventListener('change', handler);
    } catch {
      mediaQuery.addListener(handler);
    }

    // 3. Register Service Worker in production/browser
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration skipped or failed:', err);
          });
      });
    }

    // 4. Capture native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setModalOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      try {
        mediaQuery.removeEventListener('change', handler);
      } catch {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  const openInstallModal = (target: 'user' | 'admin' = 'user') => {
    setTargetRole(target);
    setModalOpen(true);
    sessionStorage.removeItem('loveridge_pwa_banner_dismissed');
  };

  const closeInstallModal = () => {
    setModalOpen(false);
    try {
      sessionStorage.setItem('loveridge_pwa_banner_dismissed', 'true');
    } catch {}
  };

  const promptNativeInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setModalOpen(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error invoking native install prompt:', err);
      return false;
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canInstallNatively: Boolean(deferredPrompt),
        openInstallModal,
        closeInstallModal,
        promptNativeInstall,
        targetRole,
      }}
    >
      {children}
      <PwaInstallModal
        isOpen={modalOpen}
        onClose={closeInstallModal}
        targetRole={targetRole}
        canInstallNatively={Boolean(deferredPrompt)}
        onNativeInstall={promptNativeInstall}
      />
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
}
