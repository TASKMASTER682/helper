
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
  Trophy,
  Bell,
  Shield,
  Activity,
  PlayCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Database,
  Quote
} from 'lucide-react';
import { settingsAPI } from '@/lib/api';
import { useState } from 'react';
import Head from 'next/head';
import clsx from 'clsx';


export default function Home() {
  const router = useRouter();
  const { init, user, token, isInitializing } = useAuthStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    init();
    loadAnnouncements();
  }, [init]);

  const loadAnnouncements = async () => {
    try {
      const { data } = await settingsAPI.getAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements');
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLoggedIn = user && token;

  const FEATURES = [
    {
      title: "Smart Test Series",
      desc: "AI-integrated mock tests with real-time ranking, detailed pillar-wise analysis, and automated answer key generation.",
      icon: Target,
      color: "teal",
      detail: "Adaptive Difficulty • Real-time Rank • Pillar Analysis"
    },
    {
      title: "Premium Academy",
      desc: "High-impact video modules covering the entire UPSC syllabus, from core GS to specialized current affairs modules.",
      icon: PlayCircle,
      color: "orange",
      detail: "HD Streaming • Offline Resources • Expert Curated"
    },
    {
      title: "Strategic Missions",
      desc: "Break down the massive syllabus into actionable daily missions with precise deadline monitoring and tracking.",
      icon: Trophy,
      color: "yellow",
      detail: "Daily Targets • Streak Tracking • Milestone Rewards"
    },
    {
      title: "Intelligent Analytics",
      desc: "Detailed performance mapping that identifies your weak pillars and calculates your exact examination readiness.",
      icon: Activity,
      color: "purple",
      detail: "Pillar Mapping • Time Analytics • Growth Projection"
    }
  ];

  const REVIEWS = [
    {
      name: "Ananya Sharma",
      role: "IRS (P), 2024 Batch",
      text: "UPSC-POS changed how I perceived the syllabus. The Mission Control feature kept me disciplined when motivation failed.",
      avatar: "AS"
    },
    {
      name: "Vikram Malhotra",
      role: "UPSC Aspirant",
      text: "The Smart Test Series is a game changer. The pillar-wise analysis helped me identify that my Economy was lagging behind my Polity.",
      avatar: "VM"
    },
    {
      name: "Siddharth Verma",
      role: "IPS (P), 2024 Batch",
      text: "The most beautiful interface for preparation. No clutter, just high-performance tools that get the job done efficiently.",
      avatar: "SV"
    }
  ];

  return (
    <>
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

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-40">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-8">
            <Zap className="w-3.5 h-3.5" /> Efficiency Protocol v2.0
          </div>

          <h1 className="text-5xl md:text-8xl font-display font-bold leading-none tracking-tighter mb-8 text-white">
            The Personal Operating <br />
            System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Civil Servants.</span>
          </h1>

          <p className="text-ink-400 text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-body">
            UPSC-POS integrates your library, missions, and test analytics into a single, high-performance interface designed for the elite 1%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => router.push(isLoggedIn ? '/dashboard' : '/login')}
              className="group w-full sm:w-auto bg-yellow-500 text-ink-950 text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)] transition-all border-2 border-yellow-500/50 active:scale-95"
            >
              {isLoggedIn ? 'Enter Workspace' : 'Initialize Command Center'} 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Platform Pillars */}
        <div className="max-w-6xl mx-auto mb-40">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Master the Ecosystem</h2>
            <p className="text-sm text-ink-500 uppercase tracking-widest font-bold">Comprehensive Preparation Architecture</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-10 rounded-[2.5rem] bg-ink-900/40 border border-ink-800/50 hover:bg-ink-900/60 hover:border-white/10 transition-all duration-500 relative overflow-hidden">
                <div className={clsx(
                  "absolute -top-20 -right-20 w-64 h-64 blur-[100px] opacity-5 group-hover:opacity-10 transition-opacity rounded-full",
                  f.color === 'blue' ? 'bg-blue-500' :
                  f.color === 'teal' ? 'bg-teal-500' :
                  f.color === 'purple' ? 'bg-purple-500' : 'bg-orange-500'
                )} />
                
                <div className="relative z-10">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110",
                    f.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                    f.color === 'teal' ? 'bg-teal-500/10 text-teal-400' :
                    f.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : 
                    f.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-orange-500/10 text-orange-400'
                  )}>
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">{f.title}</h3>
                  <p className="text-base text-ink-400 leading-relaxed mb-6">{f.desc}</p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-ink-600 uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    {f.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-6xl mx-auto mb-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Wall of Success</h2>
            <p className="text-xs text-ink-600 uppercase tracking-[0.3em] font-black">Trusted by Rankers & Aspirants</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map(r => (
              <div key={r.name} className="p-8 rounded-3xl bg-ink-950 border border-ink-800/50 hover:border-yellow-500/20 transition-all flex flex-col justify-between h-full relative">
                <div className="absolute top-8 right-8 opacity-5">
                  <Quote className="w-12 h-12 text-white" />
                </div>
                <p className="text-base text-ink-300 italic mb-8 relative z-10 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-ink-900 border border-ink-800 flex items-center justify-center text-xs font-black text-ink-500 uppercase">
                    {r.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{r.name}</h4>
                    <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="max-w-5xl mx-auto mb-40">
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Latest Platform Broadcasts</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.slice(0, 4).map(a => (
                <div key={a._id} className="p-6 bg-ink-900/30 border border-ink-800/50 rounded-2xl hover:border-purple-500/30 transition-all flex gap-4">
                  <div className="shrink-0 p-3 bg-ink-950 rounded-xl h-fit">
                    <Zap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase mb-1">{a.title}</h4>
                    <p className="text-[11px] text-ink-500 leading-relaxed line-clamp-2">{a.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto p-12 rounded-[2.5rem] bg-gradient-to-br from-yellow-500 to-yellow-700 text-ink-950 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Shield className="w-64 h-64 text-black" />
          </div>
          <h2 className="text-4xl font-black text-black mb-6 relative z-10 uppercase tracking-tight">Join the Elite 1%.</h2>
          <p className="text-black/70 text-lg mb-10 font-bold relative z-10 max-w-xl mx-auto">
            Stop juggling multiple tools. Centralize your preparation and start seeing real results with UPSC-POS today.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="px-10 py-5 bg-black text-yellow-500 font-black rounded-2xl text-lg uppercase tracking-widest hover:scale-105 transition-all relative z-10 active:scale-95"
          >
            Start Your Mission
          </button>
        </div>
      </main>

      <footer className="border-t border-ink-800/50 py-16 bg-ink-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-ink-950" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-[0.2em]">UPSC-POS</span>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-[10px] text-ink-600 font-black uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[10px] text-ink-600 font-black uppercase tracking-widest hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/security" className="text-[10px] text-ink-600 font-black uppercase tracking-widest hover:text-white transition-colors">Security Protocol</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-ink-800/30 text-center">
            <p className="text-[10px] text-ink-700 font-mono uppercase tracking-[0.3em]">
              Build for the 2026 Attempt Cycle • Secure Encryption Active • Distributed Cloud Architecture
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}

