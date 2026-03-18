
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { 
  ArrowRight, 
  Target, 
  LayoutDashboard,
  Brain,
  Zap,
  Flame,
  Trophy
} from 'lucide-react';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const { init, user, token, isInitializing } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLoggedIn = user && token;

  return (
    <>
      {/* Structured Data for SEO */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "UPSC-POS",
              "description": "Comprehensive UPSC exam preparation platform with mock tests, study materials, progress tracking, and personalized guidance for civil service aspirants.",
              "url": "https://student-mentor.vercel.app",
              "logo": "https://student-mentor.vercel.app/logo.png",
              "sameAs": [
                "https://twitter.com/studentmentor",
                "https://facebook.com/studentmentor",
                "https://instagram.com/studentmentor"
              ],
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "India",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Support",
                "availableLanguage": ["English", "Hindi"]
              },
              "educationalProgram": {
                "@type": "EducationalProgram",
                "name": "UPSC Civil Services Exam Preparation",
                "description": "Complete preparation program for UPSC Civil Services Examination including Prelims, Mains, and Interview stages.",
                "educationalCredentialAwarded": "Civil Services Examination Qualification",
                "timeOfDay": "Anytime",
                "timeToComplete": "1-2 years",
                "typicalCreditsNeeded": "Comprehensive curriculum covering all exam stages"
              }
            })
          }}
        />
      </Head>

      <div className="min-h-screen bg-ink-950 text-ink-100 overflow-x-hidden selection:bg-yellow-500/30">
        <nav className="fixed top-0 w-full z-50 border-b border-ink-800/50 bg-ink-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center shadow-lg shadow-yellow-900/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-ink-100 leading-none tracking-tight">UPSC-POS</div>
              <div className="text-[10px] font-mono text-ink-500 uppercase tracking-[0.2em] mt-1.5 font-semibold">Personal OS</div>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <Link href="/dashboard" className="flex items-center gap-2 bg-white text-ink-950 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-yellow-400 text-black transition-all shadow-xl active:scale-95">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-ink-400 hover:text-white transition-colors">Sign In</Link>
                <Link href="/login" className="bg-yellow-500 text-ink-950 px-7 py-3 rounded-full font-bold text-sm shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all">
                  Initialize OS
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
<main className="pt-40 pb-20 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-150 -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-75 h-75 bg-yellow-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-8">
            <Zap className="w-3.5 h-3.5" /> Efficiency Protocol v2.0
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight tracking-tight mb-6 text-white">
            The Personal Operating <br />
            System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Civil Servants.</span>
          </h1>

          <p className="text-ink-400 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-body">
            UPSC-POS integrates your library, missions, and test analytics into a single, high-performance interface designed for the elite 1%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/login')}
              className="group w-full sm:w-auto bg-yellow-500 text-ink-950 text-black px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all border-2 border-yellow-500/50 active:scale-95"
            >
              {isLoggedIn ? 'Enter Workspace' : 'Get Started'} 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
<div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-ink-900/40 border border-ink-800/50 backdrop-blur-sm group hover:border-yellow-500/30 transition-all">
            <Flame className="w-6 h-6 text-yellow-400 mb-4" />
            <h3 className="font-display font-bold text-ink-100 mb-1 italic">Consistency Streak</h3>
            <p className="text-sm text-ink-500 font-body">Automated tracking of your daily learning rituals and discipline.</p>
          </div>
          <div className="p-6 rounded-2xl bg-ink-900/40 border border-ink-800/50 backdrop-blur-sm group hover:border-jade-500/30 transition-all">
            <Trophy className="w-6 h-6 text-jade-400 mb-4" />
            <h3 className="font-display font-bold text-ink-100 mb-1 italic">Confidence Score</h3>
            <p className="text-sm text-ink-500 font-body">Data-driven performance mapping across all UPSC syllabus pillars.</p>
          </div>
          <div className="p-6 rounded-2xl bg-ink-900/40 border border-ink-800/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
            <Target className="w-6 h-6 text-blue-400 mb-4" />
            <h3 className="font-display font-bold text-ink-100 mb-1 italic">Mission Control</h3>
            <p className="text-sm text-ink-500 font-body">Convert your syllabus into actionable missions with precise deadlines.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-ink-800/50 py-10 text-center bg-ink-950/50">
        <div className="flex items-center justify-center gap-2 mb-4">
           <Brain className="w-4 h-4 text-ink-700" />
           <span className="text-[10px] text-ink-600 font-mono tracking-[0.3em] uppercase">UPSC Personal Operating System</span>
        </div>
        <p className="text-[9px] text-ink-700 font-mono uppercase">
          Build for the 2026 Attempt Cycle • Secure Encryption Active
        </p>
      </footer>
    </div>
    </>
  );
}

