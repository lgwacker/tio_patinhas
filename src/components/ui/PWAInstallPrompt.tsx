'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      // Only show again after a week
      if (Date.now() - dismissedTime < oneWeek) {
        setIsDismissed(true);
        return;
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show our custom prompt
      setIsVisible(true);
    };

    // Check if app is already installed
    const checkInstalled = () => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          setIsVisible(false);
          setIsDismissed(true);
        }
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setIsDismissed(true);
    });

    // Check on mount
    checkInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    // Show the native install prompt
    await installPrompt.prompt();

    // Wait for the user to respond
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
    } else {
      console.log('[PWA] User dismissed the install prompt');
    }

    // Clear the saved prompt
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible || isDismissed) {
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
