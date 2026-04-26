'use client';
import { useEffect, useState } from 'react';
import { trackerAPI } from '@/lib/api';
import { Plus, X, CheckCircle2, Trash2, Flame, Save, Brain, BookOpen, Target, Zap, Calendar, XCircle, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const format = (date: Date, fmt: string) => {
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const map: any = {
    'EEEE': days[d.getDay()],
    'EEE': days[d.getDay()].slice(0, 3),
    'MMMM': months[d.getMonth()],
    'MMM': months[d.getMonth()].slice(0, 3),
    'MM': pad(d.getMonth() + 1),
    'yyyy': d.getFullYear(),
    'dd': pad(d.getDate()),
    'd': d.getDate()
  };

  return fmt.replace(/EEEE|EEE|MMMM|MMM|MM|yyyy|dd|d/g, (matched) => map[matched]);
};

const DEFAULT_HABITS = [
  { id: 'mcq', label: 'MCQ Practice', icon: Brain, color: 'purple' },
  { id: 'revision', label: 'Revision', icon: BookOpen, color: 'jade' },
  { id: 'test', label: 'Test Given', icon: Target, color: 'red' },
  { id: 'reading', label: 'Reading', icon: Zap, color: 'yellow' },
];

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

export default function TrackerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [customHabits, setCustomHabits] = useState<{id: string, label: string}[]>([...DEFAULT_HABITS]);
  const [habits, setHabits] = useState<Record<string, boolean>>({});
  const [habitHours, setHabitHours] = useState<Record<string, number>>({});
  const [focusScore, setFocusScore] = useState(7);
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [mood, setMood] = useState('neutral');
  const [notes, setNotes] = useState('');
  const [newHabitLabel, setNewHabitLabel] = useState('');

  useEffect(() => {
    loadData();
    loadCustomHabits();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await trackerAPI.getEntries(14);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomHabits = () => {
    const saved = localStorage.getItem('daily_habits');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomHabits(parsed);
      } catch {}
    }
  };

  const saveCustomHabits = (habits: {id: string, label: string}[]) => {
    setCustomHabits(habits);
    localStorage.setItem('daily_habits', JSON.stringify(habits));
  };

  const handleAddHabit = () => {
    if (!newHabitLabel.trim()) return;
    const id = newHabitLabel.toLowerCase().replace(/\s+/g, '_');
    if (customHabits.find(h => h.id === id)) {
      toast.error('Habit already exists');
      return;
    }
    const newHabits = [...customHabits, { id, label: newHabitLabel.trim() }];
    saveCustomHabits(newHabits);
    setNewHabitLabel('');
  };

  const handleRemoveHabit = (id: string) => {
    const newHabits = customHabits.filter(h => h.id !== id);
    saveCustomHabits(newHabits);
    const newHabitsState = { ...habits };
    const newHoursState = { ...habitHours };
    delete newHabitsState[id];
    delete newHoursState[id];
    setHabits(newHabitsState);
    setHabitHours(newHoursState);
  };

  const handleToggleHabit = (habitId: string) => {
    setHabits(prev => ({ ...prev, [habitId]: !prev[habitId] }));
    if (!habits[habitId]) {
      setHabitHours(prev => ({ ...prev, [habitId]: 1 }));
    }
  };

  const handleHoursChange = (habitId: string, hours: number) => {
    setHabitHours(prev => ({ ...prev, [habitId]: Math.max(0, hours) }));
  };

  const totalHours = Object.values(habitHours).reduce((a, b) => a + b, 0);
  const completedHabits = Object.values(habits).filter(Boolean).length;

  const handleSubmit = async () => {
    if (completedHabits === 0) {
      toast.error('Complete at least one habit');
      return;
    }

    setSubmitting(true);
    try {
      const habitData = customHabits.map(h => ({
        type: h.id,
        label: h.label,
        completed: habits[h.id] || false,
        hours: habitHours[h.id] || 0,
      }));

      await trackerAPI.submitDaily({
        date: new Date().toISOString(),
        habits: habitData,
        focusScore,
        energyLevel,
        mood,
        notes,
        completionRate: Math.round((completedHabits / customHabits.length) * 100),
        totalHours,
      });

      toast.success('Day logged!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const last7Days = entries.slice(-7);
  const habitColors = ['purple', 'jade', 'red', 'yellow', 'blue', 'pink', 'orange', 'teal'];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="section-title">Daily Tracker</h1>
        <p className="text-ink-500 text-sm mt-1 font-mono text-[10px]">Track your daily habits</p>
      </div>

      <div className="glass-card p-6 border border-yellow-500/20">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-yellow-500" />
          <h2 className="font-display text-lg font-semibold text-ink-100">
            {format(new Date(), 'EEEE, d MMMM')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {customHabits.map((habit, idx) => {
            const isCompleted = habits[habit.id];
            const color = habitColors[idx % habitColors.length];
            return (
              <div
                key={habit.id}
                className={clsx(
                  'p-4 rounded-xl border-2 transition-all cursor-pointer relative group',
                  isCompleted
                    ? `border-${color}-500/50 bg-${color}-500/10`
                    : 'border-ink-800 bg-ink-900/30'
                )}
                onClick={() => handleToggleHabit(habit.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx('font-medium text-sm', isCompleted ? `text-${color}-200` : 'text-ink-200')}>
                    {habit.label}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 className={`w-5 h-5 text-${color}-500`} />
                  ) : (
                    <XCircle className="w-5 h-5 text-ink-700" />
                  )}
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={habitHours[habit.id] || 0}
                      onChange={(e) => handleHoursChange(habit.id, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className="input-field w-16 text-center text-sm py-1"
                    />
                    <span className="text-xs text-ink-500">hrs</span>
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveHabit(habit.id); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            value={newHabitLabel}
            onChange={(e) => setNewHabitLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddHabit()}
            placeholder="Add custom habit..."
            className="input-field flex-1"
          />
          <button
            onClick={handleAddHabit}
            disabled={!newHabitLabel.trim()}
            className="btn-primary px-4"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-xs text-ink-500 mb-2 block">Focus Score</label>
            <input
              type="range"
              min="1"
              max="10"
              value={focusScore}
              onChange={(e) => setFocusScore(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <div className="text-center text-sm font-bold text-yellow-500 mt-1">{focusScore}/10</div>
          </div>
          <div>
            <label className="text-xs text-ink-500 mb-2 block">Energy</label>
            <select
              value={energyLevel}
              onChange={(e) => setEnergyLevel(e.target.value)}
              className="input-field w-full"
            >
              {ENERGY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-ink-500 mb-2 block">Mood</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="input-field w-full"
            >
              {MOOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-xs text-ink-500 mb-2 block">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you learn today?"
            className="input-field w-full h-20 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || completedHabits === 0}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {submitting ? 'Saving...' : `Log Day (${completedHabits}/${customHabits.length} • ${totalHours}h)`}
        </button>
      </div>

      {!loading && entries.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-jade-400" />
            <h3 className="font-semibold text-sm text-ink-200">Last 7 Days</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {last7Days.map((entry: any, idx: number) => {
              const date = new Date(entry.date);
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <div
                  key={idx}
                  className={clsx(
                    'p-2 rounded-lg text-center',
                    isToday ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-ink-900/30'
                  )}
                >
                  <div className="text-[10px] text-ink-500 font-mono">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-xs font-bold text-ink-200">
                    {format(date, 'd')}
                  </div>
                  <div className="text-lg font-bold text-jade-400">
                    {entry.completionRate || 0}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}