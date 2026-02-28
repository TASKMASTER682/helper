'use client';

import { useEffect, useMemo, useState } from 'react';
import { mockTestAPI, testsAPI } from '@/lib/api';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  FlaskConical,
  Plus,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type Attempt = {
  _id?: string;
  testName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpent: number;
  weakTopics: string[];
  strongTopics: string[];
  createdAt?: string;
  date?: string;
  submittedAt?: string;
  testId?: string;
};

type TestSeries = {
  _id: string;
  name: string;
  provider?: string;
  type?: string;
  totalTests?: number;
  attempts: Attempt[];
};

const TEST_TYPES = ['prelims', 'mains', 'sectional', 'full_length', 'csat'];

const toNum = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const normalizePercentage = (raw: any) => {
  const pct = toNum(raw?.percentage);
  const score = toNum(raw?.score);
  const maxFromMarks = toNum(raw?.totalMarks || raw?.maxScore);
  const derived = maxFromMarks > 0 ? (score / maxFromMarks) * 100 : 0;

  if (pct > 1 || pct < 0) return clamp(pct, 0, 100);
  if (pct > 0 && pct <= 1) return clamp(pct * 100, 0, 100);
  if (pct === 0 && derived > 0) return clamp(derived, 0, 100);
  return clamp(pct, 0, 100);
};

const normalizeAttempt = (raw: any, _index: number): Attempt => {
  const weak = Array.isArray(raw?.weakTopics)
    ? raw.weakTopics
    : Array.isArray(raw?.weakAreas)
      ? raw.weakAreas
      : [];

  const strong = Array.isArray(raw?.strongTopics)
    ? raw.strongTopics
    : Array.isArray(raw?.aiFeedback?.summary?.strengths)
      ? raw.aiFeedback.summary.strengths
      : [];

  const linkedTestId = raw?.mockTestId?._id || raw?.mockTestId || raw?.testId;

  return {
    _id: raw?._id ? String(raw._id) : undefined,
    testName: raw?.testName || raw?.mockTestId?.name || '',
    score: toNum(raw?.score),
    totalMarks: toNum(raw?.totalMarks || raw?.maxScore),
    percentage: normalizePercentage(raw),
    timeSpent: toNum(raw?.timeSpent || raw?.timeTakenMinutes),
    weakTopics: weak.filter(Boolean),
    strongTopics: strong.filter(Boolean),
    createdAt: raw?.createdAt,
    date: raw?.date,
    submittedAt: raw?.submittedAt,
    testId: linkedTestId ? String(linkedTestId) : undefined,
  };
};

const dedupeAttempts = (items: Attempt[]) => {
  const seen = new Set<string>();
  const result: Attempt[] = [];

  for (const item of items) {
    const key = item._id || `${item.testName}-${item.date || item.submittedAt || item.createdAt || ''}-${item.score}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
};

export default function TestsPage() {
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [attemptForm, setAttemptForm] = useState<{ seriesId: string } | null>(null);

  const [typeFilter, setTypeFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  const [newSeries, setNewSeries] = useState({ name: '', provider: '', type: 'prelims', totalTests: '' as string | number });
  const [attemptData, setAttemptData] = useState({
    testName: '', score: '', totalMarks: '100', weakTopics: '', strongTopics: '', timeSpent: '',
  });

  useEffect(() => { 
    console.log('Tests page: Checking authentication status');
    const token = localStorage.getItem('upsc_token');
    const user = localStorage.getItem('upsc_user');
    console.log('Tests page: Token exists:', !!token);
    console.log('Tests page: User exists:', !!user);
    loadData(); 
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Tests page: Starting data load...');

      const [seriesRes, allAttemptsRes] = await Promise.all([
        testsAPI.getSeriesWithAttempts(),
        mockTestAPI.getAllAttempts(),
      ]);

      console.log('Tests page: API responses received');
      console.log('Tests page: Series response:', seriesRes);
      console.log('Tests page: Attempts response:', allAttemptsRes);

      const rawSeries = Array.isArray(seriesRes.data) ? seriesRes.data : [];
      const centralAttempts = Array.isArray(allAttemptsRes.data) ? allAttemptsRes.data : [];
      
      console.log('Tests page: Raw series count:', rawSeries.length);
      console.log('Tests page: Raw attempts count:', centralAttempts.length);
      console.log('Tests page: Raw series data:', rawSeries);
      console.log('Tests page: Raw attempts data:', centralAttempts);

      const centralById = new Map(centralAttempts.map((a: any) => [String(a?._id || ''), a]));
      console.log('Tests page: Central attempts map size:', centralById.size);

      const normalizedSeries: TestSeries[] = rawSeries.map((s: any) => {
        const rawAttempts = Array.isArray(s?.attempts) ? s.attempts : [];

        console.log('Tests page: Processing series:', s.name, 'with', rawAttempts.length, 'manual attempts');
        console.log('Tests page: Series raw attempts:', rawAttempts);

        const normalized = rawAttempts
          .map((a: any, i: number) => {
            const enriched = a?._id ? (centralById.get(String(a._id)) || a) : a;
            console.log('Tests page: Attempt', i, 'enriched:', enriched);
            return normalizeAttempt({ ...enriched, ...a }, i);
          })
          .sort((a: Attempt, b: Attempt) =>
            new Date(a.date || a.submittedAt || a.createdAt || 0).getTime() -
            new Date(b.date || b.submittedAt || b.createdAt || 0).getTime()
          );

        console.log('Tests page: Series', s.name, 'normalized attempts:', normalized.length);
        console.log('Tests page: Series', s.name, 'normalized data:', normalized);

        const deduped = dedupeAttempts(normalized);
        console.log('Tests page: Series', s.name, 'after deduplication:', deduped.length);

        return {
          _id: String(s._id),
          name: s.name,
          provider: s.provider,
          type: s.type,
          totalTests: toNum(s.totalTests) > 0 ? toNum(s.totalTests) : undefined,
          attempts: deduped,
        };
      });

      const flatAttempts = normalizedSeries.flatMap((s) => s.attempts);
      
      console.log('Tests page: Final normalized series count:', normalizedSeries.length);
      console.log('Tests page: Final flat attempts count:', flatAttempts.length);
      console.log('Tests page: Final series data:', normalizedSeries);
      console.log('Tests page: Final attempts data:', flatAttempts);

      // Check if series have attempts
      normalizedSeries.forEach((s, index) => {
        console.log(`Tests page: Series ${index} (${s.name}) has ${s.attempts.length} attempts`);
        if (s.attempts.length > 0) {
          console.log(`Tests page: Series ${index} attempts:`, s.attempts);
        }
      });

      setSeries(normalizedSeries);
      setAttempts(flatAttempts);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      console.error('Fetch Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      toast.error('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeries = async () => {
    if (!newSeries.name.trim()) return toast.error('Name is required');

    try {
      const totalTests = toNum(newSeries.totalTests);
      const payload: any = {
        name: newSeries.name,
        provider: newSeries.provider,
        type: newSeries.type,
      };
      if (totalTests > 0) payload.totalTests = totalTests;

      await testsAPI.addSeries(payload);
      setShowForm(false);
      setNewSeries({ name: '', provider: '', type: 'prelims', totalTests: '' });
      await loadData();
      toast.success('New test series added');
    } catch {
      toast.error('Failed to add series');
    }
  };

  const handleAddAttempt = async () => {
    if (!attemptForm || !attemptData.score) return toast.error('Score is required');

    try {
      const formattedData = {
        ...attemptData,
        score: parseFloat(attemptData.score),
        totalMarks: parseFloat(attemptData.totalMarks),
        timeSpent: parseInt(attemptData.timeSpent, 10) || 0,
        weakTopics: attemptData.weakTopics.split(',').map((t) => t.trim()).filter(Boolean),
        strongTopics: attemptData.strongTopics.split(',').map((t) => t.trim()).filter(Boolean),
      };

      await testsAPI.addAttempt(attemptForm.seriesId, formattedData);
      await loadData();

      setAttemptForm(null);
      setAttemptData({ testName: '', score: '', totalMarks: '100', weakTopics: '', strongTopics: '', timeSpent: '' });
      toast.success('Performance recorded');
    } catch {
      toast.error('Failed to record attempt');
    }
  };

  const handleDeleteSeries = async (id: string) => {
    if (!confirm('Remove this series and all its data?')) return;

    try {
      await testsAPI.deleteSeries(id);
      await loadData();
      toast.success('Series removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const providerOptions = useMemo(() => {
    const values = series.map((s) => (s.provider || '').trim()).filter(Boolean);
    return ['all', ...Array.from(new Set(values))];
  }, [series]);

  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      const typeOk = typeFilter === 'all' || (s.type || '').toLowerCase() === typeFilter;
      const providerOk = providerFilter === 'all' || (s.provider || '') === providerFilter;
      return typeOk && providerOk;
    });
  }, [series, typeFilter, providerFilter]);

  const avgAccuracy = attempts.length
    ? (attempts.reduce((acc, curr) => acc + toNum(curr.percentage), 0) / attempts.length).toFixed(1)
    : '0';

  // Check authentication status for debugging
  const token = localStorage.getItem('upsc_token');
  const user = localStorage.getItem('upsc_user');
  const isAuthenticated = !!token && !!user;

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-7xl mx-auto px-4">
      {!isAuthenticated && (
        <div className="glass-card p-4 border-red-500/30 bg-red-950/10 border-dashed">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <div className="font-semibold">Authentication Required</div>
              <div className="text-sm text-red-500">Please log in to access your test data. The data will appear after successful authentication.</div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Target className="w-10 h-10 text-jade-500" />
            Strategic Test Tracker
          </h1>
          <p className="text-ink-500 text-sm mt-1">Overall analytics, series trends, and diagnosis.</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="glass-card px-6 py-2 border-jade-500/20 bg-jade-500/5">
            <div className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Overall Accuracy</div>
            <div className="text-2xl font-display font-bold text-jade-400">{avgAccuracy}%</div>
            <div className="text-[10px] text-ink-500">{attempts.length} attempts tracked</div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 h-fit">
            <Plus className="w-4 h-4" /> New Series
          </button>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="text-xs uppercase tracking-widest text-ink-500 font-bold">Filters</div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field md:w-48">
          <option value="all">All Types</option>
          {TEST_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
        </select>
        <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} className="input-field md:w-64">
          <option value="all">All Providers</option>
          {providerOptions.filter((p) => p !== 'all').map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="glass-card p-6 border-jade-500/30 animate-scale-in relative">
          <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-ink-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-jade-400">
            <FlaskConical className="w-5 h-5" /> Configure Test Series
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input value={newSeries.name} onChange={(e) => setNewSeries((p) => ({ ...p, name: e.target.value }))} placeholder="Series Name" className="input-field w-full md:col-span-2" />
            <input value={newSeries.provider} onChange={(e) => setNewSeries((p) => ({ ...p, provider: e.target.value }))} placeholder="Provider" className="input-field w-full" />
            <select value={newSeries.type} onChange={(e) => setNewSeries((p) => ({ ...p, type: e.target.value }))} className="input-field w-full">
              {TEST_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleAddSeries} className="btn-primary px-8">Create Tracker</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {attemptForm && (
        <div className="glass-card p-6 border-yellow-500/30 animate-scale-in relative">
          <h3 className="font-display text-lg font-bold mb-4 text-yellow-500">Record Attempt Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={attemptData.testName} onChange={(e) => setAttemptData((p) => ({ ...p, testName: e.target.value }))} placeholder="Test Name/Number" className="input-field w-full" />
            <div className="flex gap-2">
              <input type="number" placeholder="Score" value={attemptData.score} onChange={(e) => setAttemptData((p) => ({ ...p, score: e.target.value }))} className="input-field w-full" />
              <input type="number" placeholder="Out of" value={attemptData.totalMarks} onChange={(e) => setAttemptData((p) => ({ ...p, totalMarks: e.target.value }))} className="input-field w-32" />
            </div>
            <input type="number" placeholder="Time Spent (mins)" value={attemptData.timeSpent} onChange={(e) => setAttemptData((p) => ({ ...p, timeSpent: e.target.value }))} className="input-field w-full" />
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea value={attemptData.weakTopics} onChange={(e) => setAttemptData((p) => ({ ...p, weakTopics: e.target.value }))} placeholder="Weak Topics (Comma separated)" className="input-field w-full h-20 py-2" />
              <textarea value={attemptData.strongTopics} onChange={(e) => setAttemptData((p) => ({ ...p, strongTopics: e.target.value }))} placeholder="Strong Topics (Comma separated)" className="input-field w-full h-20 py-2" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleAddAttempt} className="btn-primary bg-yellow-600 hover:bg-yellow-500 text-ink-950 px-8">Save Analysis</button>
            <button onClick={() => setAttemptForm(null)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Clock className="w-10 h-10 animate-spin text-jade-500" /></div>
      ) : filteredSeries.length === 0 ? (
        <div className="glass-card p-16 text-center border-dashed border-2 border-ink-800">
          <FlaskConical className="w-14 h-14 text-ink-800 mx-auto mb-4" />
          <h3 className="font-display text-xl text-ink-400 mb-2">No matching series</h3>
          <p className="text-ink-600 text-sm">Adjust filters or add a new test series.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredSeries.map((s) => {
            const seriesAttempts = s.attempts || [];
            const lastAttempt = seriesAttempts[seriesAttempts.length - 1];
            const prevAttempt = seriesAttempts[seriesAttempts.length - 2];
            const trend = lastAttempt && prevAttempt ? +(lastAttempt.percentage - prevAttempt.percentage).toFixed(1) : 0;
            const totalTests = toNum(s.totalTests);
            const hasKnownTotal = totalTests > 0;
            const completedTests = new Set(
              seriesAttempts.map((a) => {
                const id = a.testId?.trim();
                if (id) return `id:${id}`;
                const name = (a.testName || '').trim().toLowerCase();
                return name || '__unknown_test__';
              })
            ).size;
            const progress = hasKnownTotal
              ? ((completedTests / totalTests) * 100).toFixed(1)
              : (seriesAttempts.length > 0 ? '100' : '0');
            const avgTime = seriesAttempts.length ? (seriesAttempts.reduce((acc, a) => acc + toNum(a.timeSpent), 0) / seriesAttempts.length).toFixed(0) : '0';

            const chartData = seriesAttempts.map((a, i) => ({
              idx: i + 1,
              name: a.testName || `T${i + 1}`,
              score: +toNum(a.percentage).toFixed(2),
            }));

            return (
              <div key={s._id} className="glass-card overflow-hidden group hover:border-jade-500/30 transition-all duration-300">
                <div className="p-5 flex flex-col md:flex-row justify-between gap-4 border-b border-ink-800/50 bg-ink-900/30">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-jade-500/10 border border-jade-500/20 flex items-center justify-center text-jade-500 font-bold text-lg">
                      {s.type ? s.type[0].toUpperCase() : 'T'}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-ink-100 flex items-center gap-2">
                        {s.name}
                        <span className="text-[10px] px-2 py-0.5 rounded bg-ink-800 text-ink-400 uppercase tracking-tighter">{s.type}</span>
                      </h3>
                      <p className="text-xs text-ink-500">
                        {s.provider || 'Unknown'} - {completedTests}
                        {hasKnownTotal ? ` of ${totalTests}` : ''} tests completed - {seriesAttempts.length} attempts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAttemptForm({ seriesId: s._id })} className="btn-primary py-1.5 px-4 text-xs">+ Record Test</button>
                    <button onClick={() => handleDeleteSeries(s._id)} className="p-2 text-ink-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-1 w-full bg-ink-800">
                  <div className="h-full bg-jade-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 h-64">
                    {seriesAttempts.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2d2820" vertical={false} />
                          <XAxis dataKey="idx" stroke="#6b5e52" fontSize={10} tickMargin={10} />
                          <YAxis domain={[0, 100]} stroke="#6b5e52" fontSize={10} />
                          <Tooltip
                            formatter={(value: any) => [`${value}%`, 'Score']}
                            labelFormatter={(label) => `Attempt #${label}`}
                            contentStyle={{ background: '#1a1612', border: '1px solid #3d3124', borderRadius: '12px', fontSize: '12px' }}
                            itemStyle={{ color: '#10b981' }}
                          />
                          <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 3 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-ink-700 bg-ink-900/20 rounded-xl border border-dashed border-ink-800">
                        <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                        <span className="text-xs uppercase tracking-widest font-bold">Waiting for first attempt</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {lastAttempt ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-ink-900/50 border border-ink-800">
                            <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">Latest Score</div>
                            <div className="text-2xl font-display font-bold text-ink-100">{lastAttempt.percentage.toFixed(1)}%</div>
                          </div>
                          <div className="p-3 rounded-xl bg-ink-900/50 border border-ink-800">
                            <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">Momentum</div>
                            <div className={clsx('flex items-center gap-1 text-lg font-bold', trend >= 0 ? 'text-jade-400' : 'text-red-400')}>
                              {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {Math.abs(trend)}%
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-ink-900/50 border border-ink-800">
                          <div className="text-[10px] uppercase font-bold text-ink-500 mb-1">Time Management</div>
                          <div className="text-sm text-ink-300">Latest: {toNum(lastAttempt.timeSpent)} min</div>
                          <div className="text-xs text-ink-500">Average: {avgTime} min</div>
                        </div>

                        {lastAttempt.weakTopics?.length > 0 && (
                          <div className="p-3 rounded-xl bg-red-950/10 border border-red-900/20">
                            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-red-500 mb-2">
                              <AlertTriangle className="w-3 h-3" /> Areas of Concern
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {lastAttempt.weakTopics.slice(0, 5).map((t) => (
                                <span key={t} className="px-2 py-0.5 bg-red-900/20 text-red-400 text-[10px] rounded border border-red-900/30">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {lastAttempt.strongTopics?.length > 0 && (
                          <div className="p-3 rounded-xl bg-jade-900/10 border border-jade-900/20">
                            <div className="text-[10px] uppercase font-bold text-jade-400 mb-2">Strong Topics</div>
                            <div className="flex flex-wrap gap-1">
                              {lastAttempt.strongTopics.slice(0, 5).map((t) => (
                                <span key={t} className="px-2 py-0.5 bg-jade-900/20 text-jade-300 text-[10px] rounded border border-jade-900/30">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-500 italic bg-ink-900/10 rounded-xl border border-ink-800/30">
                        Analysis will appear after your first recorded attempt.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
