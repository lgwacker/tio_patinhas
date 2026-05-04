'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const ONE_WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const DISMISSAL_KEY = 'pwa-install-dismissed';

function wasRecentlyDismissed(): boolean {
  const dismissed = localStorage.getItem(DISMISSAL_KEY);
  if (!dismissed) return false;

  const dismissedTime = parseInt(dismissed, 10);
  return Date.now() - dismissedTime < ONE_WEEK_IN_MS;
}

function isRunningAsStandalone(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

interface InstallState {
  prompt: BeforeInstallPromptEvent | null;
  show: boolean;
}

export function PWAInstallPrompt() {
  const [installState, setInstallState] = useState<InstallState>({
    prompt: null,
    show: false,
  });

  useEffect(() => {
    if (wasRecentlyDismissed() || isRunningAsStandalone()) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallState({
        prompt: e as BeforeInstallPromptEvent,
        show: true,
      });
    };

    const handleAppInstalled = () => {
      setInstallState({ prompt: null, show: false });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installState.prompt) return;

    await installState.prompt.prompt();
    const result = await installState.prompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    setInstallState({ prompt: null, show: false });
  };

  const handleDismiss = () => {
    setInstallState((prev) => ({ ...prev, show: false }));
    localStorage.setItem(DISMISSAL_KEY, Date.now().toString());
  };

  if (!installState.show) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-surface border border-border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Download size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary text-sm">
                Instalar Tio Patinhas
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Adicione à tela inicial para acesso rápido
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleInstall} size="sm" className="flex-1 min-h-[44px]">
            <Download size={16} className="mr-2" />
            Instalar
          </Button>
          <Button variant="secondary" onClick={handleDismiss} size="sm" className="min-h-[44px]">
            Agora não
          </Button>
        </div>
      </div>
    </div>
  );
}
