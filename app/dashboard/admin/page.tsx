'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminAPI, mockTestAPI, testsAPI } from '@/lib/api';
import {
  Shield, BookOpen, Target, Users, FileText, Plus, X,
  Edit2, Trash2, CheckCircle2, XCircle, Loader2, Search,
  ChevronLeft, ChevronRight, Upload, Settings, BarChart3,
  ToggleLeft, ToggleRight, Save, CheckSquare, Square, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SUBJECTS_LIST = [
  'History', 'Geography', 'Polity', 'Economy', 'Environment',
  'Science & Technology', 'Current Affairs', 'Internal Security',
  'Ethics', 'CSAT', 'International Relations', 'Social Issues'
];

const TEST_TYPES = [
  { value: 'prelims_gs', label: 'Prelims GS' },
  { value: 'prelims_csat', label: 'Prelims CSAT' },
  { value: 'sectional', label: 'Sectional' },
  { value: 'full_length', label: 'Full Length' },
];

const SERIES_TYPES = ['prelims', 'mains', 'sectional', 'full_length', 'csat'];

// Helper to render HTML content safely
function renderHtml(html: string): { __html: string } {
  if (!html) return { __html: '' };
  return { __html: html };
}

function HtmlContent({ html, className }: { html?: string; className?: string }) {
  if (!html) return null;
  return <span className={className} dangerouslySetInnerHTML={renderHtml(html)} />;
}

// Clean HTML for display - removes dangerous tags but keeps formatting
function cleanHtml(html: string): string {
  if (!html) return '';
  let cleaned = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<\/p>/gi, '\n');
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  cleaned = cleaned.replace(/\n\s*\n/g, '\n');
  return cleaned.trim();
}

// Render text with preserved line breaks
function renderWithBreaks(text: string): string {
  if (!text) return '';
  return text.replace(/\n/g, '<br/>');
}

type TabType = 'dashboard' | 'tests' | 'series' | 'questions' | 'create-test' | 'users';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-ink-400">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-500" />
            Admin Dashboard
          </h1>
          <p className="text-ink-500 text-sm mt-1">Manage platform content, tests, and users</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-ink-900 rounded-xl border border-ink-800 w-fit flex-wrap">
        {([
          { id: 'dashboard', icon: BarChart3, label: 'Overview' },
          { id: 'tests', icon: FileText, label: 'Mock Tests' },
          { id: 'series', icon: Target, label: 'Test Series' },
          { id: 'questions', icon: BookOpen, label: 'Questions' },
          { id: 'create-test', icon: CheckSquare, label: 'Create Test' },
          { id: 'users', icon: Users, label: 'Users' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-semibold capitalize flex items-center gap-2 transition-all',
              activeTab === tab.id ? 'bg-yellow-500 text-ink-950' : 'text-ink-500 hover:text-white'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && <OverviewTab />}
      {activeTab === 'tests' && <TestsTab />}
      {activeTab === 'series' && <SeriesTab />}
      {activeTab === 'questions' && <QuestionsTab />}
      {activeTab === 'create-test' && <CreateTestTab />}
      {activeTab === 'users' && <UsersTab />}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-ink-500">Loading...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Total Tests', value: stats?.totalTests || 0, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Test Series', value: stats?.totalSeries || 0, color: 'text-teal-500', bg: 'bg-teal-500/10' },
        { label: 'Questions', value: stats?.totalQuestions || 0, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Users', value: stats?.totalUsers || 0, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      ].map(item => (
        <div key={item.label} className="glass-card p-6">
          <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center mb-3', item.bg)}>
            <span className={clsx('text-2xl font-bold', item.color)}>{item.value}</span>
          </div>
          <div className="text-sm text-ink-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function TestsTab() {
  const [tests, setTests] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [filters, setFilters] = useState({ subject: '', testType: '', mode: '' });

  useEffect(() => {
    loadTests();
  }, [pagination.page, filters]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getTests({ page: pagination.page, limit: 10, ...filters });
      setTests(data.tests);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test?')) return;
    try {
      await mockTestAPI.deleteTest(id);
      toast.success('Test deleted');
      loadTests();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleActive = async (test: any) => {
    try {
      await adminAPI.updateTest(test._id, { isActive: !test.isActive });
      toast.success(test.isActive ? 'Test disabled' : 'Test enabled');
      loadTests();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <select
          className="input-field"
          value={filters.subject}
          onChange={e => setFilters({ ...filters, subject: e.target.value })}
        >
          <option value="">All Subjects</option>
          {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="input-field"
          value={filters.testType}
          onChange={e => setFilters({ ...filters, testType: e.target.value })}
        >
          <option value="">All Types</option>
          {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          className="input-field"
          value={filters.mode}
          onChange={e => setFilters({ ...filters, mode: e.target.value })}
        >
          <option value="">All Modes</option>
          <option value="structured">Structured</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-500">Loading...</div>
      ) : tests.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-ink-800">
          <FileText className="w-12 h-12 text-ink-800 mx-auto mb-4" />
          <p className="text-ink-500">No tests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(test => (
            <div key={test._id} className={clsx(
              'glass-card p-4 flex items-center gap-4',
              !test.isActive && 'opacity-50'
            )}>
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                test.mode === 'structured' ? 'bg-teal-500/20' : 'bg-yellow-500/20'
              )}>
                <FileText className={clsx('w-5 h-5', test.mode === 'structured' ? 'text-teal-400' : 'text-yellow-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-ink-100 truncate">{test.name}</h4>
                  {test.isActive === false && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400">Disabled</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-500 mt-1">
                  <span>{test.subject}</span>
                  <span>{test.testType}</span>
                  <span>{test.totalQuestions} Qs</span>
                  <span>{test.durationMinutes}m</span>
                  <span className={test.status === 'ready' ? 'text-teal-400' : 'text-yellow-400'}>{test.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(test)}
                  className="p-2 text-ink-500 hover:text-white transition-colors"
                  title={test.isActive ? 'Disable' : 'Enable'}
                >
                  {test.isActive ? <ToggleRight className="w-5 h-5 text-teal-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setEditingTest(test)}
                  className="p-2 text-ink-500 hover:text-yellow-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(test._id)}
                  className="p-2 text-ink-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
            className="btn-ghost"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-ink-500 py-2">
            {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="btn-ghost"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {editingTest && (
        <EditTestModal test={editingTest} onClose={() => setEditingTest(null)} onSave={() => { setEditingTest(null); loadTests(); }} />
      )}
    </div>
  );
}

function EditTestModal({ test, onClose, onSave }: { test: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: test.name,
    testType: test.testType,
    subject: test.subject,
    year: test.year || new Date().getFullYear(),
    totalQuestions: test.totalQuestions,
    durationMinutes: test.durationMinutes,
    markCorrect: test.markCorrect,
    markWrong: test.markWrong,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateTest(test._id, form);
      toast.success('Test updated');
      onSave();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Edit Test</h3>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="input-field w-full"
            placeholder="Test Name"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.testType}
              onChange={e => setForm({ ...form, testType: e.target.value })}
              className="input-field"
            >
              {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <select
              value={form.subject}
              onChange={e => setForm({ ...form, subject: e.target.value })}
              className="input-field"
            >
              <option value="">Select Subject</option>
              {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              value={form.totalQuestions}
              onChange={e => setForm({ ...form, totalQuestions: parseInt(e.target.value) })}
              className="input-field"
              placeholder="Questions"
            />
            <input
              type="number"
              value={form.durationMinutes}
              onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
              className="input-field"
              placeholder="Duration"
            />
            <input
              type="number"
              value={form.year}
              onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
              className="input-field"
              placeholder="Year"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.1"
              value={form.markCorrect}
              onChange={e => setForm({ ...form, markCorrect: parseFloat(e.target.value) })}
              className="input-field"
              placeholder="Mark Correct"
            />
            <input
              type="number"
              step="0.1"
              value={form.markWrong}
              onChange={e => setForm({ ...form, markWrong: parseFloat(e.target.value) })}
              className="input-field"
              placeholder="Mark Wrong"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function SeriesTab() {
  const [series, setSeries] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);

  useEffect(() => {
    loadSeries();
  }, [pagination.page]);

  const loadSeries = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getSeries({ page: pagination.page, limit: 10 });
      setSeries(data.series);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this series and all its tests?')) return;
    try {
      await adminAPI.deleteSeries(id);
      toast.success('Series deleted');
      loadSeries();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleActive = async (s: any) => {
    try {
      await adminAPI.updateSeries(s._id, { isActive: !s.isActive });
      toast.success(s.isActive ? 'Series disabled' : 'Series enabled');
      loadSeries();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleAddSeries = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await adminAPI.addSeries({
        name: formData.get('name'),
        provider: formData.get('provider'),
        type: formData.get('type'),
        totalTests: parseInt(formData.get('totalTests') as string) || undefined,
      });
      toast.success('Series created');
      setShowForm(false);
      loadSeries();
    } catch {
      toast.error('Failed to create series');
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" /> New Series
      </button>

      {loading ? (
        <div className="text-center py-20 text-ink-500">Loading...</div>
      ) : series.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-ink-800">
          <Target className="w-12 h-12 text-ink-800 mx-auto mb-4" />
          <p className="text-ink-500">No series found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {series.map(s => (
            <div key={s._id} className={clsx(
              'glass-card p-4 flex items-center gap-4',
              !s.isActive && 'opacity-50'
            )}>
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-ink-100 truncate">{s.name}</h4>
                  {s.isActive === false && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400">Disabled</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-ink-500 mt-1">
                  <span>{s.provider || 'No provider'}</span>
                  <span className="uppercase">{s.type}</span>
                  <span>{s.totalTests || 0} tests</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(s)}
                  className="p-2 text-ink-500 hover:text-white transition-colors"
                >
                  {s.isActive ? <ToggleRight className="w-5 h-5 text-teal-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setEditingSeries(s)}
                  className="p-2 text-ink-500 hover:text-yellow-400 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="p-2 text-ink-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">New Test Series</h3>
              <X className="cursor-pointer text-ink-400 hover:text-white" onClick={() => setShowForm(false)} />
            </div>
            <form onSubmit={handleAddSeries} className="space-y-3">
              <input name="name" required className="input-field w-full" placeholder="Series Name" />
              <input name="provider" className="input-field w-full" placeholder="Provider (optional)" />
              <div className="grid grid-cols-2 gap-3">
                <select name="type" required className="input-field">
                  {SERIES_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
                <input name="totalTests" type="number" className="input-field" placeholder="Total Tests" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingSeries && (
        <EditSeriesModal series={editingSeries} onClose={() => setEditingSeries(null)} onSave={() => { setEditingSeries(null); loadSeries(); }} />
      )}
    </div>
  );
}

function EditSeriesModal({ series, onClose, onSave }: { series: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: series.name,
    provider: series.provider || '',
    type: series.type,
    totalTests: series.totalTests || 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSeries(series._id, form);
      toast.success('Series updated');
      onSave();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Edit Series</h3>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="input-field w-full"
            placeholder="Series Name"
          />
          <input
            value={form.provider}
            onChange={e => setForm({ ...form, provider: e.target.value })}
            className="input-field w-full"
            placeholder="Provider"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="input-field"
            >
              {SERIES_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
            <input
              type="number"
              value={form.totalTests}
              onChange={e => setForm({ ...form, totalTests: parseInt(e.target.value) })}
              className="input-field"
              placeholder="Total Tests"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [pagination.page, search, subjectFilter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getQuestions({ 
        page: pagination.page, 
        limit: 15, 
        search,
        subject: subjectFilter 
      });
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      await adminAPI.deleteQuestion(id);
      toast.success('Question deleted');
      loadQuestions();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await adminAPI.addQuestion({
        questionNumber: parseInt(formData.get('questionNumber') as string),
        text: formData.get('text'),
        options: {
          a: formData.get('optionA'),
          b: formData.get('optionB'),
          c: formData.get('optionC'),
          d: formData.get('optionD'),
        },
        correctAnswer: formData.get('correctAnswer'),
        explanation: formData.get('explanation'),
        subject: formData.get('subject'),
        year: parseInt(formData.get('year') as string) || new Date().getFullYear(),
      });
      toast.success('Question added');
      setShowForm(false);
      loadQuestions();
    } catch {
      toast.error('Failed to add question');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="input-field w-full pl-10"
          />
        </div>
        <select
          className="input-field"
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Question
        </button>
        <button onClick={() => setShowBulkForm(true)} className="btn-ghost flex items-center gap-2">
          <Upload className="w-4 h-4" /> Bulk Upload
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-500">Loading...</div>
      ) : questions.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-ink-800">
          <BookOpen className="w-12 h-12 text-ink-800 mx-auto mb-4" />
          <p className="text-ink-500">No questions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map(q => (
            <div key={q._id} className="glass-card p-4 hover:border-ink-600 transition-all">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-sm font-bold">
                    Q{q.questionNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-400 text-xs">
                    {q.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-400 text-xs">
                    {q.year}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="p-2 text-ink-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                    title="View/Edit"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-2 text-ink-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text - Clean HTML with line breaks */}
              <div 
                className="text-sm text-ink-100 mb-3 leading-relaxed whitespace-pre-wrap"
              >
                {cleanHtml(q.text)}
              </div>

              {/* Options - Clean HTML with line breaks */}
              <div className="grid grid-cols-1 gap-1.5 mb-3">
                {['a', 'b', 'c', 'd'].map(opt => (
                  <div 
                    key={opt}
                    className={clsx(
                      "flex items-start gap-2 p-2 rounded-lg text-xs transition-all",
                      q.correctAnswer?.toUpperCase() === opt.toUpperCase()
                        ? "bg-teal-500/15 border border-teal-500/30"
                        : "bg-ink-900/50 border border-ink-800"
                    )}
                  >
                    <span className={clsx(
                      "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
                      q.correctAnswer?.toUpperCase() === opt.toUpperCase()
                        ? "bg-teal-500 text-ink-950"
                        : "bg-ink-800 text-ink-500"
                    )}>
                      {opt.toUpperCase()}
                    </span>
                    <span className={q.correctAnswer?.toUpperCase() === opt.toUpperCase() ? "text-teal-300" : "text-ink-400"}>
                      {cleanHtml(q.options?.[opt] || '')}
                    </span>
                    {q.correctAnswer?.toUpperCase() === opt.toUpperCase() && (
                      <CheckCircle2 className="w-3 h-3 text-teal-400 ml-auto shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase">Explanation</span>
                  </div>
                  <p className="text-xs text-ink-400 whitespace-pre-wrap">
                    {cleanHtml(q.explanation)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="btn-ghost">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-ink-500 py-2">{pagination.page} / {pagination.pages}</span>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} className="btn-ghost">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {showForm && <QuestionFormModal onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); loadQuestions(); }} />}
      {showBulkForm && <BulkQuestionModal onClose={() => setShowBulkForm(false)} onSave={() => { setShowBulkForm(false); loadQuestions(); }} />}
      {editingQuestion && <QuestionFormModal question={editingQuestion} onClose={() => setEditingQuestion(null)} onSave={() => { setEditingQuestion(null); loadQuestions(); }} />}
    </div>
  );
}

function QuestionFormModal({ question, onClose, onSave }: { question?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    questionNumber: question?.questionNumber || 1,
    text: question?.text || '',
    optionA: question?.options?.a || '',
    optionB: question?.options?.b || '',
    optionC: question?.options?.c || '',
    optionD: question?.options?.d || '',
    correctAnswer: question?.correctAnswer || 'A',
    explanation: question?.explanation || '',
    subject: question?.subject || 'General Studies',
    year: question?.year || new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = {
        questionNumber: form.questionNumber,
        text: form.text,
        options: { a: form.optionA, b: form.optionB, c: form.optionC, d: form.optionD },
        correctAnswer: form.correctAnswer,
        explanation: form.explanation,
        subject: form.subject,
        year: form.year,
      };
      if (question) {
        await adminAPI.updateQuestion(question._id, data);
      } else {
        await adminAPI.addQuestion(data);
      }
      toast.success(question ? 'Question updated' : 'Question added');
      onSave();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const OPTION_COLORS: Record<string, string> = {
    A: 'border-yellow-500/30 bg-yellow-500/5',
    B: 'border-teal-500/30 bg-teal-500/5',
    C: 'border-purple-500/30 bg-purple-500/5',
    D: 'border-pink-500/30 bg-pink-500/5',
  };

  return (
    <div className="fixed inset-0 bg-ink-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card p-0 w-full max-w-4xl my-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ink-800 bg-ink-900/50">
          <h3 className="font-bold text-lg text-ink-100">
            {question ? 'Edit Question' : 'Add New Question'}
          </h3>
          <button onClick={onClose} className="p-2 text-ink-400 hover:text-white hover:bg-ink-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row max-h-[80vh]">
          {/* Left Panel - Edit Form */}
          <div className="w-full lg:w-1/2 p-4 border-r border-ink-800 overflow-y-auto">
            {/* Meta Info */}
            <div className="mb-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-2 block">Question Meta</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-ink-500 mb-1 block">Q.No.</span>
                  <input
                    type="number"
                    value={form.questionNumber}
                    onChange={e => setForm({ ...form, questionNumber: parseInt(e.target.value) })}
                    className="input-field w-full text-sm"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-ink-500 mb-1 block">Subject</span>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="input-field w-full text-sm"
                  >
                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-ink-500 mb-1 block">Year</span>
                  <input
                    type="number"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                    className="input-field w-full text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-2 block">Question Text *</label>
              <textarea
                value={form.text}
                onChange={e => setForm({ ...form, text: e.target.value })}
                className="input-field w-full h-32 text-sm resize-none"
                placeholder="Enter question text here..."
              />
            </div>

            {/* Options */}
            <div className="mb-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-2 block">Options *</label>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} className="flex items-center gap-2">
                    <button
                      onClick={() => setForm({ ...form, correctAnswer: opt })}
                      className={clsx(
                        'w-8 h-8 rounded-lg font-bold text-sm flex items-center justify-center transition-all',
                        form.correctAnswer === opt 
                          ? 'bg-teal-500 text-ink-950 shadow-lg shadow-teal-500/30' 
                          : 'bg-ink-800 text-ink-500 hover:bg-ink-700'
                      )}
                    >
                      {opt}
                    </button>
                    <input 
                      value={form[`option${opt}` as keyof typeof form] as string}
                      onChange={e => setForm({ ...form, [`option${opt}`]: e.target.value })}
                      className={clsx(
                        'input-field flex-1 text-sm',
                        form.correctAnswer === opt && 'border-teal-500/50 bg-teal-500/5'
                      )}
                      placeholder={`Option ${opt}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-4">
              <label className="text-xs text-ink-500 uppercase tracking-wider mb-2 block">Explanation</label>
              <textarea
                value={form.explanation}
                onChange={e => setForm({ ...form, explanation: e.target.value })}
                className="input-field w-full h-24 text-sm resize-none"
                placeholder="Enter explanation (optional)..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleSave} 
                disabled={saving || !form.text || !form.optionA || !form.optionB || !form.optionC || !form.optionD} 
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Question'}
              </button>
              <button onClick={onClose} className="btn-ghost px-4">
                Cancel
              </button>
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="w-full lg:w-1/2 p-4 bg-ink-950/50 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs text-ink-500 uppercase tracking-wider">Live Preview</span>
            </div>

            {/* Question Preview Card */}
            <div className="bg-ink-900/50 rounded-xl border border-ink-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                  Q{form.questionNumber}
                </span>
                <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-400 text-xs">
                  {form.subject || 'General Studies'}
                </span>
                <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-400 text-xs">
                  {form.year}
                </span>
              </div>

              {/* Question Text - Clean HTML */}
              <div className="mb-4">
                <p 
                  className="text-sm leading-relaxed text-ink-100 whitespace-pre-wrap"
                >
                  {cleanHtml(form.text) || 'Question text will appear here...'}
                </p>
              </div>

              {/* Options - Clean HTML */}
              <div className="space-y-2 mb-4">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div 
                    key={opt}
                    className={clsx(
                      "flex items-start gap-3 p-3 rounded-lg border transition-all",
                      form.correctAnswer === opt 
                        ? "border-teal-500/50 bg-teal-500/10" 
                        : "border-ink-800 bg-ink-900/30"
                    )}
                  >
                    <div className={clsx(
                      "w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0",
                      form.correctAnswer === opt 
                        ? "bg-teal-500 text-ink-950" 
                        : "bg-ink-800 text-ink-500"
                    )}>
                      {opt}
                    </div>
                    <p 
                      className="text-sm flex-1 text-ink-200 whitespace-pre-wrap"
                    >
                      {cleanHtml(form[`option${opt}` as keyof typeof form] as string) || `Option ${opt}...`}
                    </p>
                  </div>
                ))}
              </div>

              {/* Answer & Explanation */}
              {form.correctAnswer && (
                <div className="border-t border-ink-800 pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-teal-400 uppercase">Correct Answer</span>
                    <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-400 text-sm font-bold">
                      {form.correctAnswer}
                    </span>
                  </div>
                  
                  {form.explanation && (
                    <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Explanation</span>
                      </div>
                      <p className="text-xs text-ink-300 leading-relaxed whitespace-pre-wrap">
                        {cleanHtml(form.explanation)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-4 p-3 rounded-lg bg-ink-900/30 border border-ink-800">
              <p className="text-[10px] text-ink-500">
                <span className="text-yellow-500 font-bold">Tip:</span> Click on the letter button (A/B/C/D) to set the correct answer. The selected option will be highlighted in green.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulkQuestionModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [subject, setSubject] = useState('General Studies');

  const parseQuestions = (input: string) => {
    const questions: any[] = [];
    const blocks = input.split(/Q\.\d+[\)\.]?\s*/i).filter(b => b.trim());
    
    let questionNumber = 1;
    
    for (const block of blocks) {
      if (!block.trim()) continue;
      
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      
      let questionText = '';
      const options: any = { a: '', b: '', c: '', d: '' };
      let correctAnswer = '';
      let explanation = '';
      
      let optionIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for answer - Ans) c or Answer: c
        const ansMatch = line.match(/^(?:Ans(?:wer)?)[\s\):]*([a-dA-D])/i);
        if (ansMatch) {
          correctAnswer = ansMatch[1].toUpperCase();
          continue;
        }
        
        // Check for explanation - Exp) or Explanation:
        const expMatch = line.match(/^(?:Exp(?:lanation)?)[\s\):]*/i);
        if (expMatch) {
          explanation = line.replace(expMatch[0], '').trim();
          if (!explanation && i + 1 < lines.length) {
            explanation = lines.slice(i + 1).join(' ').trim();
          }
          continue;
        }
        
        // Check for options - a), b), c), d) or A) B) C) D)
        const optMatch = line.match(/^([a-dA-D])[\)\.]\s*(.+)/);
        if (optMatch) {
          const optKey = optMatch[1].toLowerCase();
          options[optKey] = optMatch[2].trim();
          optionIndex++;
          continue;
        }
        
        // Otherwise it's question text
        if (questionText) {
          questionText += ' ' + line;
        } else {
          questionText = line;
        }
      }
      
      // Clean up question text
      questionText = questionText.replace(/\s+/g, ' ').trim();
      
      // Remove options from question text if they're at the end
      for (const opt of ['a)', 'b)', 'c)', 'd)', 'A)', 'B)', 'C)', 'D)']) {
        const idx = questionText.lastIndexOf(opt);
        if (idx > questionText.length - 20) {
          questionText = questionText.substring(0, idx).trim();
        }
      }
      
      if (questionText && Object.values(options).some(v => v)) {
        questions.push({
          questionNumber,
          text: questionText,
          options,
          correctAnswer,
          explanation,
          subject,
          year: new Date().getFullYear(),
        });
        questionNumber++;
      }
    }
    
    return questions;
  };

  const handleBulkUpload = async () => {
    if (!text.trim()) return toast.error('Please paste questions');
    
    try {
      setSaving(true);
      const questions = parseQuestions(text);

      if (questions.length === 0) {
        return toast.error('No valid questions found. Check format!');
      }

      const { data } = await adminAPI.addBulkQuestions(questions);
      toast.success(`${data.inserted} questions added`);
      onSave();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Bulk Upload Questions</h3>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        
        <div className="mb-3">
          <label className="text-xs text-ink-500 block mb-1">Subject for all questions:</label>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="input-field w-full"
          >
            {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        
        <p className="text-xs text-ink-500 mb-3">
          Format supported:<br/>
          Q.1 Question text...<br/>
          a) Option A<br/>
          b) Option B<br/>
          c) Option C<br/>
          d) Option D<br/>
          Ans) c<br/>
          Exp) Explanation here...<br/><br/>
          Next question starts with Q.2 or Q.3 etc.
        </p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="input-field w-full h-64 font-mono text-xs"
          placeholder={`Q.6) With reference to Balance of Payments (BOP) of India... 
a) Only two 
b) Only three 
c) Only four 
d) All the five 
Ans) c 
Exp) Option c is the correct answer...

Q.9) Consider the following statements...
a) Both Statement I...
b) Both Statement II...
c) Statement I is correct...
d) Statement II is correct...
Ans) d 
Exp) Option d is the correct answer...`}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={handleBulkUpload} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Processing...' : 'Upload Questions'}
          </button>
          <button onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, [pagination.page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getUsers({ page: pagination.page, limit: 15, search });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('Role updated');
      loadUsers();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="input-field w-full pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-500">Loading...</div>
      ) : users.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-ink-800">
          <Users className="w-12 h-12 text-ink-800 mx-auto mb-4" />
          <p className="text-ink-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u._id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-ink-800 flex items-center justify-center text-ink-300 font-bold">
                {u.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-ink-100 truncate">{u.name}</h4>
                  {u.role === 'admin' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Admin</span>
                  )}
                </div>
                <p className="text-xs text-ink-500 truncate">{u.email}</p>
              </div>
              <select
                value={u.role}
                onChange={e => handleRoleChange(u._id, e.target.value)}
                className="input-field text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="btn-ghost">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-ink-500 py-2">{pagination.page} / {pagination.pages}</span>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} className="btn-ghost">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function CreateTestTab() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStructuredForm, setShowStructuredForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    testType: 'sectional',
    year: new Date().getFullYear(),
    durationMinutes: 60,
    markCorrect: 2.0,
    markWrong: -0.66,
  });
  const [structuredData, setStructuredData] = useState({
    name: '',
    testType: 'prelims_gs',
    totalQuestions: '100',
    durationMinutes: '120',
    markCorrect: '2.0',
    markWrong: '-0.66',
    subject: '',
    topics: '',
    year: new Date().getFullYear().toString(),
  });
  const [questionPaperText, setQuestionPaperText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [uploadingStructured, setUploadingStructured] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadSubjects();
    loadSeries();
  }, []);

  const loadSubjects = async () => {
    try {
      const { data } = await adminAPI.getSubjects();
      setSubjects(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSeries = async () => {
    try {
      const { data } = await testsAPI.getSeries();
      setAllSeries(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStructuredUpload = async () => {
    if (!questionPaperText.trim()) {
      return toast.error('Paste question paper text');
    }
    if (!solutionText.trim()) {
      return toast.error('Paste solution text');
    }

    setUploadingStructured(true);
    try {
      const payload = {
        name: structuredData.name || `Structured Test ${new Date().toLocaleDateString()}`,
        testType: structuredData.testType,
        totalQuestions: parseInt(structuredData.totalQuestions),
        durationMinutes: parseInt(structuredData.durationMinutes),
        markCorrect: parseFloat(structuredData.markCorrect),
        markWrong: parseFloat(structuredData.markWrong),
        subject: structuredData.subject,
        topics: structuredData.topics,
        year: parseInt(structuredData.year),
        questionPaperText,
        solutionText,
        testSeriesId: selectedSeriesId
      };
      await mockTestAPI.uploadStructured(payload);
      toast.success('Structured test created!');
      setShowStructuredForm(false);
      setQuestionPaperText('');
      setSolutionText('');
      setStructuredData({
        name: '',
        testType: 'prelims_gs',
        totalQuestions: '100',
        durationMinutes: '120',
        markCorrect: '2.0',
        markWrong: '-0.66',
        subject: '',
        topics: '',
        year: new Date().getFullYear().toString(),
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingStructured(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getQuestions({ 
        limit: 500,
        subject: selectedSubject || undefined
      });
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedSubject]);

  const toggleQuestion = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) 
        ? prev.filter(q => q !== id)
        : [...prev, id]
    );
  };

  const toggleAllInSubject = (subject: string) => {
    const subjectQuestions = questions.filter(q => q.subject === subject);
    const subjectIds = subjectQuestions.map(q => q._id);
    const allSelected = subjectIds.every(id => selectedQuestions.includes(id));
    
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(id => !subjectIds.includes(id)));
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...subjectIds])]);
    }
  };

  const handleCreateTest = async () => {
    if (selectedQuestions.length === 0) {
      return toast.error('Please select at least one question');
    }
    if (!formData.subject) {
      return toast.error('Please select a subject for the test');
    }

    try {
      setCreating(true);
      await adminAPI.createTestFromQuestions({
        ...formData,
        questionIds: selectedQuestions,
      });
      toast.success(`Test created with ${selectedQuestions.length} questions!`);
      setSelectedQuestions([]);
      setShowForm(false);
      setFormData({
        name: '',
        subject: '',
        testType: 'sectional',
        year: new Date().getFullYear(),
        durationMinutes: 60,
        markCorrect: 2.0,
        markWrong: -0.66,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create test');
    } finally {
      setCreating(false);
    }
  };

  // Group questions by subject
  const questionsBySubject = questions.reduce((acc: any, q) => {
    if (!acc[q.subject]) acc[q.subject] = [];
    acc[q.subject].push(q);
    return acc;
  }, {});

  const allSubjects = Object.keys(questionsBySubject).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Create Mock Test</h3>
          <p className="text-sm text-ink-500">Create test from questions or upload structured test</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStructuredForm(true)}
            className="btn-primary flex items-center gap-2 bg-teal-600 hover:bg-teal-500"
          >
            <Upload className="w-4 h-4" />
            Structured Upload
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-ink-400">
            {selectedQuestions.length} questions selected
          </span>
          <button 
            onClick={() => setShowForm(true)} 
            disabled={selectedQuestions.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Create Test
          </button>
        </div>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => setSelectedSubject('')}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            !selectedSubject ? 'bg-yellow-500 text-ink-950' : 'bg-ink-800 text-ink-400'
          )}
        >
          All ({questions.length})
        </button>
        {allSubjects.map(subject => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              selectedSubject === subject ? 'bg-yellow-500 text-ink-950' : 'bg-ink-800 text-ink-400'
            )}
          >
            {subject} ({questionsBySubject[subject]?.length || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink-500">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="glass-card p-12 text-center border-dashed border-ink-800">
          <BookOpen className="w-12 h-12 text-ink-800 mx-auto mb-4" />
          <p className="text-ink-500">No questions found. Upload questions first!</p>
        </div>
        ) : (
        <div className="space-y-4">
          {!selectedSubject && allSubjects.map(subject => (
            <div key={subject} className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => toggleAllInSubject(subject)}
                  className="flex items-center gap-2 text-sm font-semibold text-ink-200 hover:text-white"
                >
                  {questionsBySubject[subject].every((q: any) => selectedQuestions.includes(q._id)) ? (
                    <CheckSquare className="w-4 h-4 text-teal-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {subject}
                </button>
                <span className="text-xs text-ink-500">
                  {questionsBySubject[subject].filter((q: any) => selectedQuestions.includes(q._id)).length} / {questionsBySubject[subject].length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {questionsBySubject[subject].map((q: any) => (
                  <div
                    key={q._id}
                    onClick={() => toggleQuestion(q._id)}
                    className={clsx(
                      'p-3 rounded-lg border cursor-pointer transition-all',
                      selectedQuestions.includes(q._id)
                        ? 'bg-teal-500/10 border-teal-500/30'
                        : 'bg-ink-900/30 border-ink-800 hover:border-ink-600'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {selectedQuestions.includes(q._id) ? (
                        <CheckSquare className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-ink-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-teal-400">Q{q.questionNumber}</span>
                          <span className="text-[10px] text-ink-500">{q.year}</span>
                        </div>
                        <p className="text-xs text-ink-300 line-clamp-3 mt-1 whitespace-pre-wrap">{cleanHtml(q.text)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-ink-500">
                            Ans: <span className="text-teal-400 font-bold">{q.correctAnswer}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {selectedSubject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {questions.map((q: any) => (
                <div
                  key={q._id}
                  onClick={() => toggleQuestion(q._id)}
                  className={clsx(
                    'p-3 rounded-lg border cursor-pointer transition-all',
                    selectedQuestions.includes(q._id)
                      ? 'bg-teal-500/10 border-teal-500/30'
                      : 'bg-ink-900/30 border-ink-800 hover:border-ink-600'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {selectedQuestions.includes(q._id) ? (
                      <CheckSquare className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-ink-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-400">Q{q.questionNumber}</span>
                        <span className="text-[10px] text-ink-500">{q.year}</span>
                      </div>
                      <p className="text-xs text-ink-300 line-clamp-3 mt-1 whitespace-pre-wrap">{cleanHtml(q.text)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-ink-500">
                          Ans: <span className="text-teal-400 font-bold">{q.correctAnswer}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Create Mock Test</h3>
              <X className="cursor-pointer text-ink-400 hover:text-white" onClick={() => setShowForm(false)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-ink-500 block mb-1">Test Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label className="text-xs text-ink-500 block mb-1">Subject *</label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="input-field w-full"
                  required
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-500 block mb-1">Test Type</label>
                  <select
                    value={formData.testType}
                    onChange={e => setFormData({ ...formData, testType: e.target.value })}
                    className="input-field w-full"
                  >
                    {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-ink-500 block mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-ink-500 block mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-500 block mb-1">+ Marks</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.markCorrect}
                    onChange={e => setFormData({ ...formData, markCorrect: parseFloat(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-500 block mb-1">- Marks</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.markWrong}
                    onChange={e => setFormData({ ...formData, markWrong: parseFloat(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>
              <div className="p-3 bg-ink-900 rounded-lg">
                <span className="text-sm text-ink-300">
                  <strong className="text-teal-400">{selectedQuestions.length}</strong> questions will be included in this test
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleCreateTest} disabled={creating || !formData.subject} className="btn-primary flex-1">
                {creating ? 'Creating...' : `Create Test (${selectedQuestions.length} Qs)`}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showStructuredForm && (
        <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-teal-400">Structured Test Upload</h3>
              <X className="cursor-pointer text-ink-400 hover:text-white" onClick={() => setShowStructuredForm(false)} />
            </div>

            <div className="space-y-4 mb-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-500">Question Paper (Raw Text) *</label>
                <textarea
                  className="input-field w-full h-32 resize-none font-mono text-xs"
                  placeholder="Paste full question paper text here..."
                  value={questionPaperText}
                  onChange={(e) => setQuestionPaperText(e.target.value)}
                />
                <p className="text-[10px] text-ink-600">Intelligent AI will structure this bank</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-ink-500">Solutions & Answers (Raw Text) *</label>
                <textarea
                  className="input-field w-full h-32 resize-none font-mono text-xs"
                  placeholder="Paste solutions/answers text here..."
                  value={solutionText}
                  onChange={(e) => setSolutionText(e.target.value)}
                />
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

                <input 
                  placeholder="Test Name" 
                  className="input-field w-full" 
                  value={structuredData.name} 
                  onChange={e => setStructuredData({ ...structuredData, name: e.target.value })} 
                />

                <div className="grid grid-cols-2 gap-4">
                  <select 
                    className="input-field" 
                    value={structuredData.testType} 
                    onChange={e => setStructuredData({ ...structuredData, testType: e.target.value })}
                  >
                    {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Total Questions" 
                    className="input-field" 
                    value={structuredData.totalQuestions} 
                    onChange={e => setStructuredData({ ...structuredData, totalQuestions: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-ink-500">Subject</label>
                    <select
                      className="input-field w-full"
                      value={structuredData.subject}
                      onChange={e => setStructuredData({ ...structuredData, subject: e.target.value })}
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
                      value={structuredData.year}
                      onChange={e => setStructuredData({ ...structuredData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-ink-500">Specific Topics</label>
                  <input 
                    placeholder="e.g. Parliament, Governor" 
                    className="input-field w-full" 
                    value={structuredData.topics} 
                    onChange={e => setStructuredData({ ...structuredData, topics: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={uploadingStructured} 
              onClick={handleStructuredUpload} 
              className="w-full py-3 flex items-center justify-center gap-2 rounded-xl font-bold transition-all mt-4 bg-teal-500 text-ink-950 hover:bg-teal-600"
            >
              {uploadingStructured ? <><Loader2 className="animate-spin w-4 h-4" /> Processing...</> : 'Frame Knowledge Bank'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
