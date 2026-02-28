'use client';
import { useEffect, useState } from 'react';
import { libraryAPI } from '@/lib/api';
import { 
  BookOpen, Plus, ChevronDown, ChevronUp, CheckCircle2, 
  Circle, Clock, Trash2, BookMarked, FileText, Video, 
  GraduationCap, ClipboardList, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SUBJECTS = ['Polity', 'History', 'Geography', 'Economy', 'Environment', 'Science & Tech', 'Ethics', 'Current Affairs', 'CSAT', 'Optional', 'Essay'];
const SOURCE_TYPES = [
  { value: 'book', label: 'Book', icon: BookOpen },
  { value: 'notes', label: 'Notes', icon: FileText },
  { value: 'coaching', label: 'Coaching', icon: GraduationCap },
  { value: 'test_series', label: 'Test Series', icon: ClipboardList },
  { value: 'video', label: 'Video Course', icon: Video },
];

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'text-ink-500', bg: 'bg-ink-700' },
  ongoing: { label: 'Ongoing', color: 'text-yellow-400', bg: 'bg-yellow-500' },
  completed: { label: 'Completed', color: 'text-teal-400', bg: 'bg-teal-500' },
};

export default function LibraryPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [form, setForm] = useState({
    title: '', type: 'book', subject: '', syllabusText: '',
    manualChapters: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadSources(); }, []);

  const loadSources = async () => {
    try {
      const { data } = await libraryAPI.getSources();
      setSources(data);
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.subject) { toast.error('Title and subject required'); return; }
    setCreating(true);
    try {
      const payload: any = { title: form.title, type: form.type, subject: form.subject };
      if (form.syllabusText) payload.syllabusText = form.syllabusText;
      if (form.manualChapters) {
        payload.chapters = form.manualChapters.split('\n').filter(Boolean).map(c => ({
          title: c.trim(), status: 'not_started', estimatedHours: 2, revisionCount: 0
        }));
      }
      const { data } = await libraryAPI.addSource(payload);
      setSources(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ title: '', type: 'book', subject: '', syllabusText: '', manualChapters: '' });
      toast.success(form.syllabusText ? 'AI parsed your syllabus!' : 'Source added!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add source');
    } finally { setCreating(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? Removing this source will also affect any active Missions linked to it.")) return;
    
    const loadingToast = toast.loading("Removing source from shelf...");
    try {
      await libraryAPI.deleteSource(id);
      setSources(prev => prev.filter(s => s._id !== id));
      toast.success('Source removed successfully', { id: loadingToast });
    } catch (err: any) {
      toast.error('Failed to delete source', { id: loadingToast });
    }
  };

  const updateChapter = async (sourceId: string, chIdx: number, status: string) => {
    try {
      const { data } = await libraryAPI.updateChapter(sourceId, chIdx, { status });
      setSources(prev => prev.map(s => s._id === sourceId ? data : s));
    } catch { toast.error('Failed to update'); }
  };

  const filteredSources = filterSubject ? sources.filter(s => s.subject === filterSubject) : sources;
  const subjectGroups = SUBJECTS.map(subject => ({
    subject,
    sources: filteredSources.filter(s => s.subject === subject)
  })).filter(g => g.sources.length > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Library Shelf</h1>
          <p className="text-ink-500 text-sm mt-1">{sources.length} sources · Tracking knowledge units</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Source
        </button>
      </div>
<div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterSubject('')} className={clsx('px-3 py-1.5 rounded-lg text-xs font-mono transition-all', !filterSubject ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-ink-800 text-ink-400 border border-ink-700 hover:border-ink-600')}>
          All
        </button>
        {SUBJECTS.map(s => sources.some(src => src.subject === s) && (
          <button key={s} onClick={() => setFilterSubject(filterSubject === s ? '' : s)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-mono transition-all', filterSubject === s ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-ink-800 text-ink-400 border border-ink-700 hover:border-ink-600')}>
            {s}
          </button>
        ))}
      </div>
{showForm && (
        <div className="glass-card p-6 border border-yellow-500/30 animate-slide-up">
           <h3 className="font-display text-lg font-semibold mb-4">New Study Resource</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <input
               value={form.title}
               onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
               placeholder="Title (e.g. Laxmikanth)"
               className="input-field md:col-span-2"
             />
             <select
               value={form.type}
               onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
               className="input-field"
             >
               {SOURCE_TYPES.map((t) => (
                 <option key={t.value} value={t.value}>{t.label}</option>
               ))}
             </select>
             <select
               value={form.subject}
               onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
               className="input-field md:col-span-3"
             >
               <option value="">Subject</option>
               {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>

           <div className="mt-4">
             <label className="text-[11px] font-mono text-ink-500 uppercase tracking-wider">
               Paste Syllabus (AI will convert to chapters)
             </label>
             <textarea
               value={form.syllabusText}
               onChange={e => setForm(p => ({ ...p, syllabusText: e.target.value }))}
               placeholder="Paste full syllabus text here..."
               className="input-field min-h-[110px] mt-2 w-full resize-y"
             />
           </div>

           <div className="mt-4">
             <label className="text-[11px] font-mono text-ink-500 uppercase tracking-wider">
               Or Add Chapters Manually (One per line)
             </label>
             <textarea
               value={form.manualChapters}
               onChange={e => setForm(p => ({ ...p, manualChapters: e.target.value }))}
               placeholder={`Chapter 1\nChapter 2\nChapter 3`}
               className="input-field min-h-[90px] mt-2 w-full resize-y"
             />
             <p className="text-[10px] text-ink-600 mt-2">
               If manual chapters are provided, they will be used directly.
             </p>
           </div>

           <div className="flex gap-3 mt-5">
             <button onClick={handleCreate} disabled={creating} className="btn-primary">{creating ? 'Processing...' : 'Add to Shelf'}</button>
             <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
           </div>
        </div>
      )}
{loading ? (
        <div className="text-center py-12 text-ink-600 font-mono animate-pulse text-xs">Accessing Archives...</div>
      ) : (
        <div className="space-y-8">
          {subjectGroups.map(({ subject, sources: subSources }) => {
            const total = subSources.reduce((s, src) => s + src.totalChapters, 0);
            const done = subSources.reduce((s, src) => s + src.completedChapters, 0);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={subject} className="space-y-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-xs font-bold text-ink-400 uppercase tracking-[0.2em]">{subject}</h3>
                  <div className="h-[1px] flex-1 bg-ink-800"></div>
                  <span className="text-[10px] font-mono text-ink-500">{pct}% Mastered</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {subSources.map((source: any) => (
                    <SourceCard
                      key={source._id}
                      source={source}
                      expanded={expanded === source._id}
                      onExpand={() => setExpanded(expanded === source._id ? null : source._id)}
                      onUpdateChapter={(chIdx: number, status: string) => updateChapter(source._id, chIdx, status)}
                      onDelete={() => handleDelete(source._id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SourceCard({ source, expanded, onExpand, onUpdateChapter, onDelete }: any) {
  const TypeIcon = SOURCE_TYPES.find(t => t.value === source.type)?.icon || BookOpen;
  const pct = source.completionPercentage || 0;

  return (
    <div className={clsx(
      "glass-card overflow-hidden transition-all duration-300",
      expanded ? "border-ink-600 bg-ink-900/40" : "border-ink-800/50 hover:border-ink-700"
    )}>
      <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={onExpand}>
        <div className="w-10 h-10 rounded-xl bg-ink-950 border border-ink-800 flex items-center justify-center shrink-0">
          <TypeIcon className="w-5 h-5 text-ink-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
             <h4 className="text-sm font-bold text-ink-100 truncate">{source.title}</h4>
             <span className="text-[10px] font-mono text-ink-500 uppercase">{source.type}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-ink-950 rounded-full overflow-hidden">
              <div 
                className={clsx('h-full transition-all duration-700', pct >= 70 ? 'bg-teal-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-deep-500')} 
                style={{ width: `${pct}%` }} 
              />
            </div>
            <span className="text-[10px] font-mono text-ink-400 w-8 text-right">{pct}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {expanded ? <ChevronUp className="w-4 h-4 text-ink-500" /> : <ChevronDown className="w-4 h-4 text-ink-500" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-ink-800/50 bg-ink-950/30 p-4 animate-in fade-in slide-in-from-top-1">
<div className="flex items-center justify-between mb-4 px-1">
             <div className="flex gap-4 text-[10px] font-mono text-ink-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {source.completedChapters}/{source.totalChapters} Units</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {source.totalChapters * 2}h Est.</span>
             </div>
<button 
               onClick={(e) => { e.stopPropagation(); onDelete(); }}
               className="p-2 text-ink-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
               title="Remove Source"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {source.chapters?.map((ch: any, idx: number) => (
              <div 
                key={idx} 
                className={clsx(
                  'flex items-center gap-3 p-2.5 rounded-lg text-[11px] transition-all border', 
                  ch.status === 'completed' ? 'bg-teal-950/10 border-teal-900/20 opacity-60' : 'bg-ink-900/40 border-ink-800/50 hover:border-ink-700'
                )}
              >
                <button 
                  onClick={() => {
                    const nextStatus = ch.status === 'not_started' ? 'ongoing' : ch.status === 'ongoing' ? 'completed' : 'not_started';
                    onUpdateChapter(idx, nextStatus);
                  }} 
                  className="shrink-0 transition-transform active:scale-90"
                >
                  {ch.status === 'completed' ? <CheckCircle2 className="w-4 h-4 text-teal-500" /> : 
                   ch.status === 'ongoing' ? <div className="w-4 h-4 rounded-full border-2 border-yellow-500 animate-pulse" /> : 
                   <Circle className="w-4 h-4 text-ink-700 hover:text-ink-500" />}
                </button>
                
                <span className={clsx('flex-1 truncate', ch.status === 'completed' ? 'line-through text-ink-500' : 'text-ink-200')}>
                  {ch.title}
                </span>

                <span className={clsx(
                  'px-1.5 py-0.5 rounded-[4px] text-[9px] font-mono font-bold uppercase tracking-tighter',
                  STATUS_CONFIG[ch.status as keyof typeof STATUS_CONFIG]?.color || 'text-ink-500',
                  'bg-ink-950/50 border border-ink-800'
                )}>
                  {STATUS_CONFIG[ch.status as keyof typeof STATUS_CONFIG]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

