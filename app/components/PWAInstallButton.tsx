'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowHelp(true);
      return;
    }
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed || dismissed) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 animate-bounce">
        <button
          onClick={handleInstall}
          className="bg-teal-500 hover:bg-teal-400 text-ink-950 px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
          title="Install App"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm font-semibold">Install</span>
        </button>
        <button 
          onClick={() => setDismissed(true)}
          className="bg-ink-800 hover:bg-ink-700 text-ink-400 p-2 rounded-full"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-ink-900 border border-ink-700 rounded-xl p-6 max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink-100 mb-4">Install Student Mentor</h3>
            <div className="space-y-3 text-sm text-ink-300">
              <p><strong className="text-teal-400">Chrome/Edge:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Address bar me "Install" icon click karo (right side)</li>
                <li>Ya Menu (⋮) → Install Student Mentor</li>
              </ul>
              <p className="mt-4"><strong className="text-teal-400">Firefox:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Menu → Add to Home Screen</li>
              </ul>
              <p className="mt-4"><strong className="text-teal-400">Mobile:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Share button → Add to Home Screen</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full bg-teal-500 hover:bg-teal-400 text-ink-950 py-2 rounded-lg font-semibold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
