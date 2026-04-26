
'use client';
import { Brain, ArrowLeft, ShieldCheck, Lock, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 font-body selection:bg-yellow-500/30">
      <nav className="fixed top-0 w-full z-50 border-b border-ink-800/50 bg-ink-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="font-display text-xl font-bold text-white tracking-tight">UPSC-POS</div>
          </Link>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-ink-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Base
          </button>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-6">
            <ShieldCheck className="w-3.5 h-3.5" /> Data Integrity Protocol
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-ink-500 text-sm font-mono uppercase tracking-widest">Version 2.0 • Last Synchronized: April 2026</p>
        </div>

        <div className="space-y-12">
          <section className="glass-card p-8 border-ink-800 bg-ink-900/20">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
              <EyeOff className="w-5 h-5 text-yellow-500" /> Non-Scraping Commitment
            </h2>
            <p className="text-ink-400 leading-relaxed mb-4">
              At UPSC-POS, we operate on a strict <strong>Zero-Scrape Policy</strong>. We do not utilize automated scripts or bots to extract private data from third-party platforms.
            </p>
            <p className="text-ink-400 leading-relaxed">
              All educational materials, videos, and resources shared within this platform are either:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-ink-500 text-sm">
              <li>Already available public content accessible via official APIs.</li>
              <li>Public domain information curated for academic excellence.</li>
              <li>Original content produced by our subject matter experts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Data Collection</h2>
            <p className="text-ink-400 leading-relaxed">
              We only collect essential data required to maintain your "Personal OS" experience. This includes your name, email for authentication, and progress metrics within the missions and tests. We never sell your data to third-party advertisers or data brokers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">User Sovereignty</h2>
            <p className="text-ink-400 leading-relaxed">
              You maintain complete sovereignty over your data. You can request a complete purge of your account and associated metrics at any time through the Command Center settings.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-yellow-500/5 border border-yellow-500/10">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-yellow-500" /> Security Note
            </h2>
            <p className="text-ink-400 leading-relaxed">
              Your passwords and sensitive credentials are encrypted using industry-standard hashing algorithms (Bcrypt). We do not store plain-text passwords.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-ink-800/50 py-12 text-center">
        <p className="text-[10px] text-ink-700 font-mono uppercase tracking-[0.3em]">
          UPSC Personal Operating System • Secure Node Alpha
        </p>
      </footer>
    </div>
  );
}
