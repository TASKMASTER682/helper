'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const fallbackEditorials = [
  {
    category: 'Governance',
    title: 'The Quiet Federalism of the Finance Commission',
    dek: 'How a constitutional body, meeting once in five years, redraws the financial geography of the Republic.',
    date: 'Today',
    read: '12 min',
  },
  {
    category: 'Economy',
    title: 'The Rupee, the Reserve, and the Real Economy',
    dek: 'A framework for reading monetary policy beyond the repo rate.',
    date: 'Yesterday',
    read: '9 min',
  },
  {
    category: 'Heritage',
    title: 'Reading the Palm-Leaf Archive',
    dek: 'What ancient manuscripts teach us about the continuity of Indian knowledge systems.',
    date: 'This week',
    read: '14 min',
  },
  {
    category: 'Geography',
    title: 'The Himalaya and the Hydrology of Risk',
    dek: 'Climate, terrain, and the governance of mountain states.',
    date: 'This week',
    read: '11 min',
  },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const oneDay = 86400000;
  if (diff < oneDay) return 'Today';
  if (diff < 2 * oneDay) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function AgonEditorial() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/editorial-engine/public/latest`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.items?.length) setItems(data.items);
      })
      .catch(() => {});
  }, []);

  const sourceLabels = { legacyias: 'PIB' };

  const editorials = items?.length
    ? items.map((i) => ({
        category: sourceLabels[i.sourceKey] || i.sourceKey?.replace(/_/g, ' ') || 'Editorial',
        title: i.title,
        dek: i.description || '',
        date: formatDate(i.publishedAt || i.runDateKey),
        read: `${Math.max(3, Math.ceil((i.description?.length || 100) / 200))} min`,
      }))
    : fallbackEditorials;

  return (
    <section id="editorial" className="relative paper-bg grain py-20 sm:py-24" aria-label="Editorial highlights">
      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-14 sm:mb-18">
          <div className="lg:col-span-7">
            <p className="eyebrow text-gold-deep mb-5">The Reading Room</p>
            <h2 className="display-hero text-[2.2rem] sm:text-[3rem] lg:text-[3.2rem] text-ink">
              Editorial-grade insight,
              <span className="italic text-teal"> translated into answers.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="font-serif text-lg sm:text-xl text-ink-soft leading-relaxed">
              Museum-level presentation. Your UPSC preparation—structured, connected, and exam-ready.
            </p>
          </div>
        </div>

        <div className="rule-solid mb-12" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {editorials.map((e, idx) => (
            <motion.article
              key={e.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (idx % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="parchment rounded-2xl p-6 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-sans text-[0.58rem] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-deep">
                  {e.category}
                </span>
              </div>
              <h3 className="font-display text-xl text-ink leading-snug mb-2 line-clamp-2">{e.title}</h3>
              <p className="font-serif text-[0.98rem] italic text-ink-soft leading-relaxed mb-5 line-clamp-2">{e.dek}</p>
              <div className="flex items-center justify-between text-[0.65rem] font-sans tracking-[0.18em] uppercase text-ink-mute">
                <span>{e.date}</span>
                <span>{e.read}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
