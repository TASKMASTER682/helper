'use client';

import Link from 'next/link';

const columns = [
  {
    title: 'The Atlas',
    links: ['AI Study Assistant', 'Editorial Analysis', 'PYQ Engine', 'Mains Evaluator', 'Knowledge Graph'],
  },
  {
    title: 'Collections',
    links: ['The Foundations', 'The Mains Method', 'The Personality', 'Optional Subjects', 'Test Series'],
  },
  {
    title: 'The Archive',
    links: ['Daily Editorial', 'Current Affairs', 'Ethics Lab', 'Revision System', 'Fellows'],
  },
  {
    title: 'Institution',
    links: ['About Antaranga', 'Our Mentors', 'Methodology', 'Careers', 'Contact'],
  },
];

export default function AgonFooter() {
  return (
    <footer className="relative bg-ink text-cream/80 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.4] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27180%27 height=%27180%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%270.5%27/%3E%3C/svg%3E")',
        }}
      />
      <div className="relative z-10 max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-cream/12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-5">
              <svg viewBox="0 0 40 40" className="w-9 h-9" aria-hidden="true">
                <circle cx="20" cy="20" r="9" fill="none" stroke="#C8A86B" strokeWidth="1.4" />
                <circle cx="20" cy="20" r="2.4" fill="#A63A3A" />
                <circle cx="20" cy="7" r="1.8" fill="#C8A86B" />
                <circle cx="33" cy="20" r="1.8" fill="#3F7D73" />
                <circle cx="20" cy="33" r="1.8" fill="#C8A86B" />
                <circle cx="7" cy="20" r="1.8" fill="#3F7D73" />
              </svg>
              <div className="flex flex-col leading-none">
                <span className="font-display text-2xl text-cream">Antaranga</span>
                <span className="font-sans text-[0.5rem] tracking-[0.32em] uppercase text-cream/50 mt-1">
                  Civil Services Atlas
                </span>
              </div>
            </div>

            <p className="font-serif text-lg text-cream/65 leading-relaxed max-w-sm">
              An archive and instrument for India&apos;s most intelligent minds. Where preparation becomes understanding.
            </p>
            <p className="mt-6 font-display italic text-xl text-gold">&ldquo;Prepare for the exam that shapes nations.&rdquo;</p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="font-sans text-[0.62rem] tracking-[0.2em] uppercase text-gold mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      {/* keep anchor-style links for later wiring */}
                      <a href="#top" className="font-serif text-[0.98rem] text-cream/65 hover:text-cream transition-colors ink-link">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[0.72rem] tracking-wide text-cream/45">
            © MMXXIV Antaranga. Composed in New Delhi. All rights reserved.
          </p>

          <div className="flex items-center gap-6 font-sans text-[0.72rem] tracking-wide text-cream/45">
            <Link href="/privacy" className="hover:text-cream transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-cream transition-colors">
              Terms
            </Link>
            <a href="#top" className="hover:text-cream transition-colors">
              UPSC Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
