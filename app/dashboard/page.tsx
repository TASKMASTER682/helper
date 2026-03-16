'use client';
import React, { useEffect, useState, useRef } from 'react';
import { scheduleAPI, trackerAPI, missionsAPI, userAPI, ddayAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import CountdownCalendar from '../../componets/CountdownCalender';
import {
  Calendar, Clock, Flame, Trophy, BarChart3, Target, AlertTriangle,
  CheckCircle2, BookOpen, Brain, ChevronLeft, ChevronRight, Zap, TrendingUp, Loader2, Play, Pause
} from 'lucide-react';
import { format } from 'date-fns';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const TASK_TYPE_COLORS: Record<string, string> = {
  learning: 'bg-deep-500/20 border-deep-500/40 text-deep-300',
  revision: 'bg-jade-500/20 border-jade-500/40 text-jade-300',
  answer_writing: 'bg-red-500/20 border-red-500/40 text-red-300',
  mcq: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
  test: 'bg-red-500/20 border-red-500/40 text-red-300',
  break: 'bg-ink-700/20 border-ink-600/40 text-ink-400',
  fitness: 'bg-green-500/20 border-green-500/40 text-green-300',
};

const CSAT_BLOCK_CLASS = 'bg-teal-500/20 border-teal-500/40 text-teal-200';

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-saffron-400',
  medium: 'bg-jade-400',
  low: 'bg-ink-500',
};

const TASK_TYPE_LABELS: Record<string, string> = {
  learning: 'doing',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [trackerData, setTrackerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [isSubmittedToday, setIsSubmittedToday] = useState(false);
  const [scheduleRefineInput, setScheduleRefineInput] = useState('');
  const [refiningSchedule, setRefiningSchedule] = useState(false);
  const [dDayTargets, setDDayTargets] = useState<any[]>([]);
  const [activeTargetIndex, setActiveTargetIndex] = useState(0);
  const [targetForm, setTargetForm] = useState({ targetName: '', targetDate: '' });
  const [savingTarget, setSavingTarget] = useState(false);
  
  // Timer state
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<Record<number, number>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      const todayISO = format(new Date(), 'yyyy-MM-dd');
      const [schedRes, statsRes, missionsRes, trackerRes, dDayRes] = await Promise.allSettled([
        scheduleAPI.getDate(todayISO),
        userAPI.getStats(),
        missionsAPI.getMissions(),
        trackerAPI.getEntries(14),
        ddayAPI.getAll(),
      ]);

      if (schedRes.status === 'fulfilled') setSchedule(schedRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (missionsRes.status === 'fulfilled') setMissions(missionsRes.value.data);
      if (trackerRes.status === 'fulfilled') {
        const entries = trackerRes.value.data;
        setTrackerData([...entries].reverse());

        const todayISOStr = new Date().toISOString().slice(0, 10);
        const submitted = entries.some((e: any) => new Date(e.date).toISOString().slice(0, 10) === todayISOStr);
        setIsSubmittedToday(submitted);
      }
      
      // Also check if schedule blocks are all completed
      if (schedRes.status === 'fulfilled' && schedRes.value.data?.blocks) {
        const blocks = schedRes.value.data.blocks;
        const nonOptionalBlocks = blocks.filter((b: any) => {
          const type = b?.taskType || '';
          return type !== 'break' && type !== 'fitness';
        });
        const allCompleted = nonOptionalBlocks.length > 0 && nonOptionalBlocks.every((b: any) => b.completed);
        if (allCompleted) {
          setIsSubmittedToday(true);
        }
      }
      if (dDayRes.status === 'fulfilled') {
        const targets = Array.isArray(dDayRes.value.data) ? dDayRes.value.data : [];
        setDDayTargets(targets);
        if (targets.length > 0) {
          const safeIndex = Math.min(activeTargetIndex, targets.length - 1);
          setActiveTargetIndex(safeIndex);
          const activeTarget = targets[safeIndex];
          const yyyyMmDd = new Date(activeTarget.targetDate).toISOString().slice(0, 10);
          setTargetForm({ targetName: activeTarget.targetName || '', targetDate: yyyyMmDd });
        } else {
          setActiveTargetIndex(0);
          setTargetForm({ targetName: '', targetDate: '' });
        }
      }
    } catch (err) {
      console.error("Dashboard Loading Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (activeTimer === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => ({
        ...prev,
        [activeTimer]: (prev[activeTimer] || 0) + 1
      }));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTimer]);

  const handleStartTimer = async (index: number) => {
    setActiveTimer(index);
    try {
      await scheduleAPI.timerAction(index, 'start');
    } catch (err) {
      console.error('Timer start error:', err);
    }
  };

  const handleStopTimer = async (index: number) => {
    const elapsed = elapsedTime[index] || 0;
    setActiveTimer(null);
    try {
      const { data } = await scheduleAPI.timerAction(index, 'stop');
      // Mark as completed
      await scheduleAPI.completeBlock(index, Math.ceil(elapsed / 60));
      // Refresh schedule
      const todayISO = format(new Date(), 'yyyy-MM-dd');
      const res = await scheduleAPI.getDate(todayISO);
      setSchedule(res.data);
      toast.success('Task completed!');
    } catch (err) {
      console.error('Timer stop error:', err);
    }
  };

  const handleToggleComplete = async (index: number, currentlyCompleted: boolean) => {
    try {
      if (currentlyCompleted) {
        await scheduleAPI.incompleteBlock(index);
      } else {
        await scheduleAPI.completeBlock(index, 0);
      }
      // Refresh schedule
      const todayISO = format(new Date(), 'yyyy-MM-dd');
      const res = await scheduleAPI.getDate(todayISO);
      setSchedule(res.data);
    } catch (err) {
      console.error('Toggle error:', err);
      toast.error('Failed to update');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateSchedule = async () => {
    setGeneratingSchedule(true);
    try {
      const todayISO = format(new Date(), 'yyyy-MM-dd');
      const res = await scheduleAPI.generate(todayISO);
      setSchedule(res.data);
    } catch (err) {
      console.error("Generation Error:", err);
    } finally {
      setGeneratingSchedule(false);
    }
  };


  const chartData = trackerData.map((entry: any) => ({
    date: format(new Date(entry.date), 'MM/dd'),
    completion: entry.completionRate,
  }));

  const handleSaveTarget = async () => {
    const targetName = targetForm.targetName.trim();
    const targetDate = targetForm.targetDate;
    if (!targetName || !targetDate) return;

    setSavingTarget(true);
    try {
      await ddayAPI.setTarget({ targetName, targetDate });
      await loadData();
      setTargetForm({ targetName: '', targetDate: '' });
      toast.success('D-Day target saved');
    } catch (err) {
      console.error('D-Day save error:', err);
      toast.error('Failed to save D-Day target');
    } finally {
      setSavingTarget(false);
    }
  };

  const handleRefineSchedule = async () => {
    const instruction = scheduleRefineInput.trim();
    if (!instruction) return;

    const used = Number(schedule?.refinementCount) || 0;
    if (used >= 2) {
      toast.error('You can refine schedule only 2 times per day.');
      return;
    }

    setRefiningSchedule(true);
    try {
      const todayISO = format(new Date(), 'yyyy-MM-dd');
      const { data } = await scheduleAPI.refine(instruction, todayISO);
      setSchedule(data);
      setScheduleRefineInput('');
      toast.success('Schedule updated with your instruction');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to refine schedule');
    } finally {
      setRefiningSchedule(false);
    }
  };

  const handleClearTarget = async () => {
    if (dDayTargets.length === 0) return;
    const current = dDayTargets[activeTargetIndex] || dDayTargets[0];
    if (!current?._id) return;

    setSavingTarget(true);
    try {
      await ddayAPI.deleteTarget(String(current._id));
      await loadData();
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
  const openFocusMode = (block: any) => {
    const title = `${block?.subject || 'Focus'}${block?.topic ? ` - ${block.topic}` : ''}`;
    const minutes = Number(block?.duration) > 0 ? Number(block.duration) : 50;
    const params = new URLSearchParams({
      title,
      minutes: String(Math.max(1, Math.round(minutes))),
    });
    router.push(`/dashboard/focus?${params.toString()}`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-saffron-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ink-500 font-mono text-sm">{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
          <h1 className="font-display text-3xl font-bold text-ink-100 mt-1">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="text-gradient-saffron">{user?.name?.split(' ')[0]}</span>
          </h1>
        </div>
        {!isSubmittedToday && (
          <Link href="/dashboard/tracker">
            <button className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-saffron-900/20">
              <CheckCircle2 className="w-4 h-4" />
              Submit Today
            </button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Flame className="w-5 h-5 text-saffron-400" />} label="Study Streak" value={stats?.studyStreak || 0} suffix="days" color="saffron" />
        <StatCard icon={<Trophy className="w-5 h-5 text-jade-400" />} label="Confidence" value={stats?.confidenceScore || 50} suffix="/100" color="jade" />
        <StatCard icon={<BarChart3 className="w-5 h-5 text-deep-400" />} label="Weekly Avg" value={stats?.weeklyProductivity || 0} suffix="%" color="deep" />
        <StatCard icon={<Target className="w-5 h-5 text-purple-400" />} label="Missions" value={activeMissions.length} suffix="active" color="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 relative overflow-hidden h-fit">
          <div className="flex items-center justify-between mb-4 border-b border-ink-800 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-saffron-400" />
              <h2 className="font-display text-lg font-semibold text-ink-100">Today's Protocol</h2>
            </div>
          </div>

          {schedule && schedule.blocks && schedule.blocks.length > 0 && !isSubmittedToday ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-ink-800 bg-ink-900/20">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-ink-400">Progress</span>
                  <span className="text-teal-400 font-mono">
                    {schedule.blocks.filter((b: any) => b.completed).length} / {schedule.blocks.filter((b: any) => {
                      const type = b?.taskType || '';
                      return type !== 'break' && type !== 'fitness';
                    }).length} tasks
                  </span>
                </div>
                <div className="h-1.5 bg-ink-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-500 transition-all duration-500"
                    style={{ 
                      width: `${(schedule.blocks.filter((b: any) => b.completed).length / schedule.blocks.filter((b: any) => {
                        const type = b?.taskType || '';
                        return type !== 'break' && type !== 'fitness';
                      }).length) * 100}%` 
                    }} 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-ink-500 uppercase tracking-wider">
                  Refine Today's Schedule
                </span>
                <span className="text-[10px] font-mono text-saffron-400">
                  {Math.max(0, 2 - (Number(schedule?.refinementCount) || 0))} left
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  value={scheduleRefineInput}
                  onChange={(e) => setScheduleRefineInput(e.target.value)}
                  placeholder="e.g. Add more Polity, reduce revision"
                  className="input-field flex-1 text-xs"
                  disabled={refiningSchedule || (Number(schedule?.refinementCount) || 0) >= 2}
                />
                <button
                  onClick={handleRefineSchedule}
                  className="btn-primary text-xs px-4"
                  disabled={refiningSchedule || (Number(schedule?.refinementCount) || 0) >= 2}
                >
                  {refiningSchedule ? 'Updating...' : 'Refine'}
                </button>
              </div>

              <div className="space-y-3">
                {schedule.blocks.map((block: any, i: number) => {
                  const safeType = block?.taskType || 'learning';
                  const subjectLower = String(block?.subject || '').toLowerCase();
                  const isCsatBlock = subjectLower.includes('csat');
                  const isCompleted = block?.completed;
                  const isTimerActive = activeTimer === i;
                  const timeSpent = block?.timeSpent || 0;
                  const elapsed = elapsedTime[i] || 0;
                  const blockClass = isCsatBlock
                    ? CSAT_BLOCK_CLASS
                    : (TASK_TYPE_COLORS[safeType] || 'bg-ink-800/30 border-ink-700/30');
                  return (
                    <div
                      key={`block-${i}`}
                      className={clsx(
                        'w-full flex items-start gap-3 p-3 rounded-lg border transition-all',
                        blockClass,
                        isCompleted && 'opacity-50'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(i, isCompleted)}
                        className={clsx(
                          'shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                          isCompleted 
                            ? 'bg-teal-500 border-teal-500' 
                            : 'border-ink-500 hover:border-teal-400'
                        )}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-ink-950" />}
                      </button>
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => openFocusMode(block)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={clsx('font-semibold text-sm', isCompleted && 'line-through')}>{block.subject}</span>
                          <span className="text-[10px] uppercase tracking-tighter opacity-70">
                            {(TASK_TYPE_LABELS[safeType] || safeType).replace('_', ' ')}
                          </span>
                          {isCompleted && (
                            <span className="text-[10px] text-teal-400">Done</span>
                          )}
                        </div>
                        <div className="text-xs opacity-60 mt-0.5 truncate">{block.topic}</div>
                        {timeSpent > 0 && (
                          <div className="text-[10px] text-teal-400 mt-1">
                            Time: {timeSpent} min
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        {isTimerActive ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-teal-400">{formatTime(elapsed)}</span>
                            <button
                              onClick={() => handleStopTimer(i)}
                              className="p-1.5 rounded-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : !isCompleted ? (
                          <button
                            onClick={() => handleStartTimer(i)}
                            className="p-1.5 rounded-full bg-ink-800 text-ink-400 hover:text-teal-400 hover:bg-teal-500/20 transition-all"
                            title="Start Timer"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                        <div className="font-mono text-[10px] opacity-50">
                          Slot {i + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <p>No schedule</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {calendarTargetDate ? (
            <CountdownCalendar
              targetDate={calendarTargetDate}
              examName={calendarExamName}
            />
          ) : (
            <div className="glass-card p-5 border border-dashed border-ink-700 text-center">
              <h3 className="font-semibold text-sm text-ink-200 mb-2">Calendar Target</h3>
              <p className="text-ink-500 text-xs">No targets saved on calendar</p>
            </div>
          )}

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
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-ink-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-saffron-400" /> Active Missions
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

          <div className="glass-card p-4">
            <h3 className="font-semibold text-sm text-ink-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-jade-400" /> Efficiency Trend
            </h3>
            {chartData.length > 0 ? (
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff7c0a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff7c0a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="completion" stroke="#ff7c0a" fill="url(#chartGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="h-20 flex items-center justify-center text-ink-700 text-[10px]">Data pending...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix, color }: any) {
  const colorMap: Record<string, string> = {
    saffron: 'saffron-card',
    jade: 'jade-card',
    deep: 'deep-card',
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
  return (
    <div className="p-2.5 bg-ink-900/40 border border-ink-800 rounded-lg hover:border-ink-700 transition-colors">
      <div className="flex justify-between text-[11px] mb-1.5 font-medium text-ink-200">
        <span className="truncate pr-2">{mission.title}</span>
        <span className="text-saffron-400 shrink-0">{mission.progressPercentage}%</span>
      </div>
      <div className="w-full h-1 bg-ink-800 rounded-full overflow-hidden">
        <div className="h-full bg-saffron-500" style={{ width: `${mission.progressPercentage}%` }} />
      </div>
    </div>
  );
}

