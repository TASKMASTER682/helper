'use client';

import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Compass, ChevronDown } from 'lucide-react';

type AtlasNode = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  r: number;
  accent: string;
};

const atlasNodes: AtlasNode[] = [
  { id: 'core', label: 'भारत', sub: 'Knowledge Core', x: 500, y: 350, r: 48, accent: '#A63A3A' },
  { id: 'polity', label: 'Polity', sub: 'Constitution', x: 500, y: 110, r: 30, accent: '#A63A3A' },
  { id: 'history', label: 'History', sub: 'Manuscripts', x: 230, y: 195, r: 30, accent: '#C8A86B' },
  { id: 'economy', label: 'Economy', sub: 'Policy', x: 770, y: 195, r: 30, accent: '#3F7D73' },
  { id: 'geography', label: 'Geography', sub: 'Terrain', x: 160, y: 430, r: 28, accent: '#3F7D73' },
  { id: 'ethics', label: 'Ethics', sub: 'Conscience', x: 840, y: 430, r: 28, accent: '#A63A3A' },
  { id: 'science', label: 'Science', sub: 'Frontier', x: 315, y: 565, r: 28, accent: '#C8A86B' },
  { id: 'current', label: 'Current Affairs', sub: 'Living', x: 685, y: 565, r: 28, accent: '#3F7D73' },
  { id: 'editorials', label: 'Editorials', sub: 'Discourse', x: 500, y: 605, r: 26, accent: '#C8A86B' },
  { id: 'governance', label: 'Governance', sub: 'Institutions', x: 145, y: 315, r: 26, accent: '#A63A3A' },
  { id: 'ir', label: "Int'l Relations", sub: 'World', x: 855, y: 315, r: 26, accent: '#3F7D73' },
];

const atlasEdges: [string, string][] = [
  ['core', 'polity'],
  ['core', 'history'],
  ['core', 'economy'],
  ['core', 'geography'],
  ['core', 'ethics'],
  ['core', 'science'],
  ['core', 'current'],
  ['core', 'editorials'],
  ['core', 'governance'],
  ['core', 'ir'],
  ['polity', 'governance'],
  ['polity', 'ir'],
  ['polity', 'economy'],
  ['history', 'geography'],
  ['history', 'governance'],
  ['economy', 'current'],
  ['economy', 'ir'],
  ['geography', 'science'],
  ['geography', 'current'],
  ['ethics', 'governance'],
  ['ethics', 'current'],
  ['science', 'current'],
  ['current', 'editorials'],
  ['editorials', 'polity'],
];

const tickerDomains = [
  'Polity',
  'Economy',
  'History',
  'Geography',
  'Environment',
  'Science & Technology',
  'Ethics',
  'International Relations',
  'Governance',
  'Current Affairs',
  'Editorials',
  'Internal Security',
  'Disaster Management',
  'Social Justice',
  'Agriculture',
];

const glyphs = [
  { ch: 'ध', x: 8, y: 22, dur: 16, delay: 0, op: 0.16 },
  { ch: 'अ', x: 88, y: 70, dur: 19, delay: 3, op: 0.12 },
  { ch: 'वि', x: 18, y: 78, dur: 22, delay: 6, op: 0.14 },
  { ch: 'ज्ञ', x: 92, y: 30, dur: 17, delay: 2, op: 0.13 },
  { ch: 'स', x: 50, y: 12, dur: 20, delay: 5, op: 0.15 },
  { ch: 'त', x: 72, y: 88, dur: 18, delay: 8, op: 0.12 },
];

export default function AgonHero() {
  const [active, setActive] = useState<string | null>(null);
  const ref = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const atlasScale = useTransform(scrollYProgress, [0, 0.8], [1, 1.14]);
  const atlasOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);
  const atlasY = useTransform(scrollYProgress, [0, 0.7], [0, -80]);

  const nodeById = useMemo(() => {
    const m = new Map<string, AtlasNode>();
    atlasNodes.forEach((n) => m.set(n.id, n));
    return m;
  }, []);

  const isConnected = (id: string) =>
    active === null
      ? true
      : active === id ||
        atlasEdges.some(
          ([a, b]) => (a === active && b === id) || (b === active && a === id),
        );

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section
      id="top"
      ref={(el) => {
        ref.current = el;
      }}
      className="relative paper-bg grain-fixed overflow-hidden"
    >
      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pt-24 sm:pt-28">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[rgba(30,30,30,0.14)]"
        >
          <span className="inline-flex items-center gap-2 bg-crimson-deep text-parchment font-sans text-[0.68rem] font-medium tracking-wide px-3 py-1.5 rounded-lg shadow-sm shadow-crimson-deep/30">{dateStr}</span>
          <span className="hidden sm:flex items-center gap-3 eyebrow text-crimson font-semibold">
            Road to Labaasna
          </span>
          <span className="eyebrow text-crimson flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse-node" />
            Edition · Live
          </span>
        </motion.div>

        <div className="flex items-center gap-4 pt-2">
          <div className="h-px flex-1 bg-[rgba(168,138,78,0.3)]" />
          <span className="font-display italic text-sm text-gold-deep/70">
            ~ An Archive for the Civil Services ~
          </span>
          <div className="h-px flex-1 bg-[rgba(168,138,78,0.3)]" />
        </div>
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 sm:pt-14 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="eyebrow text-gold-deep mb-6 flex items-center justify-center gap-3"
        >
          <span className="h-px w-8 bg-gold/50" />
          The Knowledge Atlas
          <span className="h-px w-8 bg-gold/50" />
        </motion.p>

        <div className="relative flex justify-center items-center">
          <img
            src="/Ashok_Chakra.svg"
            alt=""
            className="absolute pointer-events-none select-none"
            style={{
              opacity: 0.035,
              filter: 'grayscale(1) brightness(0.4)',
              width: 'min(100vw, 950px)',
              height: 'min(100vw, 950px)',
              objectFit: 'contain',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          <h1 className="display-hero text-[2.8rem] sm:text-[3.8rem] lg:text-[4.8rem] xl:text-[5.4rem] text-ink px-2">
            Not for Everyone
            <span className="block italic text-crimson mt-1">Only for the Committed.</span>
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-7 font-serif text-xl sm:text-[1.45rem] leading-relaxed text-ink-soft max-w-2xl mx-auto"
        >
          UPSC-POS integrates your library, missions, and test analytics into a single, high-performance interface designed for the elite 1%.
        </motion.p>
      </div>

      <motion.div
        style={{ scale: atlasScale, opacity: atlasOpacity, y: atlasY }}
        className="relative z-10 max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-10 pt-10 sm:pt-14"
      >
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {glyphs.map((g, i) => (
            <span
              key={i}
              className="absolute font-display select-none animate-drift"
              style={{
                left: `${g.x}%`,
                top: `${g.y}%`,
                fontSize: `${1.8 + (i % 3)}rem`,
                color: i % 2 ? '#3F7D73' : '#C8A86B',
                ['--dur' as any]: `${g.dur}s`,
                ['--op' as any]: g.op,
                animationDelay: `${g.delay}s`,
              }}
            >
              {g.ch}
            </span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.3, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[1000/680] w-full"
        >
          <AtlasSVG
            active={active}
            setActive={setActive}
            isConnected={isConnected}
            nodeById={(id) => nodeById.get(id)!}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-1 text-center font-sans text-[0.7rem] tracking-[0.2em] uppercase text-ink-mute"
        >
          Hover a domain — watch the pathways illuminate
        </motion.p>
      </motion.div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pt-10 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <a
            href="/login"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-ink/25 text-ink-soft bg-transparent font-sans text-sm font-medium tracking-wide hover:bg-crimson hover:text-cream hover:border-crimson transition-colors duration-300"
          >
            Start Learning
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="#atlas"
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full border border-[rgba(30,30,30,0.25)] text-ink font-sans text-sm font-medium tracking-wide hover:border-ink hover:bg-ink/[0.03] transition-all duration-300"
          >
            <Compass size={16} className="text-teal group-hover:rotate-45 transition-transform duration-500" />
            Explore the Knowledge Atlas
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { n: '1,24,000+', l: 'Aspirants guided' },
            { n: '29 yrs', l: 'PYQ archive' },
            { n: 'AIR 1–100', l: 'Repeatedly' },
          ].map((s) => (
            <div key={s.l} className="border-l border-[rgba(168,138,78,0.4)] pl-3 sm:pl-4">
              <div className="font-display text-2xl sm:text-3xl text-ink leading-none">{s.n}</div>
              <div className="font-sans text-[0.6rem] sm:text-[0.62rem] tracking-wider uppercase text-ink-mute mt-1.5">
                {s.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="relative z-10 mt-16 sm:mt-20 border-y border-[rgba(30,30,30,0.12)] py-4 overflow-hidden">
        <div className="flex w-max animate-marquee">
          {[...tickerDomains, ...tickerDomains].map((d, i) => (
            <span
              key={i}
              className="flex items-center gap-4 px-6 font-display italic text-lg text-ink-soft whitespace-nowrap"
            >
              {d}
              <span className="text-gold not-italic">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-8 flex flex-col items-center">
        <span className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-ink-mute mb-2">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-gold-deep" />
        </motion.div>
      </div>
    </section>
  );
}

function AtlasSVG({
  active,
  setActive,
  isConnected,
  nodeById,
}: {
  active: string | null;
  setActive: (v: string | null) => void;
  isConnected: (id: string) => boolean;
  nodeById: (id: string) => AtlasNode;
}) {
  const edges = atlasEdges;
  const nodes = atlasNodes;

  return (
    <svg viewBox="0 0 1000 680" className="w-full h-full" role="img" aria-label="Knowledge Atlas">
      <defs>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A63A3A" stopOpacity="0.26" />
          <stop offset="55%" stopColor="#C8A86B" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#C8A86B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="terrainGrad" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#C8A86B" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#C8A86B" stopOpacity="0" />
        </radialGradient>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="nodeGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="500" cy="350" r="300" fill="url(#coreGlow)" />

      <g fill="none" stroke="#C8A86B" strokeOpacity="0.10" strokeWidth="1.2">
        <path d="M 380 180 C 470 150, 600 165, 660 220 C 700 270, 690 340, 640 400 C 600 450, 520 470, 450 450 C 380 430, 340 370, 350 300 C 355 250, 365 210, 380 180 Z" />
        <path d="M 405 210 C 480 185, 585 200, 635 245 C 668 285, 660 345, 620 390 C 585 430, 515 445, 460 430 C 405 415, 375 365, 380 315 C 383 275, 395 235, 405 210 Z" />
        <path d="M 430 240 C 495 220, 575 232, 615 270 C 640 305, 632 350, 600 385 C 570 415, 510 425, 470 415 C 430 405, 408 370, 412 330 C 415 300, 422 265, 430 240 Z" />
        <path d="M 460 275 C 510 262, 565 272, 595 300 C 612 325, 605 355, 585 378 C 560 400, 515 408, 485 400 C 455 392, 442 368, 445 345 C 447 325, 453 295, 460 275 Z" />
        <path d="M 485 305 C 520 297, 555 305, 575 322 C 585 340, 580 358, 565 372 C 545 386, 515 390, 498 384 C 482 378, 475 362, 478 348 C 480 335, 482 318, 485 305 Z" />
      </g>

      <circle cx="500" cy="350" r="260" fill="url(#terrainGrad)" />

      {[130, 210, 290].map((r) => (
        <circle
          key={r}
          cx="500"
          cy="350"
          r={r}
          fill="none"
          stroke="#C8A86B"
          strokeOpacity="0.13"
          strokeWidth="1"
          strokeDasharray="2 7"
        />
      ))}

      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx="500"
          cy="350"
          r="48"
          fill="none"
          stroke="#A63A3A"
          strokeWidth="1.4"
          style={{
            transformOrigin: '500px 350px',
            animation: `ring-pulse 4s ease-out ${i * 1.3}s infinite`,
            ['--r0' as any]: '48px',
            ['--r1' as any]: '290px',
          }}
        />
      ))}

      {edges.map(([a, b], i) => {
        const na = nodeById(a);
        const nb = nodeById(b);
        const lit = active === null ? false : a === active || b === active;
        const dim = active !== null && !lit;

        return (
          <g key={i}>
            <line
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={lit ? na.accent : '#8a7a55'}
              strokeOpacity={dim ? 0.07 : lit ? 0.75 : 0.3}
              strokeWidth={lit ? 2 : 1}
              className={lit ? 'dash-flow' : ''}
              style={{ transition: 'stroke-opacity 0.4s, stroke 0.4s' }}
            />
            <circle r="1.8" fill={na.accent} opacity={dim ? 0.1 : 0.55}>
              <animateMotion
                dur={`${3 + (i % 4)}s`}
                repeatCount="indefinite"
                path={`M${na.x},${na.y} L${nb.x},${nb.y}`}
                begin={`${i * 0.25}s`}
              />
            </circle>
            {lit && (
              <circle r="2.8" fill="#fff">
                <animateMotion
                  dur="2.2s"
                  repeatCount="indefinite"
                  path={`M${na.x},${na.y} L${nb.x},${nb.y}`}
                />
              </circle>
            )}
          </g>
        );
      })}

      {nodes.map((n) => {
        const connected = isConnected(n.id);
        const isCore = n.id === 'core';
        const isActive = active === n.id;
        const dim = active !== null && !connected;

        return (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            onMouseEnter={() => setActive(n.id)}
            onMouseLeave={() => setActive(null)}
            onTouchStart={() => setActive(active === n.id ? null : n.id)}
            style={{ cursor: 'pointer', opacity: dim ? 0.28 : 1, transition: 'opacity 0.4s' }}
          >
            {isCore && <circle r={n.r + 18} fill={n.accent} opacity="0.10" filter="url(#soft)" />}
            {isActive && !isCore && <circle r={n.r + 12} fill={n.accent} opacity="0.16" filter="url(#nodeGlow)" />}

            <circle
              r={n.r}
              fill="#fbf6ea"
              stroke={n.accent}
              strokeWidth={isCore ? 2.4 : 1.7}
              className={isCore ? 'animate-pulse-node' : ''}
              style={{ transition: 'r 0.3s, stroke-width 0.3s' }}
            />
            <circle r={isCore ? 8 : 4.5} fill={n.accent} opacity={isActive ? 1 : 0.85} />

            <text
              textAnchor="middle"
              y={isCore ? 4 : n.r + 18}
              className="font-display"
              fill="#1E1E1E"
              style={{
                fontSize: isCore ? 17 : 13,
                fontWeight: isCore ? 600 : 500,
                transition: 'fill 0.3s',
              }}
            >
              {n.label}
            </text>

            <text
              textAnchor="middle"
              y={isCore ? n.r + 22 : n.r + 32}
              className="font-sans"
              fill="#6b655b"
              style={{
                fontSize: 8.5,
                letterSpacing: isCore ? '0.18em' : '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {n.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
