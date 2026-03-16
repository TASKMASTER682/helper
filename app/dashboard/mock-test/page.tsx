'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { mockTestAPI, testsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Upload, FileText, CheckCircle2, AlertCircle, Clock, Brain,
  Loader2, Trash2, Play, BarChart3, Plus, X, TrendingUp,
  Target, Zap, BookOpen, ChevronUp, ChevronDown,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SUBJECTS_LIST = [
  'History', 'Geography', 'Polity', 'Economy', 'Environment',
  'Science & Technology', 'Current Affairs', 'Internal Security',
  'Ethics', 'CSAT', 'International Relations', 'Social Issues'
];

type Status = 'uploading' | 'processing' | 'ready' | 'error';

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string; icon: any }> = {
  uploading: { label: 'Uploading', color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40', icon: Loader2 },
  processing: { label: 'Extracting Key', color: 'text-deep-400', bg: 'bg-deep-900/20 border-deep-800/40', icon: Loader2 },
  ready: { label: 'Ready', color: 'text-teal-400', bg: 'bg-teal-900/20 border-teal-800/40', icon: CheckCircle2 },
  error: { label: 'Error', color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/40', icon: AlertCircle }
};

const TEST_TYPES = [
  { value: 'prelims_gs', label: 'Prelims GS' },
  { value: 'prelims_csat', label: 'Prelims CSAT' },
  { value: 'sectional', label: 'Sectional' },
  { value: 'full_length', label: 'Full Length' },
];

const PIE_COLORS = ['#12b97a', '#ef4444', '#4b5563'];

const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #332b21; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4a3f31; }
`;

export default function MockTestPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [tab, setTab] = useState<'tests' | 'analytics'>('tests');
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  const [startConfig, setStartConfig] = useState<{ id: string, time: number } | null>(null);

  const [testPdf, setTestPdf] = useState<File | null>(null);
  const [answerKeyText, setAnswerKeyText] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '', testType: 'prelims_gs', totalQuestions: '100',
    durationMinutes: '120', markCorrect: '2.0', markWrong: '-0.66',
    subject: '',
    topics: '',
    year: new Date().getFullYear().toString(),
  });
  const [uploading, setUploading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({ subject: '', year: '', mode: '' });
  const [availableFilters, setAvailableFilters] = useState({ subjects: [] as string[], years: [] as number[] });

  useEffect(() => {
    loadAll();
    loadFilters();
  }, [filters]);

  const loadFilters = async () => {
    try {
      const { data } = await mockTestAPI.getFilters();
      setAvailableFilters(data);
    } catch { }
  };

  useEffect(() => {
    const processing = tests.filter(t => t.status === 'processing' || t.status === 'uploading');
    if (!processing.length) return;
    const iv = setInterval(async () => {
      for (const t of processing) {
        try {
          const { data } = await mockTestAPI.pollStatus(t._id);
          if (data.status !== t.status) {
            setTests(prev => prev.map(x =>
              x._id === t._id
                ? { ...x, status: data.status, answerKeyCount: data.answerKeyCount, processingError: data.error }
                : x
            ));
            if (data.status === 'ready') {
              toast.success(`"${t.name}" ready — ${data.answerKeyCount} answers extracted`);
            }
          }
        } catch { }
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [tests]);

  useEffect(() => {
    const readyTests = tests.filter(t => t.status === 'ready' && t.questionTextExtractionStatus !== 'completed');
    if (!readyTests.length) return;

    const iv = setInterval(async () => {
      for (const t of readyTests) {
        try {
          const { data } = await mockTestAPI.getOne(t._id);
          if (data.questionTextExtractionStatus === 'completed') {
            setTests(prev => prev.map(x =>
              x._id === t._id
                ? { ...x, questionTextExtractionStatus: 'completed' }
                : x
            ));
            toast.success(`"${t.name}" question text extraction completed`);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [tests]);

  const loadAll = async () => {
    try {
      const { subject, year, mode } = filters;
      const [testsRes, attemptsRes, seriesRes] = await Promise.allSettled([
        mockTestAPI.getAll({ subject, year, mode }),
        mockTestAPI.getAllAttempts(),
        testsAPI.getSeries()
      ]);
      if (testsRes.status === 'fulfilled') setTests(testsRes.value.data);
      if (attemptsRes.status === 'fulfilled') setAttempts(attemptsRes.value.data);
      if (seriesRes.status === 'fulfilled') setAllSeries(seriesRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!testPdf) {
      toast.error('Upload Test PDF');
      return;
    }
    if (!answerKeyText.trim()) {
      toast.error('Paste answer key text');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('testPdf', testPdf!);
      fd.append('answerKeyText', answerKeyText);
      fd.append('name', formData.name || testPdf!.name.replace(/\.pdf$/i, ''));
      fd.append('testType', formData.testType);
      fd.append('totalQuestions', formData.totalQuestions);
      fd.append('durationMinutes', formData.durationMinutes);
      fd.append('markCorrect', formData.markCorrect);
      fd.append('markWrong', formData.markWrong);
      fd.append('subject', formData.subject);
      fd.append('topics', formData.topics);
      fd.append('year', formData.year);
      fd.append('testSeriesId', selectedSeriesId);
      const res = await mockTestAPI.upload(fd);
      const data = res.data;

      toast.success('Test uploaded! Processing...');

      setTests(prev => [{
        _id: data.mockTestId,
        name: data.name || formData.name,
        status: 'processing',
        createdAt: new Date(),
        totalQuestions: parseInt(formData.totalQuestions),
        durationMinutes: parseInt(formData.durationMinutes),
        testType: formData.testType,
        mode: 'pdf'
      }, ...prev]);

      setShowUpload(false);
      setTestPdf(null);
      setAnswerKeyText('');
      setFormData({ name: '', testType: 'prelims_gs', totalQuestions: '100', durationMinutes: '120', markCorrect: '2.0', markWrong: '-0.66', subject: '', topics: '', year: new Date().getFullYear().toString() });
      loadFilters();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this test?")) return;
    try {
      await mockTestAPI.deleteTest(id);
      setTests(prev => prev.filter(t => t._id !== id));
      toast.success('Test deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleViewResult = (testId: string, attemptId: string | undefined) => {
    if (!attemptId) {
      toast.error("Result not found");
      return;
    }
    router.push(`/dashboard/mock-test/${testId}?viewAttempt=${encodeURIComponent(attemptId)}&force=false`);
  };


  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0 ? attempts.reduce((s, a) => s + (a.score || 0), 0) / totalAttempts : 0;
  const bestScore = totalAttempts > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0;

  const scoreTrend = [...attempts].reverse().slice(-10).map((a, i) => ({
    idx: i + 1,
    name: a.testName?.substring(0, 12) || `Test ${i + 1}`,
    score: parseFloat((a.score || 0).toFixed(1)),
  }));

  const overallPie = [
    { name: 'Correct', value: attempts.reduce((s, a) => s + (a.correctCount || 0), 0), color: PIE_COLORS[0] },
    { name: 'Wrong', value: attempts.reduce((s, a) => s + (a.wrongCount || 0), 0), color: PIE_COLORS[1] },
    { name: 'Unattempted', value: attempts.reduce((s, a) => s + (a.unattemptedCount || 0), 0), color: PIE_COLORS[2] },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <style>{scrollbarStyle}</style>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Brain className="w-7 h-7 text-yellow-400" />
            Mock Test Engine
          </h1>
          <p className="text-ink-500 text-sm mt-1">Upload PDFs → AI extracts key → Digital OMR → Review (Max 6MB)</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Upload New Test
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tests Ready', value: tests.filter(t => t.status === 'ready').length, icon: BookOpen, color: 'text-yellow-400' },
          { label: 'Attempts', value: totalAttempts, icon: Target, color: 'text-deep-400' },
          { label: 'Avg Score', value: avgScore.toFixed(1), icon: TrendingUp, color: 'text-teal-400' },
          { label: 'Best Score', value: bestScore.toFixed(1), icon: Zap, color: 'text-purple-400' },
        ].map(item => (
          <div key={item.label} className="glass-card p-4 flex items-center gap-3">
            <item.icon className={clsx('w-5 h-5', item.color)} />
            <div>
              <div className={clsx('font-display text-xl font-bold', item.color)}>{item.value}</div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 p-1 bg-ink-900 rounded-xl border border-ink-800 w-fit">
          {(['tests', 'analytics'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={clsx('px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all', tab === t ? 'bg-yellow-500 text-ink-950' : 'text-ink-500')}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'tests' && (
          <div className="flex gap-2 items-center">
            <select
              className="bg-ink-900 border border-ink-800 rounded-lg px-3 py-1.5 text-xs text-ink-300 outline-none"
              value={filters.subject}
              onChange={e => setFilters({ ...filters, subject: e.target.value })}
            >
              <option value="">All Subjects</option>
              {availableFilters.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="bg-ink-900 border border-ink-800 rounded-lg px-3 py-1.5 text-xs text-ink-300 outline-none"
              value={filters.year}
              onChange={e => setFilters({ ...filters, year: e.target.value })}
            >
              <option value="">All Years</option>
              {availableFilters.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            {(filters.subject || filters.year) && (
              <button
                onClick={() => setFilters({ subject: '', year: '', mode: '' })}
                className="p-1.5 text-ink-500 hover:text-white transition-colors"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {tab === 'tests' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-ink-600 font-mono text-xs animate-pulse">Scanning System...</div>
          ) : (
            <>
              {tests.filter(t => !t.testSeriesId).length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-sm font-bold text-ink-500 uppercase tracking-widest">Standalone Tests</h3>
                  {tests.filter(t => !t.testSeriesId).map((test) => (
                    <TestCard
                      key={test._id}
                      test={test}
                      attempts={attempts}
                      onStart={() => setStartConfig({ id: test._id, time: test.durationMinutes })}
                      onViewResult={(attemptId: string) => handleViewResult(test._id, attemptId)}
                      onDelete={() => handleDelete(test._id)}
                    />
                  ))}
                </div>
              )}

              {allSeries.map((series) => {
                const seriesTests = tests.filter(t => t.testSeriesId === series._id);
                if (seriesTests.length === 0) return null;

                return (
                  <div key={series._id} className="rounded-xl border transition-all duration-300 overflow-hidden">
                    <div
                      className="p-5 flex items-start gap-4 cursor-pointer"
                      onClick={() => setExpandedSeries(expandedSeries === series._id ? null : series._id)}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono text-lg font-black shadow-inner bg-ink-800 text-ink-400 border border-ink-700">
                        <BookOpen className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-display text-lg font-bold text-ink-100">{series.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-400 text-[10px] font-bold uppercase tracking-tighter border border-ink-700">{series.provider}</span>
                              <span className="text-[10px] text-ink-500 font-mono">{seriesTests.length} Tests</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black font-display leading-none text-teal-500">
                              {seriesTests.filter(t => t.status === 'ready').length}
                            </div>
                            <div className="text-[9px] font-mono text-ink-500 uppercase tracking-widest">Ready</div>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {expandedSeries === series._id ? (
                          <ChevronUp className="w-5 h-5 text-ink-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-ink-500" />
                        )}
                      </div>
                    </div>

                    {expandedSeries === series._id && (
                      <div className="border-t border-ink-800 bg-ink-950/50 p-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 gap-3">
                          {seriesTests.map((test) => (
                            <TestCard
                              key={test._id}
                              test={test}
                              attempts={attempts}
                              onStart={() => setStartConfig({ id: test._id, time: test.durationMinutes })}
                              onViewResult={(attemptId: string) => handleViewResult(test._id, attemptId)}
                              onDelete={() => handleDelete(test._id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {tests.length === 0 && (
                <div className="glass-card p-12 text-center border-dashed border-ink-800">
                  <BookOpen className="w-12 h-12 text-ink-800 mx-auto mb-4" />
                  <p className="text-ink-500 font-display">No Tests Found</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'analytics' && totalAttempts > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-5 h-64">
            <h3 className="text-sm font-bold mb-4">Score Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2820" />
                <XAxis dataKey="idx" hide />
                <YAxis stroke="#6b5e52" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1a1612', border: 'none' }} />
                <Line type="monotone" dataKey="score" stroke="#ff7c0a" strokeWidth={2} dot={{ fill: '#ff7c0a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-5 h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={overallPie} innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                  {overallPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-xs">
              {overallPie.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-ink-400">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-2xl animate-slide-up">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Upload Mock Test</h3>
              <X className="cursor-pointer text-ink-400 hover:text-white" onClick={() => setShowUpload(false)} />
            </div>

            <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <DropZone label="Test PDF" file={testPdf} onChange={setTestPdf} hint="Question Paper" />

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-500">
                  Answer Key (Raw Text)
                </label>
                <textarea
                  className="input-field w-full h-32 resize-none font-mono text-xs"
                  placeholder="Paste answer key here..."
                  value={answerKeyText}
                  onChange={(e) => setAnswerKeyText(e.target.value)}
                />
                <p className="text-[10px] text-ink-600">
                  Simplified regex will be used
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink-500">Link to Test Series</label>
                  <select
                    className="input-field w-full mt-1"
                    value={selectedSeriesId}
                    onChange={e => setSelectedSeriesId(e.target.value)}
                  >
                    <option value="">Standalone Test (No Series)</option>
                    {allSeries.map(s => (
                      <option key={s._id} value={s._id}>{s.name} - {s.provider}</option>
                    ))}
                  </select>
                </div>

                <input placeholder="Test Name" className="input-field w-full" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

                <div className="grid grid-cols-2 gap-4">
                  <select className="input-field" value={formData.testType} onChange={e => setFormData({ ...formData, testType: e.target.value })}>
                    {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input type="number" placeholder="Total Questions" className="input-field" value={formData.totalQuestions} onChange={e => setFormData({ ...formData, totalQuestions: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-ink-500">Subject</label>
                    <select
                      className="input-field w-full"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="">Select Subject</option>
                      {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-ink-500">Year</label>
                    <input
                      type="number"
                      placeholder="e.g. 2024"
                      className="input-field w-full"
                      value={formData.year}
                      onChange={e => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-500">Specific Topics</label>
                  <input placeholder="e.g. Parliament, Governor" className="input-field w-full" value={formData.topics} onChange={e => setFormData({ ...formData, topics: e.target.value })} />
                </div>
              </div>
            </div>

            <button disabled={uploading} onClick={handleUpload} className={clsx('w-full py-3 flex items-center justify-center gap-2 rounded-xl font-bold transition-all mt-4', 'bg-yellow-500 text-ink-950')}>
              {uploading ? <><Loader2 className="animate-spin w-4 h-4" /> Processing...</> : 'Extract PDF Key'}
            </button>
          </div>
        </div>
      )}

      {startConfig && (
        <div className="fixed inset-0 bg-ink-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full bg-black max-w-md border-yellow-500/30 animate-scale-in">
            <div className="text-center mb-6">
              <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-ink-100">Set Test Duration</h3>
              <p className="text-ink-500 text-sm mt-2">Adjust time for this attempt</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="number"
                  className="input-field w-full text-center text-3xl font-bold py-4 bg-ink-950 border-yellow-500/20 focus:border-yellow-500"
                  value={startConfig.time}
                  onChange={(e) => setStartConfig({ ...startConfig, time: parseInt(e.target.value) || 0 })}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-500 font-bold">MIN</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStartConfig(null)} className="flex-1 px-4 py-3 rounded-xl border border-ink-700 text-ink-300 hover:bg-ink-800 transition-all font-semibold">
                  Cancel
                </button>
                <button
                  onClick={() => router.push(`/dashboard/mock-test/${startConfig.id}?customTime=${startConfig.time}&force=true`)}
                  className="flex-1 px-4 py-3 rounded-xl bg-yellow-500 text-ink-950 hover:bg-yellow-600 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> Start
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function TestCard({ test, attempts = [], onStart, onViewResult, onDelete }: any) {
  const cfg = STATUS_CFG[test.status as Status] || STATUS_CFG.error;
  const relatedAttempts = Array.isArray(attempts)
    ? attempts
      .filter((a: any) => (a.mockTestId?._id === test._id || a.mockTestId === test._id))
      .filter((a: any) => a.feedbackStatus !== 'failed')
      .sort((a: any, b: any) => new Date(b.submittedAt || b.createdAt || 0).getTime() - new Date(a.submittedAt || a.createdAt || 0).getTime())
    : [];

  const lastAttempt = relatedAttempts[0];
  const lastAttemptId = lastAttempt?._id;
  const lastScore = lastAttempt?.score;

  return (
    <div className="glass-card p-4 hover:border-ink-600 transition-colors">
      <div className="flex items-center gap-4">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center border', cfg.bg)}>
          <cfg.icon className={clsx('w-5 h-5', cfg.color, test.status === 'processing' && 'animate-spin')} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-ink-100 truncate">{test.name}</h4>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-500 mt-1">
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {test.totalQuestions} Qs</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.durationMinutes}m</span>
            <span className={clsx(
              "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
              test.mode === 'structured' ? "bg-teal-900/40 text-teal-400 border border-teal-800/50" : "bg-yellow-900/40 text-yellow-500 border border-yellow-800/50"
            )}>
              {test.mode === 'structured' ? 'Structured' : 'PDF Mode'}
            </span>
            {lastAttempt && <span className="text-teal-400 font-bold">Last Score: {lastScore?.toFixed(1) ?? '--'}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-2">
            {lastAttempt && lastAttemptId && (
              <button
                onClick={() => onViewResult(lastAttemptId)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-ink-700 text-ink-300 hover:border-yellow-500/50 transition-all"
              >
                Result
              </button>
            )}
            {test.status === 'ready' && (
              test.questionTextExtractionStatus === 'completed' ? (
                <button
                  onClick={onStart}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1',
                    lastAttempt ? 'bg-teal-600 text-white hover:bg-teal-500' : 'bg-yellow-500 text-ink-950 hover:bg-yellow-600'
                  )}
                >
                  <Play className="w-3 h-3" /> {lastAttempt ? 'Re-take' : 'Start'}
                </button>
              ) : (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                >
                  <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                </button>
              )
            )}
          </div>
          <button onClick={onDelete} className="text-ink-600 hover:text-red-400 text-[10px] transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function DropZone({ label, file, onChange, hint }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase font-bold text-ink-500">{label}</label>
      <div
        onClick={() => document.getElementById(`file-${label}`)?.click()}
        className={clsx('border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-ink-900 transition-colors min-h-[80px] flex flex-col items-center justify-center', file ? 'border-teal-500 bg-teal-900/10' : 'border-ink-800')}
      >
        <input id={`file-${label}`} type="file" hidden onChange={e => onChange(e.target.files?.[0])} accept=".pdf" />
        {file ? (
          <div className="text-xs font-mono text-teal-400 line-clamp-2">{file.name}</div>
        ) : (
          <div className="text-[10px] text-ink-600 uppercase tracking-tighter">{hint}</div>
        )}
      </div>
    </div>
  );
}
