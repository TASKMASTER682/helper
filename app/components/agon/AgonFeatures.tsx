'use client';

import { motion } from 'framer-motion';
import { HOME_FEATURES } from './agonData';
import type { LucideIcon } from 'lucide-react';
import { Sparkles, Network, FileSearch, PenLine, Scale, BarChart3, RefreshCw, Newspaper, Sparkle } from 'lucide-react';

type AccentKey = 'crimson' | 'teal' | 'gold';

const accentMap: Record<
  AccentKey,
  { text: string; soft: string; border: string; dot: string; fgIcon: string }
> = {
  crimson: { text: 'text-crimson', soft: 'bg-crimson/8', border: 'border-crimson/25', dot: '#A63A3A', fgIcon: 'text-crimson' },
  teal: { text: 'text-teal', soft: 'bg-teal/8', border: 'border-teal/25', dot: '#3F7D73', fgIcon: 'text-teal' },
  gold: { text: 'text-gold-deep', soft: 'bg-gold/10', border: 'border-gold/30', dot: '#C8A86B', fgIcon: 'text-gold-deep' },
};

function iconForAccent(accent: AccentKey) {
  const map: Record<AccentKey, LucideIcon> = {
    crimson: Sparkles,
    teal: Network,
    gold: FileSearch,
  };
  return map[accent];
}

export default function AgonFeatures() {
  return (
    <section id="features" className="relative paper-bg grain py-24 sm:py-32">
      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16 sm:mb-20">
          <div className="lg:col-span-7">
            <p className="eyebrow text-gold-deep mb-5">The Exhibit Hall</p>
            <h2 className="display-hero text-[2.2rem] sm:text-[3rem] lg:text-[3.6rem] text-ink">
              Eight instruments, <span className="italic text-teal">carefully curated.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-serif text-lg sm:text-xl text-ink-soft leading-relaxed">
              This page blends the agon-agent museum aesthetic with your real UPSC-POS features—same theme colors, same motion language.
            </p>
          </div>
        </div>

        <div className="rule-solid mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {HOME_FEATURES.map((f, i) => (
            <ExhibitCard
              key={f.title}
              title={f.title}
              desc={f.desc}
              detail={f.detail}
              index={(i + 1).toString().padStart(2, '0')}
              accentKey={f.accentKey}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExhibitCard({
  title,
  desc,
  detail,
  index,
  accentKey,
}: {
  title: string;
  desc: string;
  detail: string;
  index: string;
  accentKey: AccentKey;
}) {
  const a = accentMap[accentKey];
  const Icon = iconForAccent(accentKey);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.6,
        delay: (parseInt(index, 10) % 4) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative parchment rounded-2xl p-6 lg:p-7 flex flex-col h-full hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-7">
        <span className="font-display text-3xl text-ink/15 leading-none">{index}</span>
        <span className={`font-sans text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full ${a.soft} ${a.text} border ${a.border}`}>
          Exhibit
        </span>
      </div>

      <div
        className={`relative w-14 h-14 rounded-xl ${a.soft} border ${a.border} flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-500`}
      >
        <Icon size={24} className={a.fgIcon} strokeWidth={1.5} />
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: a.dot }} />
      </div>

      <h3 className="font-display text-xl text-ink leading-snug mb-1.5">{title}</h3>
      <p className={`font-serif italic text-base ${a.text} mb-3.5`}>{desc}</p>
      <p className="font-serif text-[0.97rem] leading-relaxed text-ink-soft flex-1">{detail}</p>

      <div className="mt-6 flex items-center gap-2 font-sans text-[0.72rem] tracking-wider uppercase text-ink-mute group-hover:text-ink transition-colors">
        <span>Examine</span>
        <span className="h-px flex-1 bg-current opacity-20 group-hover:opacity-50 transition-opacity" />
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </motion.article>
  );
}
