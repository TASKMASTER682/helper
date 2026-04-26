'use client';
import { useEffect, useState } from 'react';
import { missionsAPI } from '@/lib/api';
import {
  Target, Plus, AlertTriangle, CheckCircle2, Clock, Zap,
  ChevronDown, ChevronUp, Trash2, RefreshCw, Flag, Play, Pause,
  Calendar, Info, Brain, Sparkles, TrendingUp, TrendingDown, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [availableHours, setAvailableHours] = useState('6');
  const [dailyPlan, setDailyPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [form, setForm] = useState({ 
    name: '', 
    targetType: 'hours', 
    totalTarget: '', 
    startDate: new Date().toISOString().split('T')[0], 
    endDate: '' 
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await missionsAPI.getMissions();
      setMissions(data);
    } catch (err) {
      toast.error('Failed to load missions');
    } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.totalTarget || !form.startDate || !form.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setCreating(true);
    try {
      const { data } = await missionsAPI.createMission({
        ...form,
        totalTarget: Number(form.totalTarget)
      });
      toast.success('Mission launched!');
      setMissions(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ name: '', targetType: 'hours', totalTarget: '', startDate: new Date().toISOString().split('T')[0], endDate: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to launch mission');
    } finally { setCreating(false); }
  };

  const generatePlan = async () => {
    if (!availableHours || Number(availableHours) <= 0) {
      toast.error('Enter valid study hours');
      return;
    }
    setIsGenerating(true);
    try {
      const { data } = await missionsAPI.createMissionPlan(Number(availableHours));
      setDailyPlan(data);
      toast.success('Workload calculated!');
    } catch {
      toast.error('Failed to generate plan');
    } finally { setIsGenerating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Abort this mission?')) return;
    try {
      await missionsAPI.deleteMission(id);
      setMissions(prev => prev.filter(m => m._id !== id));
      toast.success('Mission aborted');
    } catch { toast.error('Failed to delete'); }
  };

  const handlePause = async (id: string) => {
    try {
      const { data } = await missionsAPI.pauseMission(id);
      setMissions(prev => prev.map(m => m._id === id ? { ...m, status: 'paused' } : m));
      toast.success('Mission paused');
    } catch { toast.error('Failed to pause'); }
  };

  const handleResume = async (id: string) => {
    try {
      const { data } = await missionsAPI.resumeMission(id);
      setMissions(prev => prev.map(m => m._id === id ? { ...m, status: 'active' } : m));
      toast.success('Mission resumed');
    } catch { toast.error('Failed to resume'); }
  };

  const activeMissions = missions.filter(m => m.status === 'active' || m.status === 'paused');
  const completedMissions = missions.filter(m => m.status === 'completed');

  return (
    <div className="space-y-8 animate-fade-in pb-24 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative p-8 rounded-3xl overflow-hidden bg-ink-900 border border-ink-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-yellow-500/10 to-transparent blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Target className="w-6 h-6 text-yellow-500" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Mission Control</h1>
            </div>
            <p className="text-ink-400 text-sm max-w-lg">
              Strategize your preparation with advanced workload allocation. Our AI-driven engine calculates exactly how much you need to study each day to hit your targets.
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20"
          >
            <Plus className="w-5 h-5" /> New Mission
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Missions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-ink-100 flex items-center gap-2">
              Active Operations <span className="text-xs bg-ink-800 text-ink-400 px-2 py-1 rounded-full">{activeMissions.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" />
              <p className="text-ink-500 font-mono text-xs">Accessing Satellite Uplink...</p>
            </div>
          ) : activeMissions.length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed border-ink-800 group hover:border-yellow-500/30 transition-all cursor-pointer" onClick={() => setShowForm(true)}>
              <Target className="w-16 h-16 text-ink-800 mx-auto mb-4 group-hover:text-yellow-500/50 transition-all" />
              <p className="text-ink-200 font-display text-lg font-bold">No Active Missions Found</p>
              <p className="text-ink-500 text-sm mt-2">Ready to start your journey? Launch your first mission to track progress.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMissions.map((mission, idx) => (
                <MissionCard
                  key={mission._id}
                  mission={mission}
                  priority={idx + 1}
                  onPause={() => handlePause(mission._id)}
                  onResume={() => handleResume(mission._id)}
                  onDelete={() => handleDelete(mission._id)}
                  onUpdate={() => loadData()}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Workload Calculator */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-yellow-500/20 relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Brain className="w-5 h-5 text-yellow-500" />
              </div>
              <h3 className="font-bold text-white">Smart Workload</h3>
            </div>

            <p className="text-xs text-ink-400 mb-6 leading-relaxed">
              Enter your available study hours for today. We'll distribute the workload across your active missions based on urgency.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-ink-500 font-bold mb-2 block">Daily Available Hours</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={availableHours}
                    onChange={(e) => setAvailableHours(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 transition-all outline-none"
                    placeholder="e.g., 8"
                  />
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-600" />
                </div>
              </div>

              <button 
                onClick={generatePlan}
                disabled={isGenerating || activeMissions.length === 0}
                className="w-full py-3 bg-ink-800 hover:bg-yellow-500 hover:text-ink-950 text-yellow-500 font-bold rounded-xl transition-all border border-yellow-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Calculate Allocation
              </button>
            </div>

            {dailyPlan && (
              <div className="mt-8 space-y-4 animate-slide-up">
                <div className="p-4 bg-ink-950 rounded-xl border border-ink-800">
                  <div className="text-[10px] text-ink-500 uppercase tracking-wider mb-3">Today's Strategy</div>
                  <div className="space-y-4">
                    {dailyPlan.allocations.map((alloc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink-100 truncate">{alloc.missionName}</div>
                          <div className="text-[10px] text-ink-600">{alloc.daysLeft} days remaining</div>
                        </div>
                        <div className="text-sm font-black text-yellow-500 whitespace-nowrap">
                          {Math.round(alloc.allocatedMinutes / 6) / 10}h
                        </div>
                      </div>
                    ))}
                    {dailyPlan.deficit > 0 && (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                        <div className="text-[10px] text-red-200 leading-tight">
                          <span className="font-bold">Workload Deficit:</span> You need {Math.round(dailyPlan.deficit / 6) / 10} more hours to stay on track for all missions.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {completedMissions.length > 0 && (
            <div className="p-6 bg-ink-900/40 rounded-3xl border border-teal-500/10">
              <h3 className="text-sm font-bold text-teal-500 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4" /> Hall of Fame
              </h3>
              <div className="space-y-3">
                {completedMissions.map((m: any) => (
                  <div key={m._id} className="p-3 bg-teal-500/5 rounded-xl border border-teal-500/10 flex items-center justify-between">
                    <span className="text-xs text-ink-200 font-medium truncate pr-4">{m.name}</span>
                    <Zap className="w-3 h-3 text-teal-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Mission Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-ink-900 border border-ink-800 rounded-3xl p-8 shadow-2xl animate-scale-in">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-6 right-6 p-2 hover:bg-ink-800 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-ink-400" />
            </button>

            <h2 className="text-2xl font-black text-white mb-6">Launch New Mission</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-ink-400 mb-2 block uppercase tracking-wide">Operation Name</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
                  placeholder='e.g., Polity Mastery' 
                  className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-ink-400 mb-2 block uppercase tracking-wide">Target Type</label>
                  <select 
                    value={form.targetType} 
                    onChange={e => setForm(p => ({ ...p, targetType: e.target.value }))} 
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all"
                  >
                    <option value="hours">Hours</option>
                    <option value="units">Chapters/Units</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-400 mb-2 block uppercase tracking-wide">Goal Value</label>
                  <input 
                    type="number" 
                    value={form.totalTarget} 
                    onChange={e => setForm(p => ({ ...p, totalTarget: e.target.value }))} 
                    placeholder='Total' 
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-ink-400 mb-2 block uppercase tracking-wide">D-Day Start</label>
                  <input 
                    type="date" 
                    value={form.startDate} 
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} 
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-400 mb-2 block uppercase tracking-wide">Deadline</label>
                  <input 
                    type="date" 
                    value={form.endDate} 
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} 
                    className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none transition-all" 
                  />
                </div>
              </div>

              <button 
                onClick={handleCreate} 
                disabled={creating}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-2xl transition-all shadow-lg shadow-yellow-500/20 mt-4 disabled:opacity-50"
              >
                {creating ? 'Initializing...' : 'Launch Mission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MissionCard({ mission, priority, onPause, onResume, onDelete, onUpdate }: any) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [logValue, setLogValue] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const progressPercent = mission.progressPercent || 0;
  const daysLeft = mission.remainingDays;
  const isUrgent = daysLeft <= 3;
  const isPaused = mission.status === 'paused';
  const onTrack = mission.onTrack;

  const handleLogProgress = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!logValue || isNaN(Number(logValue))) {
      toast.error('Please enter a valid number');
      return;
    }
    
    setIsLogging(true);
    const loadingToast = toast.loading('Syncing progress...');
    
    try {
      await missionsAPI.updateProgress(mission._id, { 
        value: Number(logValue), 
        type: mission.targetType 
      });
      
      toast.success('Progress Logged!', { id: loadingToast });
      setLogValue('');
      setShowLogForm(false);
      onUpdate();
    } catch (err: any) {
      console.error('Log Error:', err);
      toast.error(err.response?.data?.error || 'Failed to update progress', { id: loadingToast });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className={clsx(
      'rounded-3xl border transition-all duration-500 group relative', 
      isUrgent ? 'border-yellow-500/40 bg-ink-900 shadow-xl shadow-yellow-500/5' : 'border-ink-800 bg-ink-900/60 hover:bg-ink-900'
    )}>
      {/* Status Indicators */}
      <div className="absolute -top-3 left-8 flex items-center gap-2 z-10">
        {onTrack ? (
          <span className="px-3 py-1 bg-teal-500 text-ink-950 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
            <TrendingUp className="w-3 h-3" /> On Track
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-500 text-ink-950 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
            <TrendingDown className="w-3 h-3" /> Behind Schedule
          </span>
        )}
        {isPaused && (
          <span className="px-3 py-1 bg-ink-700 text-ink-200 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
            <Pause className="w-3 h-3" /> Mission Paused
          </span>
        )}
      </div>

      <div className="p-8">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-ink-800 rounded-xl group-hover:bg-yellow-500 transition-colors">
                <Flag className={clsx('w-5 h-5', priority === 1 ? 'text-yellow-500 group-hover:text-ink-950' : 'text-ink-400 group-hover:text-ink-950')} />
              </div>
              <h3 className="text-xl font-black text-white group-hover:text-yellow-500 transition-colors">{mission.name}</h3>
            </div>
            <div className="flex items-center gap-3 pl-11">
              <span className="text-xs font-mono text-ink-500 uppercase tracking-widest">Target: {mission.totalTarget} {mission.targetType}</span>
              <div className="w-1 h-1 bg-ink-700 rounded-full" />
              <span className="text-xs font-mono text-ink-500 uppercase tracking-widest">Priority: {priority}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-end justify-end gap-1">
              <span className={clsx('text-4xl font-black font-display leading-none', isUrgent ? 'text-yellow-500' : 'text-white')}>
                {daysLeft}
              </span>
              <span className="text-xs font-bold text-ink-600 mb-1">Days</span>
            </div>
            <div className="text-[10px] font-black text-ink-600 uppercase tracking-[0.2em] mt-1">Countdown</div>
          </div>
        </div>

        {/* Progress System */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-black text-ink-100 uppercase tracking-wider">
                {mission.completedValue || 0} <span className="text-ink-500 text-[10px]">Units Completed</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">{progressPercent}%</div>
            </div>
          </div>

          <div className="relative h-4 w-full bg-ink-950 rounded-full border border-ink-800 p-1 overflow-hidden shadow-inner">
            <div 
              className={clsx(
                "h-full rounded-full transition-all duration-1000 ease-out relative group/bar",
                onTrack ? "bg-gradient-to-r from-teal-500 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]" : "bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
              )}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          {mission.dailyRequired && (
            <div className="flex items-center justify-between p-4 bg-ink-950/50 rounded-2xl border border-ink-800">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-ink-500" />
                <span className="text-[10px] font-black text-ink-500 uppercase tracking-wider">Daily Mission Target</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-yellow-500">
                  {Math.ceil(mission.dailyRequired * 10) / 10}
                </span>
                <span className="text-[10px] font-bold text-ink-600 uppercase tracking-tighter">{mission.targetType}/Day</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="mt-8 pt-6 border-t border-ink-800 flex flex-wrap items-center gap-4">
          {!showLogForm ? (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowLogForm(true); }}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3.5 bg-yellow-500 text-ink-950 text-xs font-black rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
            >
              <Zap className="w-4 h-4" /> Log Progress
            </button>
          ) : (
            <form 
              onSubmit={handleLogProgress}
              className="flex-1 min-w-[200px] flex items-center gap-2 animate-scale-in"
            >
              <input 
                autoFocus
                type="number"
                step="any"
                value={logValue}
                onChange={e => setLogValue(e.target.value)}
                placeholder={`Value in ${mission.targetType}`}
                className="flex-1 bg-ink-950 border border-yellow-500/50 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-yellow-500/50"
              />
              <button 
                type="submit"
                disabled={isLogging}
                className="p-3 bg-teal-500 text-ink-950 rounded-xl hover:bg-teal-400 disabled:opacity-50 transition-all"
              >
                {isLogging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowLogForm(false); }}
                className="p-3 bg-ink-800 text-ink-400 rounded-xl hover:bg-ink-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
          
          <div className="flex items-center gap-2 ml-auto">
            {isPaused ? (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onResume(); }}
                className="p-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl border border-emerald-500/20 transition-all"
                title="Resume Mission"
              >
                <Play className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onPause(); }}
                className="p-3.5 bg-ink-800 hover:bg-ink-700 text-ink-400 rounded-xl border border-ink-700 transition-all"
                title="Pause Mission"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-3.5 bg-red-500/5 hover:bg-red-500/20 text-red-500 rounded-xl border border-red-500/20 transition-all"
              title="Abort Mission"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}