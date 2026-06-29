'use client';

import { motion } from 'framer-motion';
import { BookMarked, Clock, Layers, ArrowRight } from 'lucide-react';

type AgonCourse = {
  id: string;
  catalog: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  duration: string;
  modules: number;
  level: string;
};

// Temporary: local mock data (port real `agon-agent/src/lib/data.ts` next if needed)
const courses: AgonCourse[] = [
  {
    id: 'c1',
    catalog: 'Vol. I',
    title: 'Foundation Atlas',
    subtitle: 'From concepts to conviction',
    description:
      'Build a clean mental model of UPSC subjects with museum-grade clarity and exam-grade structure.',
    tags: ['Polity', 'GS Basics', 'PYQ Logic'],
    duration: '12 Weeks',
    modules: 48,
    level: 'Beginner → Core',
  },
  {
    id: 'c2',
    catalog: 'Vol. II',
    title: 'Fluency Assembly',
    subtitle: 'From answers to arguments',
    description:
      'Learn to write with precision: pillars, debates, and editorial rhythm—so your answers start sounding inevitable.',
    tags: ['Mains Writing', 'Editorial Loops', 'Pillar Mapping'],
    duration: '14 Weeks',
    modules: 52,
    level: 'Core → Advanced',
  },
  {
    id: 'c3',
    catalog: 'Vol. III',
    title: 'Presence Cycle',
    subtitle: 'From preparation to performance',
    description:
      'Simulations and strategic missions that turn knowledge into outcomes under timed pressure.',
    tags: ['Smart Tests', 'Rank Analytics', 'Mission Control'],
    duration: '10 Weeks',
    modules: 40,
    level: 'Advanced → Elite',
  },
];

function CourseMeta({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Icon size={15} className="text-gold-deep mb-1.5" strokeWidth={1.5} />
      <span className="font-display text-base text-ink leading-none">{value}</span>
      <span className="font-sans text-[0.55rem] tracking-[0.14em] uppercase text-ink-mute mt-1">
        {label}
      </span>
    </div>
  );
}

export default function AgonCourses() {
  return (
    <section id="courses" className="relative paper-bg grain py-24 sm:py-32 overflow-hidden">
      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="eyebrow text-gold-deep mb-5">The Rare Collections</p>
          <h2 className="display-hero text-[2.2rem] sm:text-[3rem] lg:text-[3.6rem] text-ink leading-[0.98]">
            Three volumes, <span className="italic text-teal">one ascent.</span>
          </h2>
          <p className="mt-6 font-serif text-lg sm:text-xl text-ink-soft leading-relaxed">
            Curated like rare books in a library — each collection a deliberate passage from foundation to fluency to, finally, presence.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-7">
          {courses.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative parchment rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-[var(--shadow-deep)] transition-all duration-500"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-crimson via-gold to-teal opacity-80" />

              <div className="p-7 lg:p-8 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display text-sm tracking-[0.15em] uppercase text-gold-deep">{c.catalog}</span>
                  <BookMarked
                    size={20}
                    className="text-ink/30 group-hover:text-crimson transition-colors duration-500"
                    strokeWidth={1.4}
                  />
                </div>

                <h3 className="font-display text-[1.7rem] lg:text-[1.9rem] text-ink leading-tight mb-1.5">{c.title}</h3>
                <p className="font-serif italic text-lg text-teal mb-6">{c.subtitle}</p>

                <p className="font-serif text-[1rem] leading-[1.7] text-ink-soft flex-1 mb-6">{c.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="font-sans text-[0.68rem] tracking-wide px-2.5 py-1 rounded-full bg-ink/[0.04] text-ink-soft border border-[rgba(30,30,30,0.08)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 py-5 border-y border-[rgba(168,138,78,0.22)] mb-6">
                  <CourseMeta icon={Clock} label="Duration" value={c.duration} />
                  <CourseMeta icon={Layers} label="Modules" value={String(c.modules)} />
                  <CourseMeta icon={BookMarked} label="Level" value={c.level} />
                </div>

                <a
                  href="#top"
                  className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-ink/25 text-ink-soft bg-transparent font-sans text-sm font-medium tracking-wide hover:bg-crimson hover:text-cream hover:border-crimson transition-colors duration-300"
                >
                  Open the collection
                  <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
