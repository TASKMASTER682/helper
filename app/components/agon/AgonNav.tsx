'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Brain, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const links = [
  { label: 'Atlas', href: '#atlas' },
  { label: 'Exhibits', href: '#features' },
  { label: 'Editorial', href: '#editorial' },
  { label: 'Graph', href: '#graph' },
  { label: 'Fellows', href: '#stories' },
  { label: 'Collections', href: '#courses' },
];

export default function AgonNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, token } = useAuthStore();
  const isLoggedIn = !!user && !!token;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div
        className={`transition-all duration-500 ${
          scrolled ? 'glass shadow-[0_1px_0_rgba(168,138,78,0.2)]' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between h-[68px]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-crimson to-crimson-deep flex items-center justify-center shadow-lg shadow-crimson-deep/30">
              <Brain className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="font-display text-xl font-bold text-ink-100 leading-none tracking-tight">UPSC-POS</div>
              <div className="text-[10px] font-mono text-ink-500 uppercase tracking-[0.2em] mt-1.5 font-semibold">
                Personal OS
              </div>
            </div>
          </Link>

          {/* Desktop links (agon menu style) */}
          <div className="hidden lg:flex items-center gap-9">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-sans text-[0.82rem] tracking-wide text-ink-soft hover:text-crimson transition-colors ink-link"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Your app buttons must remain (Sign in / Dashboard) */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 font-sans text-[0.8rem] font-medium tracking-wide px-5 py-2.5 rounded-full bg-crimson text-cream hover:bg-crimson-deep transition-colors duration-300"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="font-sans text-[0.82rem] text-ink-soft hover:text-ink transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="font-sans text-[0.8rem] font-medium tracking-wide px-5 py-2.5 rounded-full border border-ink/25 text-ink-soft bg-transparent hover:bg-crimson hover:text-cream hover:border-crimson transition-colors duration-300"
                >
                  Begin
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-ink"
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="lg:hidden overflow-hidden glass border-t border-[rgba(168,138,78,0.2)]"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-serif text-2xl text-ink py-2.5 border-b border-[rgba(30,30,30,0.08)]"
                >
                  {l.label}
                </a>
              ))}

              <div className="mt-4 flex flex-col gap-2">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-2 text-center font-sans text-sm font-medium px-5 py-3.5 rounded-full bg-crimson text-cream hover:bg-crimson-deep transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="text-center font-sans text-sm font-medium px-5 py-3.5 rounded-full border border-[rgba(168,138,78,0.35)] text-ink-soft hover:bg-ink/[0.03]"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="text-center font-sans text-sm font-medium px-5 py-3.5 rounded-full border border-ink/25 text-ink-soft bg-transparent hover:bg-crimson hover:text-cream hover:border-crimson transition-colors"
                    >
                      Begin
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
