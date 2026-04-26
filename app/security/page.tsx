
'use client';
import { Brain, ArrowLeft, Shield, Lock, Server, Cpu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SecurityProtocol() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-6">
            <Shield className="w-3.5 h-3.5" /> Encryption Active
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Security Protocol</h1>
          <p className="text-ink-500 text-sm font-mono uppercase tracking-widest">Version 1.2 • Last Synchronized: April 2026</p>
        </div>

        <div className="space-y-12">
          <section className="glass-card p-8 border-ink-800 bg-ink-900/20">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-yellow-500" /> Data Encryption
            </h2>
            <p className="text-ink-400 leading-relaxed mb-4">
              All data transmitted between your browser and our servers is encrypted using <strong>TLS 1.3</strong>. Your mission-critical data is protected at rest and in transit.
            </p>
            <p className="text-ink-400 leading-relaxed">
              We utilize <strong>Bcrypt</strong> with a high cost factor to ensure your passwords remain secure against brute-force attacks.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-ink-900/40 border border-ink-800">
              <Server className="w-6 h-6 text-teal-400 mb-6" />
              <h3 className="text-lg font-black text-white uppercase mb-3">Infrastructure</h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                Our ecosystem is hosted on high-performance cloud nodes with automated DDoS protection and real-time threat monitoring.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-ink-900/40 border border-ink-800">
              <Cpu className="w-6 h-6 text-purple-400 mb-6" />
              <h3 className="text-lg font-black text-white uppercase mb-3">Rate Limiting</h3>
              <p className="text-sm text-ink-500 leading-relaxed">
                We implement intelligent rate-limiting to prevent automated exploitation while ensuring peak performance for legitimate users.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4">Access Control</h2>
            <p className="text-ink-400 leading-relaxed">
              Authorization is managed via <strong>JWT (JSON Web Tokens)</strong> with strictly defined expiration policies. Only administrators with Level 4 Clearance can access system-wide configuration nodes.
            </p>
          </section>

          <section className="p-8 rounded-3xl bg-red-500/5 border border-red-500/10">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-red-400" /> Zero Trust Architecture
            </h2>
            <p className="text-ink-400 leading-relaxed">
              We follow a Zero Trust model where every request is authenticated and authorized before it is processed by our API terminal.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-ink-800/50 py-12 text-center">
        <p className="text-[10px] text-ink-700 font-mono uppercase tracking-[0.3em]">
          UPSC Personal Operating System • Distributed Defense Active
        </p>
      </footer>
    </div>
  );
}
