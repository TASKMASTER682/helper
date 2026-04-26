'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { adminAPI, mockTestAPI, testsAPI, coursesAPI, settingsAPI } from '@/lib/api';
import {
  Shield, BookOpen, Target, Users, FileText, Plus, X,
  Edit2, Trash2, CheckCircle2, XCircle, Loader2, Search,
  ChevronLeft, ChevronRight, Upload, Settings, BarChart3,
  ToggleLeft, ToggleRight, Save, CheckSquare, Square, Eye, Crown, CreditCard, PlayCircle,
  Zap, Clock, TrendingUp, RefreshCw, Filter, MoreVertical, UserPlus, Database, Mail, Calendar,
  Activity, Video, Layers, Bell, Percent, MessageSquare, Send, Copy
} from 'lucide-react';
import { 
  PlanFormModal, ActivateUserModal, CourseFormModal, LessonFormModal,
  QuestionFormModal, BulkQuestionModal, EditTestModal 
} from './modals';
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

const SERIES_TYPES = ['prelims_gs', 'prelims_csat', 'mains_gs', 'sectional', 'full_length', 'optional'];

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

type TabType = 'dashboard' | 'tests' | 'series' | 'questions' | 'create-test' | 'users' | 'subscriptions' | 'courses' | 'settings';

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse" />
          <Shield className="w-20 h-20 text-red-500 relative z-10" />
        </div>
        <h2 className="text-2xl font-black text-white mt-6 uppercase tracking-tighter">Secure Terminal Restricted</h2>
        <p className="text-ink-500 mt-2 text-xs font-black uppercase tracking-[0.2em]">Level 4 Clearance Required</p>
      </div>
    );
  }

  const TABS = [
    { id: 'dashboard', icon: BarChart3, label: 'Overview', desc: 'Platform Analytics' },
    { id: 'tests', icon: FileText, label: 'Mock Tests', desc: 'Manage Content' },
    { id: 'series', icon: Target, label: 'Test Series', desc: 'Bundles' },
    { id: 'questions', icon: BookOpen, label: 'Questions', desc: 'Database' },
    { id: 'create-test', icon: Plus, label: 'Quick Launch', desc: 'New Content' },
    { id: 'users', icon: Users, label: 'Citizens', desc: 'User Management' },
    { id: 'subscriptions', icon: Crown, label: 'Nexus Plans', desc: 'Monetization' },
    { id: 'courses', icon: PlayCircle, label: 'Academy', desc: 'Video Courses' },
    { id: 'settings', icon: Settings, label: 'System', desc: 'Configurations' },
  ] as const;

  return (
    <div className="min-h-screen animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 p-8 rounded-3xl bg-ink-900 border border-ink-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-yellow-500 text-ink-950 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Command Center</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <p className="text-ink-500 text-[10px] font-black uppercase tracking-[0.3em]">System Admin v4.0.2</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions or Status */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="px-4 py-2 bg-ink-950/50 border border-ink-800 rounded-xl">
            <div className="text-[10px] text-ink-600 font-black uppercase tracking-widest mb-1">Server Status</div>
            <div className="text-teal-400 text-xs font-bold flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin-slow" /> Operational
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <div className="sticky top-24 space-y-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full group px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border text-left',
                  activeTab === tab.id 
                    ? 'bg-yellow-500 border-yellow-400 text-ink-950 shadow-xl shadow-yellow-500/10 scale-[1.02]' 
                    : 'bg-ink-900/40 border-ink-800 text-ink-500 hover:bg-ink-900 hover:border-ink-700'
                )}
              >
                <div className={clsx(
                  'p-2 rounded-xl transition-colors',
                  activeTab === tab.id ? 'bg-ink-950/20' : 'bg-ink-800 group-hover:bg-ink-700'
                )}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm uppercase tracking-tight">{tab.label}</div>
                  <div className={clsx(
                    'text-[9px] font-bold uppercase tracking-widest truncate',
                    activeTab === tab.id ? 'text-ink-900/60' : 'text-ink-600'
                  )}>
                    {tab.desc}
                  </div>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <div className="animate-slide-up">
            {activeTab === 'dashboard' && <OverviewTab />}
            {activeTab === 'tests' && <TestsTab />}
            {activeTab === 'series' && <SeriesTab />}
            {activeTab === 'questions' && <QuestionsTab />}
            {activeTab === 'create-test' && <CreateTestTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'subscriptions' && <SubscriptionsTab />}
            {activeTab === 'courses' && <CoursesTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const { data } = await adminAPI.getStats();
      setStats(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      <p className="text-ink-500 font-mono text-xs animate-pulse uppercase tracking-[0.3em]">Querying Mainframe...</p>
    </div>
  );

  const CARDS = [
    { label: 'Total Mock Tests', value: stats?.totalTests || 0, icon: FileText, color: 'yellow', trend: stats?.testTrend || 'Stable' },
    { label: 'Active Series', value: stats?.totalSeries || 0, icon: Target, color: 'teal', trend: stats?.seriesTrend || 'Verified' },
    { label: 'Database Nodes', value: stats?.totalQuestions || 0, icon: BookOpen, color: 'purple', trend: 'Verified' },
    { label: 'Course Enrollments', value: stats?.totalEnrollments || 0, icon: Video, color: 'orange', trend: stats?.enrollmentsTrend || 'Verified' },
    { label: 'Nexus Users', value: stats?.totalUsers || 0, icon: Users, color: 'blue', trend: stats?.usersToday || 'Verified' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CARDS.map(item => (
          <div key={item.label} className="group relative glass-card p-8 border-ink-800 hover:border-yellow-500/30 transition-all duration-500 overflow-hidden">
            <div className={clsx(
              "absolute -bottom-10 -right-10 w-40 h-40 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity rounded-full",
              item.color === 'yellow' ? 'bg-yellow-500' : 
              item.color === 'teal' ? 'bg-teal-500' : 
              item.color === 'orange' ? 'bg-orange-500' :
              item.color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
            )} />
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="text-[10px] font-black text-ink-500 uppercase tracking-[0.2em] mb-6">{item.label}</div>
                <div className="text-5xl font-black text-white mb-2 tabular-nums tracking-tighter">
                  {item.value}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-teal-500" />
                  <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">{item.trend}</span>
                </div>
              </div>
              <div className={clsx(
                "p-4 rounded-2xl",
                item.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' : 
                item.color === 'teal' ? 'bg-teal-500/10 text-teal-400' : 
                item.color === 'orange' ? 'bg-orange-500/10 text-orange-400' :
                item.color === 'purple' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
              )}>
                <item.icon className="w-8 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="glass-card p-8 border-ink-800">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
          <Settings className="w-4 h-4 text-yellow-500" /> Live System Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'CPU Load', value: stats?.system?.cpu || '0%', color: 'bg-teal-500' },
            { label: 'API Latency', value: stats?.system?.latency || '0ms', color: 'bg-yellow-500' },
            { label: 'Memory Usage', value: stats?.system?.memory || '0%', color: 'bg-purple-500', detail: stats?.system?.memRaw },
          ].map(m => (
            <div key={m.label} className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-ink-500">
                <span>{m.label} {m.detail && <span className="text-[8px] opacity-50 ml-1">({m.detail})</span>}</span>
                <span className="text-white">{m.value}</span>
              </div>
              <div className="h-1 w-full bg-ink-950 rounded-full overflow-hidden">
                <div className={clsx("h-full rounded-full", m.color)} style={{ width: m.value }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function TestsTab() {
  const [tests, setTests] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [filters, setFilters] = useState({ subject: '', testType: '', mode: '' });

  useEffect(() => { loadTests(); }, [pagination.page, filters]);

  const loadTests = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getTests({ page: pagination.page, limit: 10, ...filters });
      setTests(data.tests);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Execute Deletion Protocol? This cannot be undone.')) return;
    try {
      await mockTestAPI.deleteTest(id);
      toast.success('Node purged from database');
      loadTests();
    } catch { toast.error('Purge failed'); }
  };

  const handleToggleActive = async (test: any) => {
    try {
      await adminAPI.updateTest(test._id, { isActive: !test.isActive });
      toast.success(test.isActive ? 'Node offline' : 'Node synchronized');
      loadTests();
    } catch { toast.error('State transition failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-ink-900/50 p-4 rounded-2xl border border-ink-800">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-950 rounded-xl border border-ink-800">
            <Search className="w-3.5 h-3.5 text-ink-500" />
            <select
              className="bg-transparent text-xs text-ink-300 outline-none min-w-[120px]"
              value={filters.subject}
              onChange={e => setFilters({ ...filters, subject: e.target.value })}
            >
              <option value="">All Subjects</option>
              {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-950 rounded-xl border border-ink-800">
            <FileText className="w-3.5 h-3.5 text-ink-500" />
            <select
              className="bg-transparent text-xs text-ink-300 outline-none"
              value={filters.testType}
              onChange={e => setFilters({ ...filters, testType: e.target.value })}
            >
              <option value="">All Types</option>
              {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="text-[10px] font-black text-ink-600 uppercase tracking-widest">
          Showing {tests.length} of {pagination.total} Records
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          <p className="text-ink-500 font-mono text-xs">Syncing nodes...</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-ink-800">
          <FileText className="w-16 h-16 text-ink-800 mx-auto mb-4 opacity-20" />
          <p className="text-ink-500 font-display text-lg">No Data Streams Found</p>
          <p className="text-ink-600 text-sm mt-2 font-mono">Adjust your filters to see more content</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(test => (
            <div key={test._id} className={clsx(
              'group relative glass-card p-5 border-ink-800 hover:border-yellow-500/40 transition-all duration-300',
              !test.isActive && 'opacity-60 grayscale-[0.5]'
            )}>
              <div className="flex items-center gap-6">
                <div className={clsx(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border',
                  test.mode === 'structured' ? 'bg-teal-500/10 border-teal-500/20 text-teal-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                )}>
                  {test.mode === 'structured' ? <Zap className="w-7 h-7" /> : <FileText className="w-7 h-7" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black text-white truncate leading-none">{test.name}</h4>
                    {!test.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                        Inactive
                      </span>
                    )}
                    {test.status === 'ready' && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[8px] font-black uppercase tracking-widest border border-teal-500/20">
                        Live
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-ink-500">
                      <BookOpen className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{test.subject}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-ink-800" />
                    <div className="flex items-center gap-1.5 text-ink-500">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{test.totalQuestions} Qs</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-ink-800" />
                    <div className="flex items-center gap-1.5 text-ink-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{test.durationMinutes}m</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(test)}
                    className={clsx(
                      "p-3 rounded-xl transition-all",
                      test.isActive ? "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20" : "bg-ink-800 text-ink-500 hover:bg-ink-700"
                    )}
                    title={test.isActive ? 'Take Offline' : 'Publish to Production'}
                  >
                    {test.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => setEditingTest(test)}
                    className="p-3 bg-ink-800 text-ink-400 hover:bg-yellow-500/20 hover:text-yellow-500 rounded-xl transition-all"
                    title="Reconfigure Parameters"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="p-3 bg-ink-800 text-ink-500 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all"
                    title="Purge Protocol"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
            className="p-3 bg-ink-900 border border-ink-800 rounded-xl text-ink-500 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-xs font-black text-ink-500 uppercase tracking-[0.2em]">
            Page <span className="text-yellow-500">{pagination.page}</span> / {pagination.pages}
          </div>
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="p-3 bg-ink-900 border border-ink-800 rounded-xl text-ink-500 hover:text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {editingTest && (
        <EditTestModal test={editingTest} onClose={() => setEditingTest(null)} onSave={() => { setEditingTest(null); loadTests(); }} />
      )}
    </div>
  );
}

function SeriesTab() {
  const [series, setSeries] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => { loadSeries(); }, [pagination.page, search, sortBy, sortOrder]);

  const loadSeries = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getSeries({ 
        page: pagination.page, 
        limit: 10,
        sortBy,
        sortOrder,
        search
      });
      setSeries(data.series);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('WARNING: Deleting a Series will impact all associated test nodes. Proceed?')) return;
    try {
      await adminAPI.deleteSeries(id);
      toast.success('Series cluster deleted');
      loadSeries();
    } catch { toast.error('Cluster purge failed'); }
  };

  const handleToggleActive = async (s: any) => {
    try {
      await adminAPI.updateSeries(s._id, { isActive: !s.isActive });
      toast.success(s.isActive ? 'Cluster deactivated' : 'Cluster operational');
      loadSeries();
    } catch { toast.error('State update failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-900/50 p-6 rounded-3xl border border-ink-800">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Series Database..."
              className="w-full bg-ink-950 border border-ink-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none transition-all shadow-inner"
            />
          </div>
          <select
            className="bg-ink-950 border border-ink-800 rounded-2xl px-4 py-3 text-xs text-ink-300 outline-none focus:border-yellow-500/50"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="createdAt">Newest First</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10 uppercase text-xs tracking-widest"
        >
          <Plus className="w-5 h-5" /> New Series
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
          <p className="text-ink-500 font-mono text-xs">Accessing Archives...</p>
        </div>
      ) : series.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-ink-800">
          <Target className="w-16 h-16 text-ink-800 mx-auto mb-4 opacity-30" />
          <p className="text-ink-500 font-display text-lg">Empty Cluster Database</p>
          <p className="text-ink-600 text-sm mt-2">Initialize a new series to start populating content</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {series.map(s => (
            <div key={s._id} className={clsx(
              "group glass-card p-6 border-ink-800 hover:border-yellow-500/30 transition-all flex items-center justify-between",
              !s.isActive && "opacity-60"
            )}>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-ink-950 border border-ink-800 flex items-center justify-center text-yellow-500 shadow-inner group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black text-white tracking-tight uppercase">{s.name}</h4>
                    {s.isActive ? (
                      <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[8px] font-black uppercase tracking-widest border border-teal-500/20">Active Cluster</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-500 text-[8px] font-black uppercase tracking-widest border border-ink-700">Offline</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-ink-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Shield className="w-3 h-3"/> {s.provider || 'Platform'}</span>
                    <span className="w-1 h-1 rounded-full bg-ink-800" />
                    <span>{s.totalTests || 0} Nodes</span>
                    <span className="w-1 h-1 rounded-full bg-ink-800" />
                    <span>{s.type?.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleToggleActive(s)} className="p-3 bg-ink-950 text-ink-500 hover:text-white rounded-xl border border-ink-800 transition-all">
                  {s.isActive ? <ToggleRight className="w-5 h-5 text-teal-400" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => setEditingSeries(s)} className="p-3 bg-ink-950 text-ink-500 hover:text-yellow-500 rounded-xl border border-ink-800 transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(s._id)} className="p-3 bg-ink-950 text-ink-600 hover:text-red-500 rounded-xl border border-ink-800 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Styled */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-10">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="p-4 bg-ink-900 border border-ink-800 rounded-2xl text-ink-500 hover:text-white disabled:opacity-20 transition-all shadow-lg"><ChevronLeft className="w-5 h-5"/></button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-ink-600 uppercase tracking-[0.3em] mb-1">Index Navigation</span>
            <span className="text-sm font-black text-white">{pagination.page} <span className="text-ink-600">/</span> {pagination.pages}</span>
          </div>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} className="p-4 bg-ink-900 border border-ink-800 rounded-2xl text-ink-500 hover:text-white disabled:opacity-20 transition-all shadow-lg"><ChevronRight className="w-5 h-5"/></button>
        </div>
      )}

      {showForm && <SeriesFormModal onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); loadSeries(); }} />}
      {editingSeries && <EditSeriesModal series={editingSeries} onClose={() => setEditingSeries(null)} onSave={() => { setEditingSeries(null); loadSeries(); }} />}
    </div>
  );
}



function SeriesFormModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: '', provider: '', type: 'prelims_gs', totalTests: 0 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.createSeries(form);
      toast.success('Series cluster initialized');
      onSave();
    } catch { toast.error('Initialization failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Initialize New Series</h3>
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
          <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1">
            {saving ? 'Initializing...' : 'Initialize Cluster'}
          </button>
          <button onClick={onClose} className="btn-ghost">Abort</button>
        </div>
      </div>
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
  const [sortBy, setSortBy] = useState('mockTest');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => { loadQuestions(); }, [pagination.page, search, subjectFilter, sortBy, sortOrder]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getQuestions({ 
        page: pagination.page, 
        limit: 15, 
        search,
        subject: subjectFilter,
        sortBy,
        sortOrder
      });
      setQuestions(data.questions);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Execute Deletion? This will permanently remove the question node.')) return;
    try {
      await adminAPI.deleteQuestion(id);
      toast.success('Question node purged');
      loadQuestions();
    } catch { toast.error('Purge failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ink-900/50 p-6 rounded-3xl border border-ink-800">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Question Database..."
              className="w-full bg-ink-950 border border-ink-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none transition-all"
            />
          </div>
          <select
            className="bg-ink-950 border border-ink-800 rounded-2xl px-4 py-3 text-xs text-ink-300 outline-none"
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowBulkForm(true)} 
            className="px-5 py-3 bg-ink-800 hover:bg-ink-700 text-ink-200 font-bold rounded-2xl transition-all flex items-center gap-2 border border-ink-700 uppercase text-[10px] tracking-widest"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
          <button 
            onClick={() => setShowForm(true)} 
            className="px-5 py-3 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10 uppercase text-[10px] tracking-widest"
          >
            <Plus className="w-4 h-4" /> Add Node
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
          <p className="text-ink-500 font-mono text-xs uppercase tracking-widest">Querying database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map(q => (
            <div key={q._id} className="group glass-card p-6 border-ink-800 hover:border-ink-600 transition-all relative">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ink-950 border border-ink-800 flex items-center justify-center text-yellow-500 font-black text-xs">
                    #{q.questionNumber}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[9px] font-black uppercase tracking-widest border border-teal-500/20">
                        {q.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-500 text-[9px] font-black uppercase tracking-widest border border-ink-700">
                        {q.year}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingQuestion(q)}
                    className="p-2.5 bg-ink-950 text-ink-400 hover:text-yellow-500 rounded-xl border border-ink-800 hover:border-yellow-500/30 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-2.5 bg-ink-950 text-ink-500 hover:text-red-500 rounded-xl border border-ink-800 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-white text-sm leading-relaxed font-medium">
                  {cleanHtml(q.text)}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <div 
                      key={opt}
                      className={clsx(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        q.correctAnswer?.toLowerCase() === opt.toLowerCase()
                          ? "bg-teal-500/10 border-teal-500/30 text-teal-100"
                          : "bg-ink-950 border-ink-800 text-ink-400"
                      )}
                    >
                      <span className={clsx(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 uppercase",
                        q.correctAnswer?.toLowerCase() === opt.toLowerCase()
                          ? "bg-teal-500 text-ink-950"
                          : "bg-ink-800 text-ink-600"
                      )}>
                        {opt}
                      </span>
                      <span className="text-xs truncate">{cleanHtml(q.options?.[opt] || '')}</span>
                      {q.correctAnswer?.toLowerCase() === opt.toLowerCase() && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Styled */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-10">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="p-4 bg-ink-900 border border-ink-800 rounded-2xl text-ink-500 hover:text-white disabled:opacity-20 transition-all shadow-lg"><ChevronLeft className="w-5 h-5"/></button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-ink-600 uppercase tracking-[0.3em] mb-1">Index Navigation</span>
            <span className="text-sm font-black text-white">{pagination.page} <span className="text-ink-600">/</span> {pagination.pages}</span>
          </div>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} className="p-4 bg-ink-900 border border-ink-800 rounded-2xl text-ink-500 hover:text-white disabled:opacity-20 transition-all shadow-lg"><ChevronRight className="w-5 h-5"/></button>
        </div>
      )}

      {showForm && <QuestionFormModal onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); loadQuestions(); }} />}
      {showBulkForm && <BulkQuestionModal onClose={() => setShowBulkForm(false)} onSave={() => { setShowBulkForm(false); loadQuestions(); }} />}
      {editingQuestion && <QuestionFormModal question={editingQuestion} onClose={() => setEditingQuestion(null)} onSave={() => { setEditingQuestion(null); loadQuestions(); }} />}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, [pagination.page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getUsers({ page: pagination.page, limit: 15, search });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      toast.success('Clearance level updated');
      loadUsers();
    } catch { toast.error('Access modification failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Registry Header */}
      <div className="bg-ink-900/50 p-6 rounded-3xl border border-ink-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Citizen Registry..."
            className="w-full bg-ink-950 border border-ink-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none transition-all shadow-inner"
          />
        </div>
        <div className="text-[10px] font-black text-ink-600 uppercase tracking-[0.2em] text-right">
          <div className="text-white text-lg">{pagination.total}</div>
          Total Registered Users
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {users.map(u => (
            <div key={u._id} className="group glass-card p-4 border-ink-800 hover:bg-ink-900 transition-all flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-ink-950 border border-ink-800 flex items-center justify-center text-xl font-black text-ink-500 shadow-inner group-hover:text-yellow-500 transition-colors uppercase">
                {u.name?.charAt(0) || 'U'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-white truncate">{u.name}</h4>
                  {u.role === 'admin' ? (
                    <span className="px-2 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest border border-yellow-500/20">
                      Level 4 Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg bg-ink-800 text-ink-500 text-[8px] font-black uppercase tracking-widest border border-ink-700">
                      Standard Citizen
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3 h-3 text-ink-600" />
                  <p className="text-xs text-ink-500 truncate">{u.email}</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(u._id);
                    toast.success('ID Copied to Clipboard');
                  }}
                  className="mt-2 flex items-center gap-2 px-2 py-1 bg-ink-950 border border-ink-800 rounded-lg hover:border-yellow-500/30 transition-all group/id"
                >
                  <Copy className="w-3 h-3 text-ink-700 group-hover/id:text-yellow-500" />
                  <span className="text-[10px] font-black text-ink-600 uppercase tracking-widest group-hover/id:text-ink-400">Copy Citizen ID</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-black text-ink-600 uppercase tracking-widest mb-0.5">Joined Matrix</div>
                  <div className="text-[10px] text-ink-400 font-bold">{new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
                
                <div className="h-10 w-px bg-ink-800" />

                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u._id, e.target.value)}
                  className="bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-[10px] font-black text-ink-300 outline-none focus:border-yellow-500/50 uppercase tracking-widest"
                >
                  <option value="user">Assign Citizen</option>
                  <option value="admin">Promote Admin</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination remains consistent */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-4 pt-10">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1} className="p-3 bg-ink-900 border border-ink-800 rounded-xl disabled:opacity-20 transition-all"><ChevronLeft className="w-5 h-5"/></button>
          <span className="py-3 text-xs font-black text-ink-500 uppercase tracking-widest">{pagination.page} <span className="text-ink-800">/</span> {pagination.pages}</span>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.pages} className="p-3 bg-ink-900 border border-ink-800 rounded-xl disabled:opacity-20 transition-all"><ChevronRight className="w-5 h-5"/></button>
        </div>
      )}
    </div>
  );
}

function CreateTestTab_Legacy() {
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
      console.log("[Admin] Uploading structured test with payload:", { 
        name: payload.name, 
        testSeriesId: payload.testSeriesId,
        questionPaperLength: payload.questionPaperText?.length,
        solutionLength: payload.solutionText?.length
      });
      const response = await mockTestAPI.uploadStructured(payload);
      console.log("[Admin] Upload response:", response);
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
      console.error("[Admin] Upload error:", err);
      console.error("[Admin] Upload error response:", err.response?.data);
      toast.error(err.response?.data?.error || err.message || 'Upload failed');
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

function CreateTestTab() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStructuredForm, setShowStructuredForm] = useState(false);
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
    } catch (err) { console.error(err); }
  };

  const loadSeries = async () => {
    try {
      const { data } = await testsAPI.getSeries();
      setAllSeries(data || []);
    } catch (err) { console.error(err); }
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getQuestions({ limit: 100 });
      setQuestions(data.questions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStructuredUpload = async () => {
    if (!questionPaperText.trim() || !solutionText.trim()) {
      return toast.error('Incomplete data streams detected');
    }

    setUploadingStructured(true);
    try {
      const payload = {
        ...structuredData,
        totalQuestions: parseInt(structuredData.totalQuestions),
        durationMinutes: parseInt(structuredData.durationMinutes),
        markCorrect: parseFloat(structuredData.markCorrect),
        markWrong: parseFloat(structuredData.markWrong),
        year: parseInt(structuredData.year),
        questionPaperText,
        solutionText,
        testSeriesId: selectedSeriesId
      };
      await mockTestAPI.uploadStructured(payload);
      toast.success('Test node synthesized successfully');
      setShowStructuredForm(false);
      setQuestionPaperText('');
      setSolutionText('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Synthesis failed');
    } finally {
      setUploadingStructured(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Launchpad Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => setShowStructuredForm(true)}
          className="group glass-card p-8 border-ink-800 hover:border-teal-500/50 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
            <Zap className="w-20 h-20 text-teal-400" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Structured Synthesis</h3>
            <p className="text-sm text-ink-500 leading-relaxed max-w-[280px]">
              Upload raw text data to automatically generate full-scale mock tests with AI-powered parsing.
            </p>
          </div>
        </div>

        <div className="group glass-card p-8 border-ink-800 hover:border-yellow-500/50 transition-all cursor-not-allowed opacity-60 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Layers className="w-20 h-20 text-yellow-500" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Manual Constructor</h3>
            <p className="text-sm text-ink-500 leading-relaxed max-w-[280px]">
              Select individual nodes from the question database to construct a custom examination pattern.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-950 border border-ink-800 text-[8px] font-black uppercase tracking-widest text-ink-600">
              Maintenance Required
            </div>
          </div>
        </div>
      </div>

      {showStructuredForm && (
        <div className="animate-slide-up space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Settings className="w-4 h-4 text-teal-400" /> Synthesis Parameters
            </h2>
            <button onClick={() => setShowStructuredForm(false)} className="text-xs text-ink-600 hover:text-white uppercase font-black tracking-widest transition-colors">Abort Launch</button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-card p-6 border-ink-800 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Test Designation</label>
                  <input 
                    value={structuredData.name}
                    onChange={e => setStructuredData({...structuredData, name: e.target.value})}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 outline-none"
                    placeholder="E.g. Prelims Mock X"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Target Series</label>
                  <select 
                    value={selectedSeriesId}
                    onChange={e => setSelectedSeriesId(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-ink-300 outline-none focus:border-teal-500/50"
                  >
                    <option value="">Independent Node</option>
                    {allSeries.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Subject</label>
                    <input 
                      value={structuredData.subject}
                      onChange={e => setStructuredData({...structuredData, subject: e.target.value})}
                      className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Year</label>
                    <input 
                      value={structuredData.year}
                      onChange={e => setStructuredData({...structuredData, year: e.target.value})}
                      className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Qs Load</label>
                    <input 
                      value={structuredData.totalQuestions}
                      onChange={e => setStructuredData({...structuredData, totalQuestions: e.target.value})}
                      className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Time (m)</label>
                    <input 
                      value={structuredData.durationMinutes}
                      onChange={e => setStructuredData({...structuredData, durationMinutes: e.target.value})}
                      className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={handleStructuredUpload}
                disabled={uploadingStructured}
                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-teal-500/10 uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3"
              >
                {uploadingStructured ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Initiate Synthesis
              </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Question Paper Stream</label>
                    <span className="text-[8px] text-ink-700 font-mono">{questionPaperText.length} Bytes</span>
                  </div>
                  <textarea 
                    value={questionPaperText}
                    onChange={e => setQuestionPaperText(e.target.value)}
                    className="w-full h-96 bg-ink-950 border border-ink-800 rounded-2xl p-6 text-xs text-ink-300 font-mono focus:border-teal-500/30 outline-none resize-none shadow-inner"
                    placeholder="Paste Question Data Here..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Solution Matrix</label>
                    <span className="text-[8px] text-ink-700 font-mono">{solutionText.length} Bytes</span>
                  </div>
                  <textarea 
                    value={solutionText}
                    onChange={e => setSolutionText(e.target.value)}
                    className="w-full h-96 bg-ink-950 border border-ink-800 rounded-2xl p-6 text-xs text-ink-300 font-mono focus:border-teal-500/30 outline-none resize-none shadow-inner"
                    placeholder="Paste Solution Data Here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [showActivateModal, setShowActivateModal] = useState<any>(null);

  useEffect(() => {
    loadSubscriptions();
    loadPlans();
  }, [pagination.page, filter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getSubscriptions({ page: pagination.page, limit: 15, ...filter });
      setSubscriptions(data.subscriptions);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadPlans = async () => {
    try {
      const { data } = await adminAPI.getSubscriptionPlans();
      setPlans(data);
    } catch (err) { console.error(err); }
  };

  const togglePlan = async (plan: any) => {
    try {
      await adminAPI.updateSubscriptionPlan(plan._id, { isActive: !plan.isActive });
      loadPlans();
      toast.success(plan.isActive ? 'Tier Locked' : 'Tier Operational');
    } catch { toast.error('State update failed'); }
  };

  const updateSubscriptionStatus = async (sub: any, newStatus: string) => {
    try {
      await adminAPI.updateSubscription(sub._id, { status: newStatus });
      loadSubscriptions();
      toast.success('Clearance status updated');
    } catch { toast.error('Update failed'); }
  };

  const activateUser = async (userId: string, planId: string) => {
    try {
      await adminAPI.activateUserSubscription(userId, { planId });
      setShowActivateModal(false);
      loadSubscriptions();
      toast.success('Manual authorization granted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authorization failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Contracts', value: stats.active, icon: Shield, color: 'teal' },
          { label: 'Total Volume', value: stats.total, icon: Activity, color: 'blue' },
          { label: 'Expired Clearances', value: stats.expired, icon: XCircle, color: 'red' },
        ].map(s => (
          <div key={s.label} className="glass-card p-6 border-ink-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-3xl font-black text-white">{s.value}</div>
            </div>
            <div className={clsx(
              "p-3 rounded-xl",
              s.color === 'teal' ? 'bg-teal-500/10 text-teal-400' : 
              s.color === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
            )}>
              <s.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Tiers */}
      <div className="glass-card p-8 border-ink-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Crown className="w-4 h-4 text-yellow-500" /> Nexus Subscription Tiers
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowActivateModal(true)}
              className="px-4 py-2 bg-ink-800 hover:bg-ink-700 text-ink-200 text-[10px] font-black uppercase tracking-widest rounded-xl border border-ink-700 transition-all flex items-center gap-2"
            >
              <CreditCard className="w-3.5 h-3.5" /> Manual Activation
            </button>
            <button 
              onClick={() => setShowPlanForm(true)} 
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-ink-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-yellow-500/10"
            >
              New Plan
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan._id} className={clsx(
              "p-6 rounded-2xl border transition-all relative overflow-hidden group",
              plan.isActive ? "bg-ink-900 border-ink-800 hover:border-yellow-500/30" : "bg-ink-950 border-ink-900 opacity-50"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-black text-white uppercase tracking-tight">{plan.name}</h4>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => togglePlan(plan)} className="p-2 bg-ink-950 rounded-lg text-ink-500 hover:text-white">
                    {plan.isActive ? <ToggleRight className="w-4 h-4 text-teal-400" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-yellow-500">₹{plan.price}</span>
                <span className="text-[10px] text-ink-600 font-bold uppercase tracking-widest">/ {plan.duration} {plan.durationUnit}</span>
              </div>
              <div className="pt-4 border-t border-ink-800 flex items-center justify-between">
                <span className={clsx(
                  "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                  plan.isActive ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-ink-800 text-ink-600 border-ink-700"
                )}>
                  {plan.isActive ? 'Active' : 'Locked'}
                </span>
                {plan.isActive && <Shield className="w-3.5 h-3.5 text-ink-700" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registry of Contracts */}
      <div className="glass-card p-8 border-ink-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Clearance Registry</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-ink-600" />
              <input 
                value={filter.search}
                onChange={e => setFilter({...filter, search: e.target.value})}
                placeholder="Search Citizens..."
                className="bg-ink-950 border border-ink-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-yellow-500/30 outline-none"
              />
            </div>
            <select 
              value={filter.status}
              onChange={e => setFilter({...filter, status: e.target.value})}
              className="bg-ink-950 border border-ink-800 rounded-xl px-3 py-2 text-[10px] font-black text-ink-500 outline-none uppercase tracking-widest"
            >
              <option value="">All Status</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map(sub => (
              <div key={sub._id} className="group flex items-center gap-6 p-4 bg-ink-900/40 border border-ink-900 hover:bg-ink-900 hover:border-ink-800 rounded-2xl transition-all">
                <div className="w-10 h-10 rounded-xl bg-ink-950 border border-ink-800 flex items-center justify-center text-ink-500 font-black group-hover:text-yellow-500 transition-colors">
                  {(sub.userId?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-sm font-black text-white truncate">{sub.userId?.name || 'Unknown Subject'}</h4>
                    <span className={clsx(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                      sub.status === 'active' ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-ink-600 font-bold uppercase tracking-widest">{sub.planName}</span>
                    <div className="w-1 h-1 rounded-full bg-ink-800" />
                    <span className="text-[10px] text-ink-500 font-mono">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '??'} → {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '??'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {sub.status === 'active' ? (
                    <button onClick={() => updateSubscriptionStatus(sub, 'cancelled')} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition-all">
                      <XCircle className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => updateSubscriptionStatus(sub, 'active')} className="p-2.5 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 rounded-xl border border-teal-500/20 transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPlanForm && <PlanFormModal onClose={() => setShowPlanForm(false)} onSave={() => { setShowPlanForm(false); loadPlans(); }} />}
      {showActivateModal && <ActivateUserModal onClose={() => setShowActivateModal(false)} onActivate={activateUser} />}
    </div>
  );
}

function CoursesTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data } = await coursesAPI.getAllCourses();
      setCourses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadLessons = async (courseId: string) => {
    try {
      const { data } = await coursesAPI.getAdminCourseLessons(courseId);
      setLessons(data);
    } catch (err) { console.error(err); }
  };

  const handleTogglePublished = async (course: any) => {
    try {
      await coursesAPI.updateCourse(course._id, { isPublished: !course.isPublished });
      loadCourses();
      toast.success(course.isPublished ? 'Module Offline' : 'Module Published');
    } catch { toast.error('Publication failed'); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Execute Module Deletion? This will wipe all lessons.')) return;
    try {
      await coursesAPI.deleteCourse(id);
      toast.success('Module purged');
      loadCourses();
    } catch { toast.error('Purge failed'); }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Purge this lesson node?')) return;
    try {
      await coursesAPI.deleteLesson(id);
      toast.success('Lesson purged');
      if (selectedCourse) loadLessons(selectedCourse._id);
    } catch { toast.error('Purge failed'); }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
          <PlayCircle className="w-4 h-4 text-blue-400" /> Academy Management
        </h2>
        <button 
          onClick={() => setShowCourseForm(true)} 
          className="relative z-[40] px-6 py-3 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-ink-950 font-black rounded-2xl transition-all shadow-lg shadow-yellow-500/10 flex items-center gap-2 uppercase text-xs tracking-widest cursor-pointer"
        >
          <Plus className="w-5 h-5" /> New Module
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="glass-card p-20 text-center border-dashed border-ink-800">
          <PlayCircle className="w-16 h-16 text-ink-800 mx-auto mb-4 opacity-30" />
          <p className="text-ink-500 font-display text-lg">Empty Academy Archive</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div key={course._id} className="group glass-card p-6 border-ink-800 hover:border-blue-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 relative">
                    <Video className="w-6 h-6" />
                    {course.isPremium && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-ink-950">
                        <Crown className="w-2 h-2 text-ink-950" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditingCourse(course)} className="p-2 bg-ink-950 text-ink-500 hover:text-yellow-500 rounded-xl border border-ink-800 transition-all"><Edit2 className="w-3.5 h-3.5"/></button>
                    <button onClick={() => handleDeleteCourse(course._id)} className="p-2 bg-ink-950 text-ink-600 hover:text-red-500 rounded-xl border border-ink-800 transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                </div>
                <h4 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h4>
                <p className="text-xs text-ink-500 line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(course._id);
                      toast.success('Module ID Copied');
                    }}
                    className="flex items-center gap-2 px-2 py-1 bg-ink-950 border border-ink-800 rounded-lg hover:border-blue-500/30 transition-all group/id"
                  >
                    <Copy className="w-3 h-3 text-ink-700 group-hover/id:text-blue-500" />
                    <span className="text-[10px] font-black text-ink-600 uppercase tracking-widest group-hover/id:text-ink-400">Copy Module ID</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-ink-800 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-ink-700 font-black uppercase tracking-widest mb-1">Status</span>
                    <span className={clsx(
                      "text-[9px] font-black uppercase tracking-widest",
                      course.isPublished ? "text-teal-400" : "text-ink-500"
                    )}>
                      {course.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-ink-800" />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-ink-700 font-black uppercase tracking-widest mb-1">Index</span>
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{course.lessonCount || 0} Nodes</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleTogglePublished(course)}
                    className={clsx(
                      "p-2 rounded-xl transition-all border",
                      course.isPublished ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-ink-800 border-ink-700 text-ink-500"
                    )}
                  >
                    {course.isPublished ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => { setSelectedCourse(course); loadLessons(course._id); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/10"
                  >
                    Manage Index
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCourseForm && <CourseFormModal onClose={() => setShowCourseForm(false)} onSave={() => { setShowCourseForm(false); loadCourses(); }} />}
      {editingCourse && <CourseFormModal course={editingCourse} onClose={() => setEditingCourse(null)} onSave={() => { setEditingCourse(null); loadCourses(); }} />}
      {showLessonForm && <LessonFormModal courseId={selectedCourse._id} onClose={() => setShowLessonForm(false)} onSave={() => { setShowLessonForm(false); loadLessons(selectedCourse._id); }} />}
      {editingLesson && <LessonFormModal courseId={selectedCourse._id} lesson={editingLesson} onClose={() => setEditingLesson(null)} onSave={() => { setEditingLesson(null); loadLessons(selectedCourse._id); }} />}

      {/* Lesson Index Drawer */}
      {selectedCourse && (
        <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-ink-950 border-l border-ink-800 p-8 overflow-y-auto z-[100] shadow-2xl animate-slide-left">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Index Manager</h3>
                <p className="text-[10px] text-ink-600 font-black uppercase tracking-widest">{selectedCourse.title}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCourse(null)} className="p-3 bg-ink-900 text-ink-400 hover:text-white rounded-2xl hover:bg-ink-800 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <button
            onClick={() => setShowLessonForm(true)}
            className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] mb-8"
          >
            <Plus className="w-5 h-5" /> Append Lesson
          </button>

          <div className="space-y-4">
            {lessons.map((lesson, idx) => (
              <div key={lesson._id} className="group p-5 bg-ink-900/50 border border-ink-800 hover:border-blue-500/30 rounded-2xl transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-black text-ink-700 font-mono w-4">{String(idx + 1).padStart(2, '0')}</div>
                  <div>
                    <h5 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{lesson.title}</h5>
                    <span className="text-[9px] text-ink-600 font-bold uppercase tracking-widest">{lesson.duration || 'Video Node'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingLesson(lesson)} className="p-2 text-ink-600 hover:text-yellow-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDeleteLesson(lesson._id)} className="p-2 text-ink-700 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', type: 'info' });
  const [manualEnroll, setManualEnroll] = useState({ userId: '', courseId: '', amount: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configRes, announceRes] = await Promise.all([
        settingsAPI.getConfig(),
        settingsAPI.getAnnouncements()
      ]);
      setConfig(configRes.data);
      setAnnouncements(announceRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (updates: any) => {
    try {
      setSaving(true);
      const { data } = await settingsAPI.updateConfig({ ...config, ...updates });
      setConfig(data);
      toast.success('System parameters updated');
    } catch {
      toast.error('Sync failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    try {
      await settingsAPI.createAnnouncement(newAnnouncement);
      setNewAnnouncement({ title: '', content: '', type: 'info' });
      const { data } = await settingsAPI.getAnnouncements();
      setAnnouncements(data);
      toast.success('Announcement broadcasted');
    } catch {
      toast.error('Broadcast failed');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await settingsAPI.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      toast.success('Announcement purged');
    } catch {
      toast.error('Purge failed');
    }
  };

  const handleManualEnroll = async () => {
    if (!manualEnroll.userId || !manualEnroll.courseId) return toast.error('Incomplete credentials');
    try {
      await settingsAPI.manualEnroll(manualEnroll);
      setManualEnroll({ userId: '', courseId: '', amount: 0 });
      toast.success('Citizen enrolled successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Enrollment failed');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      {/* Payment Gateway Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-ink-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CreditCard className="w-24 h-24 text-yellow-500" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-yellow-500" /> Financial Protocols
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between p-4 bg-ink-950/50 rounded-2xl border border-ink-800">
              <div>
                <div className="text-xs font-black text-white uppercase tracking-wider mb-1">Razorpay Integration</div>
                <div className="text-[10px] text-ink-500 font-bold uppercase tracking-widest">Automatic UPI & Card Processing</div>
              </div>
              <button 
                onClick={() => handleUpdateConfig({ paymentMethod: config.paymentMethod === 'razorpay' ? 'manual' : 'razorpay' })}
                className={clsx(
                  "p-2 rounded-xl border transition-all",
                  config.paymentMethod === 'razorpay' ? "bg-teal-500/10 border-teal-500/50 text-teal-400" : "bg-ink-800 border-ink-700 text-ink-600"
                )}
              >
                {config.paymentMethod === 'razorpay' ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            {config.paymentMethod === 'razorpay' ? (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Key ID</label>
                  <input 
                    value={config.razorpayKeyId}
                    onChange={e => setConfig({...config, razorpayKeyId: e.target.value})}
                    onBlur={() => handleUpdateConfig({ razorpayKeyId: config.razorpayKeyId })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none"
                    placeholder="rzp_live_..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Key Secret</label>
                  <input 
                    type="password"
                    value={config.razorpayKeySecret}
                    onChange={e => setConfig({...config, razorpayKeySecret: e.target.value})}
                    onBlur={() => handleUpdateConfig({ razorpayKeySecret: config.razorpayKeySecret })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Telegram Handle</label>
                  <input 
                    value={config.telegramHandle}
                    onChange={e => setConfig({...config, telegramHandle: e.target.value})}
                    onBlur={() => handleUpdateConfig({ telegramHandle: config.telegramHandle })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Direct Payment Link</label>
                  <input 
                    value={config.telegramLink}
                    onChange={e => setConfig({...config, telegramLink: e.target.value})}
                    onBlur={() => handleUpdateConfig({ telegramLink: config.telegramLink })}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                    placeholder="https://t.me/..."
                  />
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <div className="flex gap-3">
                    <MessageSquare className="w-5 h-5 text-blue-400 shrink-0" />
                    <p className="text-[10px] text-blue-300 font-bold leading-relaxed uppercase tracking-wide">
                      Manual mode enabled. Users will be directed to your Telegram for payment coordination. You must manually enroll them after verification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-8 border-ink-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Percent className="w-24 h-24 text-teal-500" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
            <Percent className="w-4 h-4 text-teal-500" /> Global Economy
          </h3>
          
          <div className="space-y-8 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest block">Global Platform Discount</label>
                <div className={clsx(
                  "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                  config.globalDiscount?.isActive ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-ink-800 text-ink-500 border-ink-700"
                )}>
                  {config.globalDiscount?.isActive ? 'Operational' : 'Disabled'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" />
                  <input 
                    type="number"
                    value={config.globalDiscount?.percentage}
                    onChange={e => setConfig({...config, globalDiscount: {...config.globalDiscount, percentage: parseInt(e.target.value)}})}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl pl-12 pr-4 py-3 text-lg font-black text-white focus:border-teal-500/50 outline-none"
                    placeholder="0"
                  />
                </div>
                <button 
                  onClick={() => handleUpdateConfig({ globalDiscount: {...config.globalDiscount, isActive: !config.globalDiscount?.isActive} })}
                  className={clsx(
                    "px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border",
                    config.globalDiscount?.isActive ? "bg-teal-500 text-ink-950 border-teal-400" : "bg-ink-800 border-ink-700 text-ink-500"
                  )}
                >
                  {config.globalDiscount?.isActive ? 'Deactivate' : 'Apply Globally'}
                </button>
              </div>
              <p className="text-[9px] text-ink-600 font-bold uppercase mt-3 tracking-widest">
                * This percentage will be deducted from all course prices platform-wide.
              </p>
            </div>

            <div className="pt-8 border-t border-ink-800">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Manual Citizen Enrollment</h4>
              <div className="space-y-3">
                <input 
                  value={manualEnroll.userId}
                  onChange={e => setManualEnroll({...manualEnroll, userId: e.target.value})}
                  className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white focus:border-yellow-500/30 outline-none"
                  placeholder="Citizen ID (User MongoDB ID)"
                />
                <input 
                  value={manualEnroll.courseId}
                  onChange={e => setManualEnroll({...manualEnroll, courseId: e.target.value})}
                  className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white focus:border-yellow-500/30 outline-none"
                  placeholder="Module ID (Course MongoDB ID)"
                />
                <div className="flex gap-3">
                  <input 
                    type="number"
                    value={manualEnroll.amount}
                    onChange={e => setManualEnroll({...manualEnroll, amount: parseInt(e.target.value)})}
                    className="flex-1 bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white focus:border-yellow-500/30 outline-none"
                    placeholder="Paid Amount (INR)"
                  />
                  <button 
                    onClick={handleManualEnroll}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-xl transition-all shadow-lg shadow-yellow-500/10 uppercase text-[10px] tracking-widest"
                  >
                    Enroll Citizen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="glass-card p-8 border-ink-800">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
          <Bell className="w-4 h-4 text-purple-500" /> Broadcast Terminal
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 bg-ink-950/50 border border-ink-800 rounded-2xl space-y-4">
              <input 
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                className="w-full bg-ink-900 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white focus:border-purple-500/50 outline-none"
                placeholder="Broadcast Headline"
              />
              <textarea 
                value={newAnnouncement.content}
                onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                className="w-full h-32 bg-ink-900 border border-ink-800 rounded-xl p-4 text-xs text-white focus:border-purple-500/50 outline-none resize-none"
                placeholder="Message Payload..."
              />
              <div className="grid grid-cols-2 gap-3">
                <select 
                  value={newAnnouncement.type}
                  onChange={e => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                  className="bg-ink-900 border border-ink-800 rounded-xl px-4 py-2 text-[10px] font-black text-ink-400 outline-none uppercase"
                >
                  <option value="info">Information</option>
                  <option value="alert">Alert</option>
                  <option value="discount">Discount</option>
                  <option value="update">System Update</option>
                </select>
                <button 
                  onClick={handleCreateAnnouncement}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                >
                  <Send className="w-3.5 h-3.5" /> Transmit
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {announcements.length === 0 ? (
              <div className="p-20 text-center border-2 border-dashed border-ink-900 rounded-3xl">
                <Bell className="w-12 h-12 text-ink-900 mx-auto mb-4" />
                <p className="text-ink-600 font-bold uppercase tracking-widest text-[10px]">No Active Broadcasts</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {announcements.map(a => (
                  <div key={a._id} className="group p-5 bg-ink-900/40 border border-ink-800 hover:border-purple-500/30 rounded-2xl transition-all flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={clsx(
                        "p-3 rounded-xl",
                        a.type === 'alert' ? 'bg-red-500/10 text-red-400' :
                        a.type === 'discount' ? 'bg-teal-500/10 text-teal-400' :
                        a.type === 'update' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                      )}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-sm font-black text-white uppercase tracking-tight">{a.title}</h4>
                          <span className="text-[8px] font-bold text-ink-600 uppercase">{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-ink-400 leading-relaxed max-w-lg">{a.content}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAnnouncement(a._id)}
                      className="p-2 text-ink-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
