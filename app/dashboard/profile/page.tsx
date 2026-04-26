'use client';
import { useEffect, useState } from 'react';
import { userAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { User, Save, Trophy, Target, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const SUBJECTS = ['Polity', 'History', 'Geography', 'Economy', 'Environment', 'Science & Tech', 'Ethics', 'Current Affairs', 'CSAT', 'Optional'];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [profile, setProfile] = useState({
    attemptYear: user?.profile?.attemptYear || 2026,
    dailyStudyHours: user?.profile?.dailyStudyHours || 8,
    optionalSubject: user?.profile?.optionalSubject || '',
    fitnessGoal: user?.profile?.fitnessGoal || '',
    scoreTargets: user?.profile?.scoreTargets || { essay: 140, gs1: 120, gs2: 110, gs3: 110, gs4: 150, optional: 300 },
    preferredSlots: user?.profile?.preferredSlots || []
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userAPI.getStats();
        setLiveStats(data);
      } catch {
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile({ profile });
      setUser(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Profile & Goals</h1>
          <p className="text-ink-500 text-sm mt-1">Configure your UPSC preparation parameters</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
<div className="glass-card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-ink-100">{user?.name}</h3>
            <p className="text-ink-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-mono text-yellow-400">Streak: {liveStats?.studyStreak ?? user?.stats?.studyStreak ?? 0}d</span>
              <span className="text-xs font-mono text-deep-400">Study days: {liveStats?.totalStudyDays ?? user?.stats?.totalStudyDays ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
<div className="glass-card p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-ink-200 flex items-center gap-2">
          <Target className="w-4 h-4 text-yellow-400" />
          Preparation Setup
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text flex items-center gap-1"><Calendar className="w-3 h-3" />Attempt Year</label>
            <select value={profile.attemptYear} onChange={e => setProfile(p => ({ ...p, attemptYear: parseInt(e.target.value) }))} className="input-field w-full">
              {[2025, 2026, 2027, 2028].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text flex items-center gap-1"><Clock className="w-3 h-3" />Daily Study Hours</label>
            <input type="number" min="4" max="16" value={profile.dailyStudyHours} onChange={e => setProfile(p => ({ ...p, dailyStudyHours: parseInt(e.target.value) }))} className="input-field w-full" />
          </div>
          <div>
            <label className="label-text">Optional Subject</label>
            <select value={profile.optionalSubject} onChange={e => setProfile(p => ({ ...p, optionalSubject: e.target.value }))} className="input-field w-full">
              <option value="">Select Optional...</option>
              {[
                'Agriculture',
                'Animal Husbandry and Veterinary Science',
                'Anthropology',
                'Botany',
                'Chemistry',
                'Civil Engineering',
                'Commerce and Accountancy',
                'Economics',
                'Electrical Engineering',
                'Geography',
                'Geology',
                'History',
                'Law',
                'Management',
                'Mathematics',
                'Mechanical Engineering',
                'Medical Science',
                'Philosophy',
                'Physics',
                'Political Science and International Relations',
                'Psychology',
                'Public Administration',
                'Sociology',
                'Statistics',
                'Zoology'
              ].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Fitness Goal</label>
            <input value={profile.fitnessGoal} onChange={e => setProfile(p => ({ ...p, fitnessGoal: e.target.value }))} placeholder="e.g. 30 min walk daily" className="input-field w-full" />
          </div>
        </div>
      </div>
<div className="glass-card p-5 space-y-4">
        <h3 className="font-display text-base font-semibold text-ink-200 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-teal-400" />
          Mains Score Targets
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { key: 'essay', label: 'Essay', max: 250 },
            { key: 'gs1', label: 'GS Paper 1', max: 250 },
            { key: 'gs2', label: 'GS Paper 2', max: 250 },
            { key: 'gs3', label: 'GS Paper 3', max: 250 },
            { key: 'gs4', label: 'GS Paper 4', max: 250 },
            { key: 'optional', label: 'Optional', max: 500 },
          ].map(({ key, label, max }) => (
            <div key={key}>
              <label className="label-text">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={max}
                  value={profile.scoreTargets[key as keyof typeof profile.scoreTargets]}
                  onChange={e => setProfile(p => ({
                    ...p,
                    scoreTargets: { ...p.scoreTargets, [key]: parseInt(e.target.value) }
                  }))}
                  className="input-field flex-1"
                />
                <span className="text-xs text-ink-500 font-mono">/{max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



