'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Upload, RefreshCw, FileText, ExternalLink, Edit3,
  BarChart3, BookOpen, Quote, X, Save, Loader2,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  Newspaper, Brain, Clock, Trash2, MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { default as api } from '@/lib/api';
import clsx from 'clsx';

type ApiResponse = {
  success?: boolean;
  analysis?: any;
  upload?: any;
  error?: string;
};

type EditorialItem = {
  _id: string;
  title: string;
  description: string;
  link: string;
  sourceKey: string;
  runDateKey: string;
  publishedAt: string | null;
  speechContent?: string;
  keyPointersContent?: string;
};

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: '7 Days' },
  { key: '1m', label: '1 Month' },
  { key: '6m', label: '6 Months' },
  { key: 'gt6m', label: '>6 Months' },
  { key: 'jk', label: 'J&K' },
] as const;

function ArticleSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-ink-600/20 bg-ink-900/50 animate-pulse space-y-2">
      <div className="h-4 bg-ink-800/50 rounded w-3/4" />
      <div className="h-3 bg-ink-800/30 rounded w-1/4" />
      <div className="h-3 bg-ink-800/30 rounded w-full" />
      <div className="h-3 bg-ink-800/30 rounded w-2/3" />
    </div>
  );
}

function AnalysisCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-ink-600/20 bg-ink-900/50 animate-pulse space-y-4">
      <div className="h-5 bg-ink-800/50 rounded w-1/2" />
      <div className="h-4 bg-ink-800/30 rounded w-1/3" />
      <div className="space-y-2 mt-4 pt-4 border-t border-ink-600/10">
        <div className="h-3.5 bg-ink-800/30 rounded w-full" />
        <div className="h-3.5 bg-ink-800/30 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function EditorialEnginePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  const toggleArticle = (id: string) => {
    setExpandedArticles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const [editingItem, setEditingItem] = useState<EditorialItem | null>(null);
  const [editKeyPointers, setEditKeyPointers] = useState('');
  const [savingContent, setSavingContent] = useState(false);

  const openContentEditor = (item: EditorialItem) => {
    setEditingItem(item);
    setEditKeyPointers(item.keyPointersContent || '');
  };

  const saveContent = async () => {
    if (!editingItem) return;
    setSavingContent(true);
    try {
      await api.put(`/editorial-engine/items/${editingItem._id}/content`, {
        keyPointersContent: editKeyPointers
      });
      setEditingItem(null);
    } catch (e: any) {
      alert('Failed to save: ' + (e?.message || String(e)));
    } finally {
      setSavingContent(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return;
    try {
      await api.delete(`/editorial-engine/items/${id}`);
      setTodayItems((prev) => prev.filter((i) => i._id !== id));
      setYesterdayItems((prev) => prev.filter((i) => i._id !== id));
      setJkItems((prev) => prev.filter((i) => i._id !== id));
    } catch (e: any) {
      alert('Failed to delete: ' + (e?.message || String(e)));
    }
  };

  const [selectedWindow, setSelectedWindow] = useState<'today' | 'yesterday' | '7d' | '1m' | '6m' | 'gt6m' | 'jk'>('today');
  const [analysisFromDB, setAnalysisFromDB] = useState<any>(null);
  const [todayItems, setTodayItems] = useState<EditorialItem[]>([]);
  const [todayItemsLoading, setTodayItemsLoading] = useState(false);
  const [yesterdayItems, setYesterdayItems] = useState<EditorialItem[]>([]);
  const [yesterdayItemsLoading, setYesterdayItemsLoading] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);
  const [jkItems, setJkItems] = useState<EditorialItem[]>([]);
  const [jkItemsLoading, setJkItemsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    if (selectedWindow !== 'today') loadAnalysisForWindow(selectedWindow);
    fetchTodayItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAnalysisForWindow = async (windowType: string) => {
    if (!user) return;
    setLoadingAnalysis(true);
    try {
      const res = await api.get(`/editorial-engine/analysis/${windowType}`);
      setAnalysisFromDB(res.data?.analysis || null);
    } catch {
      setAnalysisFromDB(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchTodayItems = async (dateKey?: string) => {
    setTodayItemsLoading(true);
    try {
      const url = dateKey
        ? `/editorial-engine/items?dateKey=${dateKey}`
        : '/editorial-engine/items/today';
      const res = await api.get(url);
      setTodayItems(res.data?.items || []);
      if (res.data?.dateKey) setLastRunDate(res.data.dateKey);
    } catch {
      setTodayItems([]);
    } finally {
      setTodayItemsLoading(false);
    }
  };

  const fetchYesterdayItems = async () => {
    setYesterdayItemsLoading(true);
    try {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const yesterdayKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const res = await api.get(`/editorial-engine/items?dateKey=${yesterdayKey}`);
      setYesterdayItems(res.data?.items || []);
    } catch {
      setYesterdayItems([]);
    } finally {
      setYesterdayItemsLoading(false);
    }
  };

  const fetchJKItems = async () => {
    setJkItemsLoading(true);
    try {
      const res = await api.get('/editorial-engine/items/jk');
      setJkItems(res.data?.items || []);
    } catch {
      setJkItems([]);
    } finally {
      setJkItemsLoading(false);
    }
  };

  const runUploadDay = async () => {
    if (!file) {
      setResult({ error: 'Upload JSON file required' });
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await api.post('/editorial-engine/upload-day', json);

      setResult(res.data as ApiResponse);
      const uploadedDateKey = res.data?.upload?.runDateKey;
      fetchTodayItems(uploadedDateKey);
      if (selectedWindow !== 'today') loadAnalysisForWindow(selectedWindow);
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        String(e);
      setResult({ error: msg });
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <AlertCircle className="w-10 h-10 text-crimson mb-3" aria-hidden="true" />
        <div className="text-crimson font-black text-lg">Admin access required</div>
        <div className="text-ink-400 text-sm mt-2">Editorial upload is restricted.</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-100 flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-crimson" aria-hidden="true" />
            Editorial Engine
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            Upload daily editorial JSON for AI repetition analysis.
          </p>
        </div>
      </div>

      {/* ── Upload Card ────────────────────────────────────── */}
      <div className="bg-ink-900/60 border border-ink-600/20 rounded-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 w-full sm:w-auto">
            <label htmlFor="editorial-json" className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">
              JSON File
            </label>
            <input
              id="editorial-json"
              type="file"
              accept="application/json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-ink-600/40 file:bg-ink-800 file:text-ink-200 file:text-sm file:font-semibold hover:file:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
              aria-label="Upload daily JSON file (news_feed.json format)"
            />
          </div>
          <button
            onClick={runUploadDay}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crimson text-white font-bold text-sm hover:bg-crimson-deep transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
            aria-label={loading ? 'Processing upload…' : 'Upload and analyze'}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Processing…</>
            ) : (
              <><Upload className="w-4 h-4" aria-hidden="true" /> Upload &amp; Analyze</>
            )}
          </button>
        </div>

        {result?.error && (
          <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-ink-200 text-sm flex items-start gap-3" role="alert">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{result.error}</span>
          </div>
        )}

        {result?.success && result?.upload && (
          <div className="mt-4 p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 text-ink-200 text-sm flex items-start gap-3" role="status">
            <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{result.upload.savedCount} articles saved for {result.upload.runDateKey}.</span>
          </div>
        )}
      </div>

      {/* ── Unified Tabbed Component ──────────────────────────── */}
      <div className="bg-ink-900/60 border border-ink-600/20 rounded-2xl overflow-hidden">
        {/* Tab Bar */}
        <div className="flex items-center border-b border-ink-600/10 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedWindow(tab.key as typeof selectedWindow);
                if (tab.key === 'yesterday') fetchYesterdayItems();
                else if (tab.key === 'jk') fetchJKItems();
                else if (tab.key !== 'today') loadAnalysisForWindow(tab.key);
              }}
              className={clsx(
                'px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-crimson/50',
                (tab.key === 'today' ? selectedWindow === 'today' : selectedWindow === tab.key)
                  ? 'text-crimson'
                  : 'text-ink-400 hover:text-ink-200'
              )}
              role="tab"
              aria-selected={tab.key === 'today' ? selectedWindow === 'today' : selectedWindow === tab.key}
            >
              {(tab.key === 'today' ? selectedWindow === 'today' : selectedWindow === tab.key) && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-crimson rounded-full" />
              )}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Today ──────────────────────────────────────── */}
        {selectedWindow === 'today' ? (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal" aria-hidden="true" />
                Today&rsquo;s Articles
              </h2>
              <button
                onClick={() => fetchTodayItems()}
                disabled={todayItemsLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson hover:text-crimson-deep transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded-lg px-2 py-1"
                aria-label={todayItemsLoading ? 'Refreshing…' : 'Refresh articles'}
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', todayItemsLoading && 'animate-spin')} aria-hidden="true" />
                {todayItemsLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {todayItemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Loading articles">
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </div>
            ) : todayItems.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-8 h-8 text-ink-500 mx-auto mb-3" aria-hidden="true" />
                <p className="text-ink-400 text-sm">No articles for today.</p>
                <p className="text-ink-500 text-xs mt-1">Upload a JSON file to add articles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayItems.map((item) => (
                  <article
                    key={item._id}
                    className="p-5 rounded-xl border border-ink-600/20 bg-ink-800/40 hover:bg-ink-800/60 transition-colors"
                  >
                    <Link
                      href={`/dashboard/editorial-engine/article/${item._id}`}
                      className="text-crimson font-bold text-[15px] leading-snug line-clamp-2 hover:text-crimson-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-ink-500 text-xs font-semibold uppercase tracking-wider">
                        {item.sourceKey}
                      </span>
                      <span className="text-ink-600 text-xs" aria-hidden="true">·</span>
                      <Clock className="w-3.5 h-3.5 text-ink-500" aria-hidden="true" />
                      <span className="text-ink-500 text-xs">
                        {item.runDateKey}
                      </span>
                    </div>
                    {item.description && (
                      <div className="mt-2.5">
                        <p className={clsx(
                          'text-ink-400 text-sm leading-relaxed',
                          !expandedArticles.has(item._id) && 'line-clamp-2'
                        )}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ink-600/10">
                      <button
                        onClick={() => openContentEditor(item)}
                        className="inline-flex items-center gap-1 text-crimson text-xs font-bold uppercase tracking-wider hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" /> Edit
                      </button>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-ink-400 text-xs font-bold uppercase tracking-wider hover:text-crimson hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> View
                      </a>
                      <button
                        onClick={() => handleDeleteArticle(item._id)}
                        className="inline-flex items-center gap-1 text-ink-500 text-xs font-bold uppercase tracking-wider hover:text-crimson hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : selectedWindow === 'yesterday' ? (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal" aria-hidden="true" />
                Yesterday&rsquo;s Articles
              </h2>
              <button
                onClick={() => fetchYesterdayItems()}
                disabled={yesterdayItemsLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson hover:text-crimson-deep transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded-lg px-2 py-1"
                aria-label={yesterdayItemsLoading ? 'Refreshing…' : 'Refresh articles'}
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', yesterdayItemsLoading && 'animate-spin')} aria-hidden="true" />
                {yesterdayItemsLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {yesterdayItemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Loading articles">
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </div>
            ) : yesterdayItems.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-8 h-8 text-ink-500 mx-auto mb-3" aria-hidden="true" />
                <p className="text-ink-400 text-sm">No articles from yesterday.</p>
                <p className="text-ink-500 text-xs mt-1">Upload a JSON file to add articles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {yesterdayItems.map((item) => (
                  <article
                    key={item._id}
                    className="p-5 rounded-xl border border-ink-600/20 bg-ink-800/40 hover:bg-ink-800/60 transition-colors"
                  >
                    <Link
                      href={`/dashboard/editorial-engine/article/${item._id}`}
                      className="text-crimson font-bold text-[15px] leading-snug line-clamp-2 hover:text-crimson-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded"
                    >
                      {item.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-ink-500 text-xs font-semibold uppercase tracking-wider">
                        {item.sourceKey}
                      </span>
                      <span className="text-ink-600 text-xs" aria-hidden="true">·</span>
                      <Clock className="w-3.5 h-3.5 text-ink-500" aria-hidden="true" />
                      <span className="text-ink-500 text-xs">
                        {item.runDateKey}
                      </span>
                    </div>
                    {item.description && (
                      <div className="mt-2.5">
                        <p className={clsx(
                          'text-ink-400 text-sm leading-relaxed',
                          !expandedArticles.has(item._id) && 'line-clamp-2'
                        )}>
                          {item.description}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ink-600/10">
                      <button
                        onClick={() => openContentEditor(item)}
                        className="inline-flex items-center gap-1 text-crimson text-xs font-bold uppercase tracking-wider hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" aria-hidden="true" /> Edit
                      </button>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-ink-400 text-xs font-bold uppercase tracking-wider hover:text-crimson hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> View
                      </a>
                      <button
                        onClick={() => handleDeleteArticle(item._id)}
                        className="inline-flex items-center gap-1 text-ink-500 text-xs font-bold uppercase tracking-wider hover:text-crimson hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : selectedWindow === 'jk' ? (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-ink-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" aria-hidden="true" />
                Jammu &amp; Kashmir — All Related Articles
              </h2>
              <button
                onClick={() => fetchJKItems()}
                disabled={jkItemsLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-crimson hover:text-crimson-deep transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded-lg px-2 py-1"
                aria-label={jkItemsLoading ? 'Refreshing…' : 'Refresh articles'}
              >
                <RefreshCw className={clsx('w-3.5 h-3.5', jkItemsLoading && 'animate-spin')} aria-hidden="true" />
                {jkItemsLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {jkItemsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Loading articles">
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </div>
            ) : jkItems.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-8 h-8 text-ink-500 mx-auto mb-3" aria-hidden="true" />
                <p className="text-ink-400 text-sm">No J&amp;K-related articles found.</p>
                <p className="text-ink-500 text-xs mt-1">Articles with J&amp;K mentions in headings or title will appear here.</p>
              </div>
            ) : (
              <>
                <p className="text-ink-500 text-xs font-bold uppercase tracking-widest mb-3">
                  {jkItems.length} article{jkItems.length !== 1 && 's'} found
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jkItems.map((item) => (
                    <article
                      key={item._id}
                      className="p-5 rounded-xl border border-amber-500/10 bg-ink-800/40 hover:bg-ink-800/60 transition-colors"
                    >
                      <Link
                        href={`/dashboard/editorial-engine/article/${item._id}`}
                        className="text-crimson font-bold text-[15px] leading-snug line-clamp-2 hover:text-crimson-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded"
                      >
                        {item.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-ink-500 text-xs font-semibold uppercase tracking-wider">
                          {item.sourceKey}
                        </span>
                        <span className="text-ink-600 text-xs" aria-hidden="true">·</span>
                        <Clock className="w-3.5 h-3.5 text-ink-500" aria-hidden="true" />
                        <span className="text-ink-500 text-xs">
                          {item.runDateKey}
                        </span>
                      </div>
                      {item.description && (
                        <div className="mt-2.5">
                          <p className={clsx(
                            'text-ink-400 text-sm leading-relaxed',
                            !expandedArticles.has(item._id) && 'line-clamp-2'
                          )}>
                            {item.description}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-ink-600/10">
                        <button
                          onClick={() => openContentEditor(item)}
                          className="inline-flex items-center gap-1 text-crimson text-xs font-bold uppercase tracking-wider hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" /> Edit
                        </button>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-ink-400 text-xs font-bold uppercase tracking-wider hover:text-crimson hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> View
                        </a>
                        <button
                          onClick={() => handleDeleteArticle(item._id)}
                          className="inline-flex items-center gap-1 text-ink-500 text-xs font-bold uppercase tracking-wider hover:text-crimson hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1 ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-5">
            <h2 className="font-bold text-ink-100 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-crimson" aria-hidden="true" />
              Category-wise Repeats &mdash;{' '}
              <span className="text-ink-400 font-normal">{TABS.find(t => t.key === selectedWindow)?.label}</span>
            </h2>

            {loadingAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Loading analysis">
                <AnalysisCardSkeleton />
                <AnalysisCardSkeleton />
                <AnalysisCardSkeleton />
                <AnalysisCardSkeleton />
              </div>
            ) : Array.isArray(analysisFromDB?.results) && analysisFromDB.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisFromDB.results
                  .filter((r: any) => r?.topicLabel)
                  .sort((a: any, b: any) => (b.repeatCount || 0) - (a.repeatCount || 0))
                  .map((topic: any, idx: number) => (
                    <div
                      key={`${topic.topicLabel}-${idx}`}
                      className="p-6 rounded-xl border border-ink-600/20 bg-ink-800/40 hover:bg-ink-800/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-ink-100 font-bold text-lg leading-snug break-words">
                            {(() => {
                              const firstLink = topic.comprehensiveLinks?.[0];
                              const href = firstLink?._id
                                ? `/dashboard/editorial-engine/article/${firstLink._id}`
                                : firstLink?.link || null;
                              return href
                                ? <Link href={href} className="hover:text-crimson hover:underline transition-colors">{topic.topicLabel}</Link>
                                : topic.topicLabel;
                            })()}
                          </h3>
                          {topic.category && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-crimson/10 text-crimson text-[10px] font-bold uppercase tracking-wider mt-1">
                              {topic.category}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Brain className="w-4 h-4 text-ink-500" aria-hidden="true" />
                            <span className="text-ink-400 text-base">
                              Repeat Count: <span className="text-amber-500 font-bold tabular-nums">{topic.repeatCount ?? 0}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {Array.isArray(topic.comprehensiveLinks) && topic.comprehensiveLinks.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-ink-600/10">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-ink-500 text-xs font-bold uppercase tracking-wider">Top links</span>
                            <span className="text-ink-500 text-xs tabular-nums">
                              {(() => {
                                const sources = topic.comprehensiveLinks.map((l: any) => l.sourceKey).filter(Boolean);
                                const counts: Record<string, number> = {};
                                sources.forEach((s: string) => { counts[s] = (counts[s] || 0) + 1; });
                                return Object.entries(counts).map(([s, c]) => `${s}(${c})`).join(', ');
                              })()}
                            </span>
                          </div>
                          <ul className="space-y-2.5">
                            {topic.comprehensiveLinks.slice(0, 4).map((l: any, i: number) => (
                              <li key={`${l._id || l.link}-${i}`}>
                                <div className="flex items-start justify-between gap-2">
                                  {l._id ? (
                                    <Link
                                      href={`/dashboard/editorial-engine/article/${l._id}`}
                                      className="text-crimson text-[15px] font-semibold leading-snug line-clamp-2 hover:text-crimson-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded flex-1 min-w-0"
                                    >
                                      {l.title || 'Untitled'}
                                    </Link>
                                  ) : (
                                    <span className="text-ink-300 text-[15px] font-semibold leading-snug line-clamp-2 flex-1 min-w-0">
                                      {l.title || 'Untitled'}
                                    </span>
                                  )}
                                  {l.link && (
                                    <a
                                      href={l.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="shrink-0 inline-flex items-center gap-1 text-ink-500 text-[10px] font-bold uppercase tracking-wider hover:text-crimson transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded px-1.5 py-0.5 mt-0.5"
                                    >
                                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                    </a>
                                  )}
                                </div>
                                {l.sourceKey && (
                                  <span className="text-ink-500 text-xs uppercase mt-0.5 block">
                                    {l.sourceKey}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {topic.rationale && (
                        <p className="text-ink-400 text-sm mt-4 italic leading-relaxed border-t border-ink-600/10 pt-4">
                          <Quote className="w-3.5 h-3.5 text-ink-500 inline mr-1" aria-hidden="true" />
                          {topic.rationale}
                        </p>
                      )}

                      {Array.isArray(topic.subTopics) && topic.subTopics.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {topic.subTopics.map((st: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-ink-700/30 text-ink-400 text-[10px] font-semibold">
                              {st}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-8 h-8 text-ink-500 mx-auto mb-3" aria-hidden="true" />
                <p className="text-ink-400 text-sm">No results for this window.</p>
                <p className="text-ink-500 text-xs mt-1">Upload a JSON file to generate analysis.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Content Editor Modal ─────────────────────────────── */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setEditingItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Content editor"
        >
          <div
            className="bg-ink-950 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-ink-600/20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-ink-600/10 shrink-0">
              <h2 className="text-ink-100 font-bold text-lg truncate pr-4">{editingItem.title}</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-xl text-ink-400 hover:text-ink-100 hover:bg-ink-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
                aria-label="Close editor"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              <div>
                <label htmlFor="edit-key-pointers" className="text-ink-400 text-xs font-bold uppercase tracking-wider block mb-2">
                  Key Pointers for Mains (HTML)
                </label>
                <textarea
                  id="edit-key-pointers"
                  value={editKeyPointers}
                  onChange={(e) => setEditKeyPointers(e.target.value)}
                  className="w-full h-40 bg-ink-900 border border-ink-600/20 rounded-xl p-4 text-ink-200 text-sm font-mono leading-relaxed resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
                  placeholder="<ul><li>Key pointer 1…</li></ul>"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-ink-600/10 shrink-0">
              <button
                onClick={() => setEditingItem(null)}
                className="px-5 py-2.5 rounded-xl text-ink-400 text-sm font-semibold hover:bg-ink-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
              >
                Cancel
              </button>
              <button
                onClick={saveContent}
                disabled={savingContent}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson text-white font-bold text-sm hover:bg-crimson-deep transition-all active:scale-[0.97] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
              >
                {savingContent ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Saving…</> : <><Save className="w-4 h-4" aria-hidden="true" /> Save Content</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Debug ──────────────────────────────────────────── */}
      {result && (
        <details className="group border border-ink-600/10 rounded-xl bg-ink-900/30">
          <summary className="cursor-pointer text-ink-500 text-xs font-bold uppercase tracking-wider px-5 py-3 hover:text-ink-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50 rounded-xl">
            Debug (raw response)
          </summary>
          <pre className="text-xs text-ink-400 whitespace-pre-wrap overflow-auto max-h-48 p-5 border-t border-ink-600/10 font-mono leading-relaxed">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
