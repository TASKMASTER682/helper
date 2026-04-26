'use client';
import React, { useEffect, useState } from 'react';
import { scheduleAPI, trackerAPI, missionsAPI, userAPI, plansAPI, ddayAPI, settingsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import CountdownCalendar from '../../componets/CountdownCalender';
import PlanCalendar from '../../componets/PlanCalendar';
import PlanGraph from '../../componets/PlanGraph';
import {
  Calendar, Flame, Trophy, BarChart3, Target,
  CheckCircle2, ChevronLeft, ChevronRight, TrendingUp, Brain, Bell, X
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis } from 'recharts';
import Link from 'next/link';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const format = (date: Date, fmt: string) => {
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const map: any = {
    'EEEE': days[d.getDay()],
    'MMMM': months[d.getMonth()],
    'MMM': months[d.getMonth()].slice(0, 3),
    'MM': pad(d.getMonth() + 1),
    'yyyy': d.getFullYear(),
    'dd': pad(d.getDate()),
    'd': d.getDate()
  };

  return fmt.replace(/EEEE|MMMM|MMM|MM|yyyy|dd|d/g, (matched) => map[matched]);
};

function StatCardSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="w-5 h-5 bg-ink-800 rounded" />
        <div className="w-16 h-3 bg-ink-800 rounded" />
      </div>
      <div className="w-12 h-8 bg-ink-800 rounded" />
      <div className="w-8 h-3 bg-ink-800 rounded mt-1" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [trackerData, setTrackerData] = useState<any[]>([]);
  const [dDayTargets, setDDayTargets] = useState<any[]>([]);
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingTracker, setLoadingTracker] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [loadingDDay, setLoadingDDay] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [planStats, setPlanStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  const [activeTargetIndex, setActiveTargetIndex] = useState(0);
  const [targetForm, setTargetForm] = useState({ targetName: '', targetDate: '' });
  const [savingTarget, setSavingTarget] = useState(false);

  useEffect(() => {
    settingsAPI.getAnnouncements()
      .then(res => setAnnouncements(res.data))
      .catch(err => console.error("Announcements Error:", err));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingStats(true);
    userAPI.getStats()
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats Error:", err))
      .finally(() => setLoadingStats(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingSchedule(true);
    scheduleAPI.getPlan()
      .then(res => setSchedule(res.data))
      .catch(err => console.error("Schedule Error:", err))
      .finally(() => setLoadingSchedule(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingTracker(true);
    trackerAPI.getEntries(14)
      .then(res => {
        const entries = res.data;
        setTrackerData([...entries].reverse());
        const todayISOStr = new Date().toISOString().slice(0, 10);
        const submitted = entries.some((e: any) => new Date(e.date).toISOString().slice(0, 10) === todayISOStr);
        setIsSubmittedToday(submitted);
      })
      .catch(err => console.error("Tracker Error:", err))
      .finally(() => setLoadingTracker(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingMissions(true);
    missionsAPI.getMissions()
      .then(res => setMissions(res.data))
      .catch(err => console.error("Missions Error:", err))
      .finally(() => setLoadingMissions(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    setLoadingDDay(true);
    ddayAPI.getAll()
      .then(res => {
        const targets = Array.isArray(res.data) ? res.data : [];
        setDDayTargets(targets);
        if (targets.length > 0) {
          const safeIndex = Math.min(activeTargetIndex, targets.length - 1);
          setActiveTargetIndex(safeIndex);
          const activeTarget = targets[safeIndex];
          if (activeTarget) {
            const yyyyMmDd = new Date(activeTarget.targetDate).toISOString().slice(0, 10);
            setTargetForm({ targetName: activeTarget.targetName || '', targetDate: yyyyMmDd });
          }
        }
      })
      .catch(err => console.error("DDay Error:", err))
      .finally(() => setLoadingDDay(false));
  }, [user?.id]);

  useEffect(() => {
    plansAPI.getPlans()
      .then(res => {
        const allPlans = res.data;
        setPlans(allPlans);
        
        if (allPlans.length > 0) {
          const today = format(new Date(), 'yyyy-MM-dd');
          
          // Calculate Aggregated Stats
          let totalTodayTasks = 0;
          let completedTodayTasks = 0;
          let combinedOnTrackScore = 0;
          let activePlansCount = 0;
          
          // Simplified streak: just take the max from any plan for now, 
          // or we could calculate a unified one. Max is safer for motivation.
          let maxStreak = 0;

          const statsPromises = allPlans.map((p: any) => plansAPI.getStats(p._id));
          
          Promise.all(statsPromises).then(statsResponses => {
            statsResponses.forEach(res => {
              const s = res.data;
              combinedOnTrackScore += s.trackScore;
              if (s.streak > maxStreak) maxStreak = s.streak;
            });
            
            allPlans.forEach((p: any) => {
              const todayLog = p.dailyLogs?.filter((l: any) => l.date === today) || [];
              totalTodayTasks += p.tasks?.length || 0;
              completedTodayTasks += todayLog.filter((l: any) => l.status === 'completed').length;
              activePlansCount++;
            });

            setPlanStats({
              streak: maxStreak,
              trackScore: activePlansCount > 0 ? combinedOnTrackScore / activePlansCount : 0,
              todayRatio: totalTodayTasks > 0 ? completedTodayTasks / totalTodayTasks : 0
            });
          });
        }
      })
      .catch(err => console.error("Plans Error:", err));
  }, []);

  const handleSaveTarget = async () => {
    const targetName = targetForm.targetName.trim();
    const targetDate = targetForm.targetDate;
    if (!targetName || !targetDate) return;

    setSavingTarget(true);
    try {
      await ddayAPI.setTarget({ targetName, targetDate });
      const res = await ddayAPI.getAll();
      const targets = Array.isArray(res.data) ? res.data : [];
      setDDayTargets(targets);
      if (targets.length > 0) {
        setActiveTargetIndex(0);
        const activeTarget = targets[0];
        if (activeTarget) {
          setTargetForm({ targetName: activeTarget.targetName || '', targetDate: new Date(activeTarget.targetDate).toISOString().slice(0, 10) });
        }
      }
      toast.success('D-Day target saved');
    } catch (err) {
      console.error('D-Day save error:', err);
      toast.error('Failed to save D-Day target');
    } finally {
      setSavingTarget(false);
    }
  };

  const handleClearTarget = async () => {
    if (dDayTargets.length === 0) return;
    const current = dDayTargets[activeTargetIndex] || dDayTargets[0];
    if (!current?._id) return;

    setSavingTarget(true);
    try {
      await ddayAPI.deleteTarget(String(current._id));
      const res = await ddayAPI.getAll();
      const targets = Array.isArray(res.data) ? res.data : [];
      setDDayTargets(targets);
      setActiveTargetIndex(0);
      if (targets.length > 0) {
        const activeTarget = targets[0];
        if (activeTarget) {
          setTargetForm({ targetName: activeTarget.targetName || '', targetDate: new Date(activeTarget.targetDate).toISOString().slice(0, 10) });
        }
      } else {
        setTargetForm({ targetName: '', targetDate: '' });
      }
      toast.success('D-Day target removed');
    } catch (err) {
      console.error('D-Day clear error:', err);
      toast.error('Failed to remove target');
    } finally {
      setSavingTarget(false);
    }
  };

  const selectedTarget = dDayTargets[activeTargetIndex] || null;
  const calendarTargetDate = selectedTarget?.targetDate ? new Date(selectedTarget.targetDate).toISOString().slice(0, 10) : null;
  const calendarExamName = selectedTarget?.targetName || '';

  const handlePrevTarget = () => {
    if (dDayTargets.length <= 1) return;
    setActiveTargetIndex((prev) => (prev - 1 + dDayTargets.length) % dDayTargets.length);
  };

  const handleNextTarget = () => {
    if (dDayTargets.length <= 1) return;
    setActiveTargetIndex((prev) => (prev + 1) % dDayTargets.length);
  };

  const activeMissions = missions.filter((m: any) => m.status === 'active');

  const chartData = trackerData.map((entry: any) => ({
    date: format(new Date(entry.date), 'MM/dd'),
    completion: entry.completionRate,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ink-500 font-mono text-sm">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1 className="font-display text-3xl font-bold text-ink-100 mt-1">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="text-yellow-400">{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        {!isSubmittedToday && (
          <Link href="/dashboard/tracker">
            <button className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-yellow-900/20">
              <CheckCircle2 className="w-4 h-4" />
              Submit Today
            </button>
          </Link>
        )}
      </div>

      {/* Announcements Carousel/List */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div 
              key={a._id} 
              className={clsx(
                "p-4 rounded-2xl border flex items-start gap-4 animate-in slide-in-from-top-4 duration-500",
                a.type === 'discount' ? "bg-teal-500/10 border-teal-500/20 text-teal-100" :
                a.type === 'alert' ? "bg-red-500/10 border-red-500/20 text-red-100" :
                a.type === 'update' ? "bg-blue-500/10 border-blue-500/20 text-blue-100" :
                "bg-yellow-500/5 border-yellow-500/10 text-yellow-100"
              )}
            >
              <div className={clsx(
                "p-2 rounded-xl shrink-0",
                a.type === 'discount' ? "bg-teal-500/20 text-teal-400" :
                a.type === 'alert' ? "bg-red-500/20 text-red-400" :
                a.type === 'update' ? "bg-blue-500/20 text-blue-400" :
                "bg-yellow-500/20 text-yellow-400"
              )}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-xs font-black uppercase tracking-tight">{a.title}</h4>
                  <span className="text-[8px] opacity-50 font-bold uppercase tracking-widest">{new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-80">{a.content}</p>
              </div>
              <button 
                onClick={() => setAnnouncements(prev => prev.filter(item => item._id !== a._id))}
                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 opacity-30 hover:opacity-100" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loadingStats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard icon={<Flame className="w-5 h-5 text-yellow-400" />} label="Plan Streak" value={planStats?.streak || 0} suffix="days" color="yellow" />
            <StatCard icon={<Trophy className="w-5 h-5 text-teal-400" />} label="On Track" value={planStats ? Math.round(planStats.trackScore * 100) : 0} suffix="%" color="teal" />
            <StatCard icon={<BarChart3 className="w-5 h-5 text-deep-400" />} label="Today" value={planStats ? Math.round(planStats.todayRatio * 100) : 0} suffix="%" color="deep" />
            <StatCard icon={<Target className="w-5 h-5 text-purple-400" />} label="Plans" value={plans.length} suffix="active" color="purple" />
          </>
        )}
      </div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4 border-b border-ink-800 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-yellow-400" />
              <h2 className="font-display text-lg font-semibold text-ink-100">Daily Plan</h2>
            </div>
            <Link href="/dashboard/plans" className="text-xs text-yellow-400 hover:underline">
              Manage Plans
            </Link>
          </div>

          <PlanCalendar plans={plans} />
          <PlanGraph plans={plans} />
        </div>

        <div className="space-y-4">
          {loadingMissions ? (
            <div className="glass-card p-4 animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-ink-900/50 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-ink-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" /> Active Missions
                </h3>
                <Link href="/dashboard/missions"><ChevronRight className="w-4 h-4 text-ink-500" /></Link>
              </div>
              <div className="space-y-3">
                {activeMissions.length === 0 ? (
                  <p className="text-ink-600 text-xs text-center py-4 italic border border-dashed border-ink-800 rounded-lg">No missions active</p>
                ) : (
                  activeMissions.slice(0, 3).map((m: any) => <MissionMiniCard key={m._id} mission={m} />)
                )}
              </div>
            </div>
          )}

          {loadingTracker ? (
            <div className="glass-card p-4 animate-pulse">
              <div className="h-24 bg-ink-900/50 rounded" />
            </div>
          ) : (
            <div className="glass-card p-4">
              <h3 className="font-semibold text-sm text-ink-200 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400" /> Daily Plans
              </h3>
              {plans.length > 0 ? (
                <div className="space-y-3">
                  {plans.sort((a, b) => {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    const aActive = today >= format(new Date(a.startDate), 'yyyy-MM-dd') && today <= format(new Date(a.endDate), 'yyyy-MM-dd');
                    const bActive = today >= format(new Date(b.startDate), 'yyyy-MM-dd') && today <= format(new Date(b.endDate), 'yyyy-MM-dd');
                    if (aActive && !bActive) return -1;
                    if (!aActive && bActive) return 1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  }).slice(0, 4).map((p: any) => {
                    const today = format(new Date(), 'yyyy-MM-dd');
                    const todayLog = p.dailyLogs?.filter((l: any) => l.date === today) || [];
                    const completed = todayLog.filter((l: any) => l.status === 'completed').length;
                    const ratio = p.tasks?.length > 0 ? completed / p.tasks.length : 0;
                    return (
                      <div key={p._id}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-ink-400 truncate">{p.planName}</span>
                          <span className="text-jade-400 font-bold">{Math.round(ratio * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-ink-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-500 to-jade-500" 
                            style={{ width: `${ratio * 100}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[80px] flex items-center justify-center text-ink-600 text-xs">
                  <Link href="/dashboard/plans" className="text-yellow-400 hover:underline">
                    + Add Daily Plan
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {loadingDDay ? (
            <div className="glass-card p-4 animate-pulse space-y-3">
              <div className="h-8 bg-ink-900/50 rounded" />
              <div className="h-8 bg-ink-900/50 rounded" />
              <div className="h-8 bg-ink-900/50 rounded" />
            </div>
          ) : (
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-ink-200">D-Day Targets</h3>
                <div className="flex items-center gap-2">
                  <button className="btn-ghost text-xs px-2 py-1" onClick={handlePrevTarget} disabled={dDayTargets.length <= 1}>
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-ink-500 font-mono">
                    {dDayTargets.length === 0 ? '0/0' : `${activeTargetIndex + 1}/${dDayTargets.length}`}
                  </span>
                  <button className="btn-ghost text-xs px-2 py-1" onClick={handleNextTarget} disabled={dDayTargets.length <= 1}>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                className="input-field w-full"
                placeholder="Target Name (e.g. UPSC Prelims 2027)"
                value={targetForm.targetName}
                onChange={(e) => setTargetForm((p) => ({ ...p, targetName: e.target.value }))}
              />
              <input
                type="date"
                className="input-field w-full"
                value={targetForm.targetDate}
                onChange={(e) => setTargetForm((p) => ({ ...p, targetDate: e.target.value }))}
              />
              <div className="flex gap-2">
                <button
                  className="btn-primary text-xs px-3 py-2"
                  onClick={handleSaveTarget}
                  disabled={savingTarget}
                >
                  {savingTarget ? 'Saving...' : 'Save Target'}
                </button>
                <button
                  className="btn-ghost text-xs px-3 py-2"
                  onClick={handleClearTarget}
                  disabled={savingTarget}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix, color }: any) {
  const colorMap: Record<string, string> = {
    yellow: 'yellow-card',
    jade: 'jade-card',
    deep: 'bg-deep-900/10 border border-deep-700/30 rounded-xl',
    teal: 'bg-teal-900/10 border border-teal-700/30 rounded-xl',
    purple: 'bg-purple-900/10 border border-purple-700/30 rounded-xl',
  };
  return (
    <div className={clsx('p-4 transition-transform hover:scale-[1.02]', colorMap[color] || 'glass-card')}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-[9px] font-mono text-ink-500 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold text-ink-100">{value}</span>
        <span className="text-ink-500 text-[10px] font-mono">{suffix}</span>
      </div>
    </div>
  );
}

function MissionMiniCard({ mission }: { mission: any }) {
  const name = mission.name || mission.title || 'Untitled';
  const progress = mission.progressPercent ?? mission.progressPercentage ?? 0;
  
  return (
    <div className="p-2.5 bg-ink-900/40 border border-ink-800 rounded-lg hover:border-ink-700 transition-colors">
      <div className="flex justify-between text-[11px] mb-1.5 font-medium text-ink-200">
        <span className="truncate pr-2">{name}</span>
        <span className="text-yellow-400 shrink-0">{progress}%</span>
      </div>
      <div className="w-full h-1 bg-ink-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-yellow-500 transition-all duration-500" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
}