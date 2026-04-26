
'use client';
import { Brain, ArrowLeft, FileText, Scale, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TermsOfService() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-6">
            <Scale className="w-3.5 h-3.5" /> Governance Framework
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-ink-500 text-sm font-mono uppercase tracking-widest">Version 1.0 • Last Synchronized: April 2026</p>
        </div>

        <div className="space-y-12">
          <section className="glass-card p-8 border-ink-800 bg-ink-900/20">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-500" /> Acceptable Use
            </h2>
            <p className="text-ink-400 leading-relaxed mb-4">
              UPSC-POS is designed for serious academic preparation. By initializing your OS, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-ink-500 text-sm">
              <li>Use the platform exclusively for personal education.</li>
              <li>Refrain from any attempt to bypass system security protocols.</li>
              <li>Respect the intellectual property of public content shared within the ecosystem.</li>
              <li>Maintain the confidentiality of your authentication credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Account Integrity</h2>
            <p className="text-ink-400 leading-relaxed">
              We reserve the right to suspend any account that exhibits behavior inconsistent with academic integrity, including but not limited to, account sharing, automated data harvesting, or disruptive conduct in community broadcasts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Platform Availability</h2>
            <p className="text-ink-400 leading-relaxed">
              While we strive for 99.9% uptime, UPSC-POS is provided "as is". Periodic maintenance and system synchronizations are necessary to maintain peak performance for the elite user base.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" /> Content Disclaimer
            </h2>
            <p className="text-ink-400 leading-relaxed">
              UPSC-POS serves as a curation engine. While we ensure high-quality content, we do not guarantee the absolute accuracy of public domain information or third-party academic resources.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-ink-800/50 py-12 text-center">
        <p className="text-[10px] text-ink-700 font-mono uppercase tracking-[0.3em]">
          UPSC Personal Operating System • Terms & Conditions Active
        </p>
      </footer>
    </div>
  );
}
