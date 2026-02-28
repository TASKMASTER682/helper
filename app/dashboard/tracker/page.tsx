'use client';
import { useEffect, useState } from 'react';
import { trackerAPI, scheduleAPI } from '@/lib/api';
import { CheckCircle2, XCircle, MinusCircle, Brain, TrendingUp, Calendar, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis,TooltipProps, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const MOOD_OPTIONS = [
  { value: 'motivated', label: '💪 Motivated', color: 'teal' },
  { value: 'confident', label: '🎯 Confident', color: 'deep' },
  { value: 'neutral', label: '😐 Neutral', color: 'ink' },
  { value: 'stressed', label: '😰 Stressed', color: 'yellow' },
  { value: 'burnt_out', label: '🔥 Burnt Out', color: 'red' },
];

const ENERGY_OPTIONS = [
  { value: 'high', label: '⚡ High', color: 'teal' },
  { value: 'medium', label: '🔄 Medium', color: 'yellow' },
  { value: 'low', label: '🔋 Low', color: 'red' },
];

const tooltipFormatter: TooltipProps<number, string>['formatter'] = (value, name) => {
  const val = Number(value) || 0;

  if (name === 'focus') return [`${val}%`, 'Focus'];
  if (name === 'hours') return [`${val}h`, 'Hours'];
  if (name === 'completion') return [`${val}%`, 'Completion'];

  return [val, 'Value'];
};

export default function TrackerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [taskStatuses, setTaskStatuses] = useState<Record<number, string>>({});
  const [taskHours, setTaskHours] = useState<Record<number, number>>({});
  const [focusScore, setFocusScore] = useState(7);
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [mood, setMood] = useState('neutral');
  const [notesPrepared, setNotesPrepared] = useState(false);
  const [topicsNotUnderstood, setTopicsNotUnderstood] = useState('');
  const [notes, setNotes] = useState('');
  const [totalHours, setTotalHours] = useState(6);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesRes, schedRes] = await Promise.allSettled([
        trackerAPI.getEntries(14),
        scheduleAPI.getToday()
      ]);
      if (entriesRes.status === 'fulfilled') setEntries(entriesRes.value.data);
      if (schedRes.status === 'fulfilled') {
        setTodaySchedule(schedRes.value.data);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEntry = entriesRes.status === 'fulfilled'
          ? entriesRes.value.data.find((e: any) => new Date(e.date).toDateString() === today.toDateString())
          : null;
        if (todayEntry) setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFilled) return;
    if (!todaySchedule?.blocks?.length) return;
    const relevantBlocks = todaySchedule.blocks.filter((b: any) => {
      const type = b?.taskType || 'learning';
      return type !== 'break' && type !== 'fitness';
    });

    if (!relevantBlocks.length) return;
    const statuses: Record<number, string> = {};
    const hours: Record<number, number> = {};
    let accumHours = 0;
    relevantBlocks.forEach((block: any, idx: number) => {
      statuses[idx] = 'completed';
      const hrs = Number(block.duration || 0) / 60;
      hours[idx] = Number(hrs.toFixed(1)) || 0;
      accumHours += hrs;
    });

    setTaskStatuses(prev => ({ ...statuses, ...prev }));
    setTaskHours(prev => ({ ...hours, ...prev }));
    setTotalHours(Math.max(totalHours, Math.round(accumHours * 10) / 10));
    setFocusScore(prev => Math.max(prev, 7));
    setEnergyLevel(prev => prev || 'medium');
    setMood(prev => prev || 'motivated');
    if (todaySchedule.aiRationale && !notes) setNotes(todaySchedule.aiRationale);
    setAutoFilled(true);
  }, [todaySchedule, autoFilled, notes, totalHours]);

  const handleSubmit = async () => {
    if (!todaySchedule?.blocks?.length) {
      toast.error('No schedule found for today');
      return;
    }

    setSubmitting(true);
    try {
      const tasks = todaySchedule.blocks
        .filter((b: any) => {
          const type = b?.taskType || 'learning';
          return type !== 'break' && type !== 'fitness';
        })
        .map((block: any, i: number) => {
          const safeType = block?.taskType || 'learning';
          return {
            subject: block.subject,
            topic: block.topic,
            taskType: safeType,
            status: taskStatuses[i] || 'skipped',
            plannedHours: block.duration / 60,
            actualHours: taskHours[i] || 0
          };
        });

      await trackerAPI.submitDaily({
        tasks, focusScore, energyLevel, mood, notesPrepared,
        topicsNotUnderstood: topicsNotUnderstood.split(',').map(t => t.trim()).filter(Boolean),
        notes, totalStudyHours: totalHours
      });

      toast.success('Daily report submitted! 🎯');
      setSubmitted(true);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = [...entries].reverse().map((e: any) => ({
    date: format(new Date(e.date), 'MM/dd'),
    completion: e.completionRate,
    hours: e.totalStudyHours,
    focus: (e.focusScore || 5) * 10
  }));

    const tasks = todaySchedule?.blocks?.filter((b: any) => {
      const type = b?.taskType || 'learning';
      return type !== 'break' && type !== 'fitness';
    }) || [];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Daily Tracker</h1>
        <p className="text-ink-500 text-sm mt-1">{format(new Date(), 'EEEE, d MMMM yyyy')} · Submit your end-of-day report</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
<div className="col-span-2 space-y-4">
          {submitted && (
            <div className="teal-card p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <span className="text-teal-300 text-sm font-semibold">Today's report submitted! ARJUN is analyzing your performance.</span>
            </div>
          )}
{tasks.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-display text-base font-semibold text-ink-200 mb-4">Today's Tasks</h3>
              <div className="space-y-2">
                {tasks.map((block: any, i: number) => {
                  const safeTaskType = block?.taskType || 'learning';
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-ink-900/40 rounded-lg border border-ink-700/30">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-ink-200">{block.subject}</span>
                          <span className="tag text-[10px]">{safeTaskType.replace('_', ' ')}</span>
                        </div>
                        <div className="text-xs text-ink-500">{block.topic}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          step="0.5"
                          value={taskHours[i] || ''}
                          onChange={e => setTaskHours(prev => ({ ...prev, [i]: parseFloat(e.target.value) || 0 }))}
                          placeholder="hrs"
                          className="w-16 input-field text-xs py-1 text-center"
                        />
                        <div className="flex gap-1">
                          {[
                            { status: 'completed', icon: CheckCircle2, color: 'text-teal-400 hover:bg-teal-900/30' },
                            { status: 'partial', icon: MinusCircle, color: 'text-yellow-400 hover:bg-yellow-900/30' },
                            { status: 'skipped', icon: XCircle, color: 'text-red-400 hover:bg-red-900/30' },
                          ].map(({ status, icon: Icon, color }) => (
                            <button
                              key={status}
                              onClick={() => setTaskStatuses(prev => ({ ...prev, [i]: status }))}
                              className={clsx('p-1.5 rounded-lg transition-all border', taskStatuses[i] === status ? 'bg-ink-700 border-ink-500' : 'border-transparent', color)}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
<div className="glass-card p-5">
            <h3 className="font-display text-base font-semibold text-ink-200 mb-4">Daily Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
<div>
                <label className="label-text">Focus Score: {focusScore}/10</label>
                <input type="range" min="1" max="10" value={focusScore} onChange={e => setFocusScore(parseInt(e.target.value))} className="w-full accent-yellow-500 mt-2" />
                <div className="flex justify-between text-[10px] font-mono text-ink-600 mt-1">
                  <span>Distracted</span><span>Flow State</span>
                </div>
              </div>
<div>
                <label className="label-text">Total Study Hours: {totalHours}h</label>
                <input type="range" min="1" max="16" step="0.5" value={totalHours} onChange={e => setTotalHours(parseFloat(e.target.value))} className="w-full accent-deep-500 mt-2" />
                <div className="flex justify-between text-[10px] font-mono text-ink-600 mt-1">
                  <span>1h</span><span>16h</span>
                </div>
              </div>
<div>
                <label className="label-text">Mood</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m.value} onClick={() => setMood(m.value)} className={clsx('px-2 py-1 rounded-lg text-xs transition-all border', mood === m.value ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-ink-800 border-ink-700 text-ink-400 hover:border-ink-600')}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
<div>
                <label className="label-text">Energy Level</label>
                <div className="flex gap-2 mt-1">
                  {ENERGY_OPTIONS.map(e => (
                    <button key={e.value} onClick={() => setEnergyLevel(e.value)} className={clsx('flex-1 py-1.5 rounded-lg text-xs transition-all border', energyLevel === e.value ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-ink-800 border-ink-700 text-ink-400 hover:border-ink-600')}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Topics Not Understood (comma separated)</label>
                <input value={topicsNotUnderstood} onChange={e => setTopicsNotUnderstood(e.target.value)} placeholder="e.g. Fiscal deficit, Schedule 7..." className="input-field w-full mt-1 text-sm" />
              </div>
              <div>
                <label className="label-text">Notes Prepared Today</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setNotesPrepared(true)} className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold border transition-all', notesPrepared ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-ink-800 border-ink-700 text-ink-400')}>Yes ✓</button>
                  <button onClick={() => setNotesPrepared(false)} className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold border transition-all', !notesPrepared ? 'bg-red-900/20 border-red-700/40 text-red-400' : 'bg-ink-800 border-ink-700 text-ink-400')}>No ✗</button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="label-text">Additional Notes / Reflection</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How was today? Any challenges? Breakthroughs?" className="input-field w-full mt-1 h-20 resize-none text-sm" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting || submitted} className="w-full btn-primary py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <div className="w-5 h-5 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" /> : <Brain className="w-5 h-5" />}
            {submitted ? 'Report Submitted ✓' : submitting ? 'ARJUN Analyzing...' : 'Submit Daily Report'}
          </button>
        </div>
<div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <h3 className="font-semibold text-sm text-ink-200">14-Day Performance</h3>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9f8a67' }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#241d16', border: '1px solid #3d3124', borderRadius: 8, fontSize: 11 }}
                    formatter={tooltipFormatter}
                  />
                  <Bar dataKey="completion" fill="#ff7c0a" opacity={0.8} radius={[2, 2, 0, 0]} name="completion" />
                  <Bar dataKey="hours" fill="#12b97a" opacity={0.6} radius={[2, 2, 0, 0]} name="hours" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-40 flex items-center justify-center text-ink-600 text-xs">No data yet</div>}
          </div>
<div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-deep-400" />
              <h3 className="font-semibold text-sm text-ink-200">Recent Days</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {entries.slice(0, 10).map((entry: any) => (
                <div key={entry._id} className="flex items-center gap-2 p-2 bg-ink-900/40 rounded-lg">
                  <div className={clsx('w-1.5 h-6 rounded-full', entry.completionRate >= 70 ? 'bg-teal-500' : entry.completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500')} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-ink-400">{format(new Date(entry.date), 'EEE, dd MMM')}</div>
                    <div className="text-xs text-ink-500">{entry.completionRate}% · {entry.totalStudyHours}h</div>
                  </div>
                  <div className="text-xs">
                    {entry.mood === 'motivated' && '💪'}
                    {entry.mood === 'confident' && '🎯'}
                    {entry.mood === 'neutral' && '😐'}
                    {entry.mood === 'stressed' && '😰'}
                    {entry.mood === 'burnt_out' && '🔥'}
                  </div>
                </div>
              ))}
            </div>
          </div>
{entries[0]?.aiInsight && (
            <div className="deep-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5 text-deep-400" />
                <span className="text-[10px] font-mono text-deep-400 uppercase tracking-wider">ARJUN's Latest Insight</span>
              </div>
              <p className="text-xs text-ink-300 leading-relaxed">{entries[0].aiInsight}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

