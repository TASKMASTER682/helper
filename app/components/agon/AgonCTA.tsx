'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function AgonCTA() {
  return (
    <section id="cta" className="relative paper-bg grain py-24 sm:py-32 overflow-hidden">
      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative parchment rounded-3xl px-7 sm:px-14 lg:px-20 py-16 sm:py-20 text-center overflow-hidden"
        >
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
            viewBox="0 0 1200 400"
            preserveAspectRatio="none"
          >
            <g stroke="#1E1E1E" fill="none" strokeWidth="1">
              <line x1="150" y1="80" x2="300" y2="200" />
              <line x1="300" y1="200" x2="480" y2="120" />
              <line x1="480" y1="120" x2="640" y2="260" />
              <line x1="640" y1="260" x2="820" y2="160" />
              <line x1="820" y1="160" x2="980" y2="280" />
              <line x1="980" y1="280" x2="1080" y2="140" />
            </g>
            <g fill="#1E1E1E">
              <circle cx="150" cy="80" r="4" />
              <circle cx="300" cy="200" r="5" />
              <circle cx="480" cy="120" r="4" />
              <circle cx="640" cy="260" r="6" />
              <circle cx="820" cy="160" r="4" />
              <circle cx="980" cy="280" r="5" />
              <circle cx="1080" cy="140" r="4" />
            </g>
          </svg>

          <p className="eyebrow text-gold-deep mb-6 relative">The First Step</p>
          <h2 className="display-hero text-[2.4rem] sm:text-[3.4rem] lg:text-[4.2rem] text-ink leading-[0.98] relative max-w-4xl mx-auto">
            The exam tests knowledge. <span className="italic text-crimson">We build understanding.</span>
          </h2>
          <p className="mt-7 font-serif text-xl sm:text-2xl text-ink-soft leading-relaxed max-w-2xl mx-auto relative">
            Join the aspirants who chose depth over noise. Your archive awaits.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <a
              href="#top"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-ink/25 text-ink-soft bg-transparent font-sans text-sm font-medium tracking-wide hover:bg-crimson hover:text-cream hover:border-crimson transition-colors duration-300"
            >
              Start Learning
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#editorial"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-[rgba(30,30,30,0.25)] text-ink font-sans text-sm font-medium tracking-wide hover:border-ink transition-colors duration-300"
            >
              Read today&apos;s editorial
            </a>
          </div>

          <p className="mt-8 font-sans text-[0.7rem] tracking-[0.18em] uppercase text-ink-mute relative">No credit card · Seven-day full access</p>
        </motion.div>
      </div>
    </section>
  );
}
