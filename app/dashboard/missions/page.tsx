

'use client';
import { useEffect, useState } from 'react';
import { missionsAPI, libraryAPI } from '@/lib/api';
import {
  Target, Plus, AlertTriangle, CheckCircle2, Clock, Zap,
  ChevronDown, ChevronUp, Trash2, RefreshCw, Flag, Brain
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SUBJECTS = ['Polity', 'History', 'Geography', 'Economy', 'Environment', 'Science & Tech', 'Ethics', 'Current Affairs', 'CSAT', 'Optional', 'Essay'];

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', subject: '', deadline: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [mRes, sRes] = await Promise.allSettled([missionsAPI.getMissions(), libraryAPI.getSources()]);
      if (mRes.status === 'fulfilled') setMissions(mRes.value.data);
      if (sRes.status === 'fulfilled') setSources(sRes.value.data);
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.subject || !form.deadline) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      const { data } = await missionsAPI.createMission(form);
      toast.success('Mission created! AI strategy ready.');
      setMissions(prev => [data.mission, ...prev]);
      setShowForm(false);
      setForm({ title: '', subject: '', deadline: '', description: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create mission');
    } finally { setCreating(false); }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This mission's AI schedule will be wiped.")) return;
    
    const loadingToast = toast.loading("Deleting mission...");
    try {
      await missionsAPI.deleteMission(id);
      setMissions(prev => prev.filter(m => m._id !== id));
      toast.success('Mission purged from OS', { id: loadingToast });
    } catch {
      toast.error('Failed to delete', { id: loadingToast });
    }
  };

  const handleRebalance = async (id: string) => {
    try {
      const { data } = await missionsAPI.rebalance(id);
      toast.success(`Rebalanced! Schedule updated.`);
      loadData();
    } catch { toast.error('Failed to rebalance'); }
  };

  const handleToggleTask = async (missionId: string, date: string) => {
    try {
      const { data } = await missionsAPI.toggleTask(missionId, date);
      setMissions(prev => prev.map(m => m._id === missionId ? data.mission : m));
      toast.success("Progress updated!");
    } catch (err: any) { toast.error("Update failed"); }
  };

  const activeMissions = missions.filter(m => m.status === 'active');
  const completedMissions = missions.filter(m => m.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Mission Control</h1>
          <p className="text-ink-500 text-sm mt-1 uppercase tracking-widest font-mono text-[10px]">Active Strategic Protocols</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Mission
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 border border-yellow-500/30 animate-slide-up">
<h3 className="font-display text-lg font-semibold text-ink-100 mb-4">Initialize New Protocol</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder='Mission Title' className="input-field" />
              <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input-field">
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} className="input-field" />
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief Description" className="input-field" />
           </div>
           <div className="flex gap-3 mt-4">
             <button onClick={handleCreate} disabled={creating} className="btn-primary">{creating ? 'Syncing...' : 'Create Mission'}</button>
             <button onClick={() => setShowForm(false)} className="btn-ghost">Discard</button>
           </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? <div className="text-center py-20 text-ink-600 font-mono text-xs animate-pulse">Scanning System...</div> : 
         activeMissions.length === 0 ? (
           <div className="glass-card p-12 text-center border-dashed border-ink-800">
             <Target className="w-12 h-12 text-ink-800 mx-auto mb-4" />
             <p className="text-ink-500 font-display">No Active Missions Found</p>
           </div>
         ) : activeMissions.map((mission, idx) => (
            <MissionCard
              key={mission._id}
              mission={mission}
              priority={idx + 1}
              expanded={expanded === mission._id}
              onExpand={() => setExpanded(expanded === mission._id ? null : mission._id)}
              onDelete={() => handleDelete(mission._id)}
              onRebalance={() => handleRebalance(mission._id)}
              onToggleTask={handleToggleTask}
            />
         ))
        }
      </div>

      {completedMissions.length > 0 && (
        <div className="mt-12 opacity-60">
          <h2 className="font-display text-sm font-bold text-teal-500 uppercase tracking-widest mb-4">Archived Missions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedMissions.map((m: any) => (
              <div key={m._id} className="bg-teal-950/10 border border-teal-900/20 p-3 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span className="text-xs text-teal-200 font-medium">{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MissionCard({ mission, priority, expanded, onExpand, onDelete, onRebalance, onToggleTask }: any) {
  const daysLeft = mission.daysRemaining;
  const isUrgent = daysLeft <= 3;
  const progress = mission.progressPercentage || 0;

  return (
    <div className={clsx(
      'rounded-xl border transition-all duration-300 overflow-hidden', 
      expanded ? 'ring-1 ring-yellow-500/30' : '',
      isUrgent ? 'border-yellow-500/40 bg-yellow-950/10' : 'border-ink-800 bg-ink-900/40 hover:bg-ink-900/60'
    )}>
<div className="p-5 flex items-start gap-4 cursor-pointer" onClick={onExpand}>
        <div className={clsx(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono text-lg font-black shadow-inner',
          priority === 1 ? 'bg-yellow-500 text-ink-950' : 'bg-ink-800 text-ink-400 border border-ink-700'
        )}>
          {priority === 1 ? <Flag className="w-5 h-5" /> : priority}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-ink-100">{mission.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-ink-800 text-ink-400 text-[10px] font-bold uppercase tracking-tighter border border-ink-700">{mission.subject}</span>
                {isUrgent && <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold uppercase animate-pulse"><AlertTriangle className="w-3 h-3"/> Critical</span>}
              </div>
            </div>
            <div className="text-right">
              <div className={clsx('text-2xl font-black font-display leading-none', isUrgent ? 'text-yellow-500' : 'text-teal-500')}>
                {daysLeft}
              </div>
              <div className="text-[9px] font-mono text-ink-500 uppercase tracking-widest">Days Left</div>
            </div>
          </div>
<div className="mt-4">
            <div className="flex justify-between text-[10px] mb-1.5 font-mono">
              <span className="text-ink-500 uppercase tracking-wider">{mission.completedChapters} / {mission.totalChapters} Units Completed</span>
              <span className="text-teal-400 font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-ink-950 rounded-full border border-ink-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-teal-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
{expanded && (
        <div className="border-t border-ink-800 bg-ink-950/50 p-5 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {(() => {
            try {
              const strategy = typeof mission.aiStrategy === 'string' ? JSON.parse(mission.aiStrategy) : mission.aiStrategy;
              if (!strategy) return null;
              return (
                <div className="flex gap-3 p-4 bg-deep-500/5 border border-deep-500/20 rounded-xl relative overflow-hidden group">
                  <Brain className="w-5 h-5 text-deep-400 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-deep-400 uppercase tracking-[0.2em] block">Arjun AI Strategic Protocol</span>
                    <p className="text-sm text-ink-200 leading-relaxed">{strategy.approach}</p>
                    {strategy.tips && strategy.tips.length > 0 && (
                      <ul className="text-xs text-ink-400 space-y-1 mt-2">
                        {strategy.tips.map((tip: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-deep-400">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            } catch (e) {
              return mission.aiStrategy ? (
                <div className="flex gap-3 p-4 bg-deep-500/5 border border-deep-500/20 rounded-xl">
                  <Brain className="w-5 h-5 text-deep-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-deep-400 uppercase tracking-[0.2em] block">Arjun AI Strategic Protocol</span>
                    <p className="text-sm text-ink-200 leading-relaxed italic">{mission.aiStrategy}</p>
                  </div>
                </div>
              ) : null;
            }
          })()}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h4 className="text-[10px] font-mono text-ink-500 uppercase tracking-[0.3em]">Operational Timeline</h4>
              <span className="text-[9px] text-ink-600 font-mono">Total Effort: {mission.dailyPlan?.reduce((acc: any, curr: any) => acc + curr.estimatedHours, 0).toFixed(0)} Hours</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {mission.dailyPlan?.map((day: any, i: number) => (
                <div 
                  key={i} 
                  onClick={(e) => { e.stopPropagation(); onToggleTask(mission._id, day.date); }}
                  className={clsx(
                    'flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer group',
                    day.completed ? 'bg-teal-500/5 border-teal-500/20 opacity-60' : 'bg-ink-900 border-ink-800 hover:border-yellow-500/40'
                  )}
                >
                  <div className={clsx(
                    'w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all',
                    day.completed ? 'bg-teal-500 border-teal-500 shadow-lg shadow-teal-500/20' : 'border-ink-700 group-hover:border-yellow-500'
                  )}>
                    {day.completed && <CheckCircle2 className="w-4 h-4 text-ink-950" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className={clsx('text-[13px] font-medium transition-all', day.completed ? 'text-ink-500 line-through' : 'text-ink-100')}>
                      {day.chapters.join(', ')}
                    </div>
                    <div className="text-[10px] text-ink-600 font-mono mt-0.5">{format(new Date(day.date), 'EEEE, dd MMM')}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-[11px] font-mono font-bold text-ink-500">{day.estimatedHours}h</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
<div className="flex items-center gap-3 pt-4 border-t border-ink-800">
            <button 
              onClick={(e) => { e.stopPropagation(); onRebalance(); }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-ink-900 hover:bg-ink-800 text-ink-100 text-xs font-bold rounded-xl border border-ink-800 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Rebalance Schedule
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="px-4 py-3 bg-red-500/5 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all active:scale-95"
              title="Terminate Mission"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
