'use client';

import { motion } from 'framer-motion';
import { Quote, Award } from 'lucide-react';

const stories = [
  {
    id: 's1',
    rank: '1–100',
    year: '2024',
    name: 'Neha K.',
    field: 'Polity & Governance',
    thesis:
      'I stopped memorising isolated answers. The atlas let me see why each article exists — and how they speak to each other.',
    achievement: 'Mission Control',
    credential: 'Streak · Pillar Mastery',
  },
  {
    id: 's2',
    rank: '101–200',
    year: '2024',
    name: 'Rahul S.',
    field: 'Economy & Ethics',
    thesis:
      'The analytics gave me a map. Once I knew which pillar was leaking points, my preparation became deliberate.',
    achievement: 'Pillar Recovery',
    credential: 'Weakness Drills · Smart Tests',
  },
  {
    id: 's3',
    rank: '201–312',
    year: '2024',
    name: 'Aditi R.',
    field: 'History & IR',
    thesis:
      'Editorial-grade summaries finally connected facts to arguments. My answers started sounding like I meant them.',
    achievement: 'Editorial Loops',
    credential: 'Thesis Writing · PYQ Replays',
  },
];

export default function AgonSuccessStories() {
  return (
    <section id="stories" className="relative paper-bg grain py-24 sm:py-32">
      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-14">
          <div className="lg:col-span-8">
            <p className="eyebrow text-gold-deep mb-5">Fellows of the Archive</p>
            <h2 className="display-hero text-[2.2rem] sm:text-[3rem] lg:text-[3.6rem] text-ink leading-[0.98]">
              Not rank-holders. <span className="italic text-crimson">Thinkers.</span>
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="font-serif text-lg text-ink-soft leading-relaxed">
              We do not trade in before-and-after photographs. We record what our fellows actually thought — the thesis that carried them through.
            </p>
          </div>
        </div>

        <div className="rule-solid mb-12" />

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {stories.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative parchment rounded-2xl p-7 lg:p-8 flex flex-col hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] transition-all duration-500"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="font-display text-4xl text-crimson leading-none">{s.rank}</div>
                  <div className="font-sans text-[0.62rem] tracking-[0.2em] uppercase text-ink-mute mt-2">
                    UPSC CSE · {s.year}
                  </div>
                </div>
                <Quote
                  size={26}
                  className="text-gold/50 group-hover:text-gold transition-colors duration-500"
                  strokeWidth={1.2}
                />
              </div>

              <div className="rule-solid mb-5" />

              <h3 className="font-display text-2xl text-ink leading-tight mb-1">{s.name}</h3>
              <p className="font-serif italic text-teal text-lg mb-5">{s.field}</p>

              <p className="font-serif text-[1rem] leading-[1.7] text-ink-soft flex-1">
                <span className="font-display text-2xl text-gold-deep/60 leading-none mr-1">“</span>
                {s.thesis}
              </p>

              <div className="mt-6 pt-5 border-t border-[rgba(168,138,78,0.25)] space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Award size={15} className="text-crimson mt-0.5 shrink-0" strokeWidth={1.6} />
                  <span className="font-sans text-[0.78rem] text-ink-soft leading-snug">{s.achievement}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-[15px] h-px bg-ink-mute/50 shrink-0" />
                  <span className="font-sans text-[0.72rem] tracking-wide text-ink-mute">{s.credential}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="#top"
            className="inline-flex items-center gap-2 font-sans text-sm tracking-wide text-ink hover:text-crimson transition-colors ink-link"
          >
            Read all 312 fellow profiles
          </a>
        </div>
      </div>
    </section>
  );
}
