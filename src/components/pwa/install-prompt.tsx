'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-[#1e3a5f]/20 bg-white p-4 shadow-lg md:left-auto md:right-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#1e3a5f]/10 p-2">
          <Download className="h-5 w-5 text-[#1e3a5f]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#1e3a5f]">
            Install Light Bearers
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add to your home screen for quick access and offline support.
          </p>
          <button
            onClick={handleInstall}
            className="mt-2 inline-flex items-center rounded-md bg-[hsl(38,44%,61%)] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[hsl(38,44%,51%)]"
          >
            Install App
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
