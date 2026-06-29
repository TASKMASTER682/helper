'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

type AccentKey = 'crimson' | 'teal' | 'gold' | 'ink';

type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  accent: AccentKey;
};

type GraphEdge = { from: string; to: string };

const accentHex: Record<string, string> = {
  crimson: '#A63A3A',
  teal: '#3F7D73',
  gold: '#C8A86B',
  ink: '#1E1E1E',
};

const graphNodes: GraphNode[] = [
  { id: 'polity', label: 'Polity', x: 500, y: 150, r: 34, accent: 'crimson' },
  { id: 'economy', label: 'Economy', x: 760, y: 250, r: 32, accent: 'teal' },
  { id: 'history', label: 'History', x: 250, y: 240, r: 32, accent: 'gold' },
  { id: 'geography', label: 'Geography', x: 180, y: 470, r: 30, accent: 'teal' },
  { id: 'environment', label: 'Environment', x: 420, y: 560, r: 28, accent: 'gold' },
  { id: 'science', label: 'Science', x: 640, y: 540, r: 28, accent: 'gold' },
  { id: 'ethics', label: 'Ethics', x: 800, y: 430, r: 30, accent: 'crimson' },
  { id: 'ir', label: "Int'l Relations", x: 520, y: 300, r: 30, accent: 'teal' },
];

const graphEdges: GraphEdge[] = [
  { from: 'polity', to: 'ir' },
  { from: 'polity', to: 'economy' },
  { from: 'polity', to: 'history' },
  { from: 'economy', to: 'ir' },
  { from: 'economy', to: 'ethics' },
  { from: 'history', to: 'geography' },
  { from: 'history', to: 'polity' },
  { from: 'geography', to: 'environment' },
  { from: 'geography', to: 'science' },
  { from: 'environment', to: 'science' },
  { from: 'ethics', to: 'ir' },
  { from: 'science', to: 'ir' },
];

const nodeBlurbs: Record<string, string> = {
  polity:
    'The architecture of power — from the Preamble to the Panchayat. Every institution, every amendment, every judicial precedent that defines how India governs itself.',
  economy:
    'The flow of money, goods, and policy. Fiscal mathematics, monetary logic, and the lived economy of a billion people — read through frameworks, not headlines.',
  history:
    'The long arc from the Indus to Independence. Not dates to memorise, but currents to understand — how ideas, revolts, and reforms compound into a nation.',
  geography:
    'The physical logic of the subcontinent. Monsoons, mountains, rivers, and soils — the stage upon which every other subject performs.',
  environment:
    'The living systems under pressure. Biodiversity, climate, and the governance of a planet in flux — where science meets policy meets ethics.',
  science:
    'The frontier of the possible. From ISRO to AI, the technologies reshaping governance, security, and the human condition.',
  ethics:
    'The examination of conscience. How a civil servant ought to act — and the philosophical vocabulary to defend the answer.',
  ir:
    'India in the world. Strategic autonomy, multipolarity, and the diplomacy of a rising power in an unsettled order.',
};

export default function AgonKnowledgeGraph() {
  const [active, setActive] = useState<string | null>('ir');

  const activeNode = useMemo(
    () => graphNodes.find((n) => n.id === active) ?? null,
    [active],
  );

  const neighbors = useMemo(() => {
    if (!active) return new Set<string>();
    const s = new Set<string>();
    graphEdges.forEach((e) => {
      if (e.from === active) s.add(e.to);
      if (e.to === active) s.add(e.from);
    });
    return s;
  }, [active]);

  const isLit = (id: string) => active === null || active === id || neighbors.has(id);
  const edgeLit = (from: string, to: string) => active === null || from === active || to === active;

  return (
    <section id="graph" className="relative py-24 sm:py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27180%27 height=%27180%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.4%27/%3E%3C/svg%3E")',
          opacity: 0.5,
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(at 50% 40%, rgba(200,168,107,0.10) 0px, transparent 55%)',
        }}
      />

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="eyebrow text-gold-deep mb-5">The Living Brain</p>
          <h2 className="display-hero text-[2.2rem] sm:text-[3rem] lg:text-[3.6rem] text-ink leading-[0.98]">
            No subject stands <span className="italic text-gold">alone.</span>
          </h2>
          <p className="mt-6 font-serif text-lg sm:text-xl text-ink-soft leading-relaxed">
            The UPSC syllabus is not a list — it is a network. Explore how every domain feeds, conflicts with, and illuminates the others.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="relative aspect-[4/3] w-full">
              <svg viewBox="0 0 1000 720" className="w-full h-full">
                <defs>
                  <filter id="glowG" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="8" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {graphEdges.map((e, i) => {
                  const na = graphNodes.find((n) => n.id === e.from)!;
                  const nb = graphNodes.find((n) => n.id === e.to)!;

                  const lit = edgeLit(e.from, e.to);
                  const dim = active !== null && !lit;

                  return (
                    <g key={i}>
                      <line
                        x1={na.x}
                        y1={na.y}
                        x2={nb.x}
                        y2={nb.y}
                        stroke={lit ? accentHex[na.accent] : '#c8a86b'}
                        strokeOpacity={dim ? 0.06 : lit ? 0.55 : 0.16}
                        strokeWidth={lit ? 1.6 : 0.9}
                        className={lit ? 'dash-flow' : ''}
                        style={{ transition: 'all 0.4s' }}
                      />
                    </g>
                  );
                })}

                {graphNodes.map((n) => {
                  const lit = isLit(n.id);
                  const isActive = active === n.id;
                  const dim = active !== null && !lit;
                  const color = accentHex[n.accent];

                  return (
                    <g
                      key={n.id}
                      transform={`translate(${n.x},${n.y})`}
                      onMouseEnter={() => setActive(n.id)}
                      onMouseLeave={() => setActive(null)}
                      onTouchStart={() => setActive(active === n.id ? null : n.id)}
                      style={{
                        cursor: 'pointer',
                        opacity: dim ? 0.32 : 1,
                        transition: 'opacity 0.4s',
                      }}
                    >
                      {isActive && <circle r={n.r + 16} fill={color} opacity={0.18} filter="url(#glowG)" />}
                      <circle
                        r={n.r}
                        fill="#f5efe1"
                        stroke={color}
                        strokeWidth={isActive ? 2.4 : 1.6}
                        style={{ transition: 'all 0.4s' }}
                      />
                      <circle r={isActive ? 8 : 5} fill={color} opacity={isActive ? 1 : 0.8} />
                      <text
                        textAnchor="middle"
                        y={n.r + 20}
                        className="font-display"
                        fill={isActive ? '#1e1e1e' : '#6b655b'}
                        style={{ fontSize: 14, fontWeight: 500, transition: 'fill 0.4s' }}
                      >
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="lg:col-span-4 order-1 lg:order-2">
            <motion.div
              key={active ?? 'default'}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="glass rounded-2xl p-7 border border-[rgba(168,138,78,0.25)]"
            >
              {activeNode ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-3 h-3 rounded-full" style={{ background: accentHex[activeNode.accent] }} />
                    <span className="eyebrow text-gold">Domain</span>
                  </div>
                  <h3 className="font-display text-3xl text-ink mb-4">{activeNode.label}</h3>
                  <p className="font-serif text-lg text-ink-soft leading-relaxed mb-6">{nodeBlurbs[activeNode.id]}</p>

                  <div className="pt-5 border-t border-[rgba(168,138,78,0.2)]">
                    <p className="font-sans text-[0.62rem] tracking-[0.2em] uppercase text-ink-mute mb-3">
                      Connects to {neighbors.size} domains
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[...neighbors].map((id) => {
                        const nn = graphNodes.find((n) => n.id === id)!;
                        return (
                          <button
                            key={id}
                            onClick={() => setActive(id)}
                            className="font-sans text-[0.72rem] px-3 py-1.5 rounded-full border border-[rgba(168,138,78,0.3)] text-ink-soft hover:bg-crimson/10 hover:text-crimson hover:border-crimson/40 transition-colors"
                          >
                            {nn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <p className="font-serif text-lg text-ink-soft/80">Hover any node to trace its connections.</p>
              )}
            </motion.div>

            <p className="mt-4 text-center font-sans text-[0.68rem] tracking-[0.16em] uppercase text-ink-mute">
              Tap a domain to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
