'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, Newspaper, RefreshCw, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type PrelimsItem = {
  _id: string;
  title: string;
  description: string;
  link: string;
  sourceKey: string;
  runDateKey: string;
  contentHtml: string;
  createdAt: string;
};

export default function PrelimsNewsPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<PrelimsItem[]>([]);
  const [dates, setDates] = useState<{ _id: string; count: number }[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchDates = async () => {
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.get('/prelims/dates');
      const d = res.data?.dates || [];
      setDates(d);
      if (d.length && !selectedDate) setSelectedDate(d[0]._id);
    } catch {}
  };

  const fetchItems = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.get(`/prelims/items?dateKey=${selectedDate}`);
      setItems(res.data?.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchDates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (selectedDate) fetchItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-ink-400 text-sm hover:text-crimson transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-crimson" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-ink-100">Daily Prelims News</h1>
            <p className="text-ink-400 text-sm">UPSC Prelims current affairs from Vajiram</p>
          </div>
        </div>
      </div>

      {/* Date selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Calendar className="w-4 h-4 text-ink-500" />
        {dates.map((d) => (
          <button
            key={d._id}
            onClick={() => setSelectedDate(d._id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
              selectedDate === d._id
                ? 'bg-crimson/10 border-crimson/40 text-crimson'
                : 'bg-ink-900/50 border-ink-600/20 text-ink-500 hover:border-ink-500/30'
            }`}
          >
            {d._id}
          </button>
        ))}
        {dates.length === 0 && !loading && (
          <span className="text-ink-500 text-xs italic">No dates available — load some articles first</span>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-ink-900/50 rounded-2xl p-6 border border-ink-600/20">
              <div className="h-5 bg-ink-800/50 rounded w-3/4 mb-3" />
              <div className="h-3 bg-ink-800/50 rounded w-1/2 mb-2" />
              <div className="h-20 bg-ink-800/50 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper className="w-8 h-8 text-ink-500 mx-auto mb-3" />
          <p className="text-ink-400 text-sm">No prelims articles for this date.</p>
          <p className="text-ink-500 text-xs mt-1">Load articles from the admin panel first.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-ink-900/50 border border-ink-600/20 rounded-2xl p-5 hover:border-ink-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-ink-100 font-bold text-base leading-snug flex-1 min-w-0">
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" className="hover:text-crimson hover:underline transition-colors">
                      {item.title}
                      <ExternalLink className="w-3 h-3 inline ml-1 text-ink-500" />
                    </a>
                  ) : (
                    item.title
                  )}
                </h2>
              </div>

              {item.description && (
                <p className="text-ink-400 text-sm mt-2 line-clamp-2">{item.description}</p>
              )}

              {item.contentHtml && (
                <div className="mt-3">
                  <button
                    onClick={() => setExpanded(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                    className="inline-flex items-center gap-1.5 text-ink-500 text-xs font-bold uppercase tracking-wider hover:text-crimson transition-colors"
                  >
                    {expanded[item._id] ? 'Hide details' : 'Show details'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${expanded[item._id] ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-in-out ${expanded[item._id] ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div
                        className="p-4 bg-ink-900/70 rounded-xl border border-ink-600/10 text-ink-300 text-sm leading-relaxed [&_h2]:text-crimson [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-ink-100 [&_h3]:font-bold [&_h3]:text-sm [&_h3]:mt-2 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_strong]:text-ink-100"
                        dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
