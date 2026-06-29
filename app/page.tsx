
'use client';

import { useEffect, useState } from 'react';
import { settingsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

import AgonNav from './components/agon/AgonNav';
import AgonHero from './components/agon/AgonHero';
import AgonFeatures from './components/agon/AgonFeatures';
import AgonEditorial from './components/agon/AgonEditorial';

import AgonKnowledgeGraph from './components/agon/AgonKnowledgeGraph';
import AgonSuccessStories from './components/agon/AgonSuccessStories';
import AgonCourses from './components/agon/AgonCourses';
import AgonCTA from './components/agon/AgonCTA';

import Link from 'next/link';
import { Brain, Bell, Zap } from 'lucide-react';

export default function Home() {
  const { init, user, token, isInitializing } = useAuthStore();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    init();
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isLoggedIn = !!(user && token);

  return (
    <div className="relative paper-bg grain-fixed min-h-screen text-ink selection:bg-crimson/20">
      <AgonNav />

      <main className="pt-[84px]">
        <AgonHero />
        <AgonFeatures />
        <AgonEditorial />

        {/* Keep your existing announcement block (do not delete extra features) */}
        {announcements.length > 0 && (
          <section className="relative paper-bg grain py-20 sm:py-24" aria-label="Announcements">
            <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
              <div className="mb-10 flex items-center justify-between gap-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple/10 border border-[rgba(168,138,78,0.25)]">
                    <Bell className="w-5 h-5 text-gold-deep" />
                  </div>
                  <h3 className="text-xs font-black text-ink uppercase tracking-[0.2em]">
                    Latest Platform Broadcasts
                  </h3>
                </div>

                <div className="text-xs font-sans text-ink-mute tracking-[0.18em] uppercase">
                  {isLoggedIn ? 'For your mission' : 'For all aspirants'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                {announcements.slice(0, 4).map((a) => (
                  <div
                    key={a._id}
                    className="parchment rounded-2xl p-6 border border-[rgba(30,30,30,0.10)] hover:shadow-[var(--shadow-lift)] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 p-3 rounded-xl bg-ink/5 border border-[rgba(168,138,78,0.25)]">
                        <Zap className="w-4 h-4 text-crimson" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-ink uppercase mb-1">{a.title}</h4>
                        <p className="text-[12px] text-ink-soft leading-relaxed line-clamp-2">
                          {a.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Agon-agent sections (now ported) */}
        <AgonKnowledgeGraph />
        <AgonSuccessStories />
        <AgonCourses />
        <AgonCTA />

      </main>

      <footer className="border-t border-[rgba(30,30,30,0.10)] py-16 bg-ink-950/0">
        <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center">
                <Brain className="w-5 h-5 text-ivory" />
              </div>
              <span className="text-sm font-black text-ink uppercase tracking-[0.2em]">UPSC-POS</span>
            </div>

            <div className="flex gap-8 flex-wrap justify-center md:justify-end">
              <Link href="/privacy" className="text-[10px] text-ink-mute font-black uppercase tracking-widest hover:text-ink transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[10px] text-ink-mute font-black uppercase tracking-widest hover:text-ink transition-colors">
                Terms of Service
              </Link>
              <Link href="/security" className="text-[10px] text-ink-mute font-black uppercase tracking-widest hover:text-ink transition-colors">
                Security Protocol
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[rgba(168,138,78,0.25)] text-center">
            <p className="text-[10px] text-ink-mute font-mono uppercase tracking-[0.3em]">
              Build for the 2026 Attempt Cycle • Secure Encryption Active • Distributed Cloud Architecture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

