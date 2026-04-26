'use client';
import { useEffect, useState } from 'react';
import { plansAPI } from '@/lib/api';
import { Plus, X, CheckCircle2, ChevronLeft, ChevronRight, Calendar, Flame, TrendingUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Link from 'next/link';

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

const eachDayOfInterval = ({ start, end }: { start: Date; end: Date }) => {
  const days: Date[] = [];
  let current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [planStats, setPlanStats] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    planName: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 29), 'yyyy-MM-dd'),
    tasks: [{ taskName: '' }]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      const { data } = await plansAPI.getPlans();
      setPlans(data);
    } catch {} finally { setLoading(false); }
  };

  const loadPlanDetails = async (plan: any) => {
    try {
      setSelectedPlan(plan);
      const [statsRes] = await Promise.all([
        plansAPI.getStats(plan._id)
      ]);
      setPlanStats(statsRes.data);
    } catch {}
  };

  const handleCreatePlan = async () => {
    if (!newPlan.planName || !newPlan.tasks.filter(t => t.taskName).length) {
      toast.error('Plan name and at least one task required'); return;
    }
    setSaving(true);
    try {
      const { data } = await plansAPI.createPlan(newPlan);
      setPlans([data, ...plans]);
      setShowAddModal(false);
      setNewPlan({
        planName: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 29), 'yyyy-MM-dd'),
        tasks: [{ taskName: '' }]
      });
      toast.success('Plan created!');
    } catch { toast.error('Failed to create plan'); }
    finally { setSaving(false); }
  };

  const handleToggleTask = async (taskId: string, date?: string) => {
    if (!selectedPlan) return;
    try {
      const targetDate = date || selectedDate;
      const { data } = await plansAPI.toggleTask(selectedPlan._id, { date: targetDate, taskId });
      setSelectedPlan(data);
      
      // Sync the plans array to update percentages on cards
      setPlans(prev => prev.map(p => p._id === data._id ? data : p));
      
      const statsRes = await plansAPI.getStats(data._id);
      setPlanStats(statsRes.data);
    } catch { toast.error('Failed to update'); }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await plansAPI.deletePlan(id);
      setPlans(plans.filter(p => p._id !== id));
      if (selectedPlan?._id === id) setSelectedPlan(null);
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const getTaskStatus = (task: any) => {
    if (!selectedPlan || !selectedDate) return 'pending';
    const log = selectedPlan.dailyLogs?.find(
      (l: any) => l.date === selectedDate && l.taskId === task._id
    );
    return log?.status || 'pending';
  };

  const addTaskField = () => {
    setNewPlan({
      ...newPlan,
      tasks: [...newPlan.tasks, { taskName: '' }]
    });
  };

  const updateTaskField = (index: number, field: string, value: string) => {
    const updated = [...newPlan.tasks];
    updated[index] = { ...updated[index], [field]: value };
    setNewPlan({ ...newPlan, tasks: updated });
  };

  const removeTaskField = (index: number) => {
    setNewPlan({ ...newPlan, tasks: newPlan.tasks.filter((_, i) => i !== index) });
  };

  const getDays = (plan: any) => {
    return eachDayOfInterval({
      start: new Date(plan.startDate),
      end: new Date(plan.endDate)
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Daily Task Plans</h1>
          <p className="text-ink-500 text-sm mt-1 font-mono text-[10px]">CONSISTENCY TRACKING</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Plan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-500">Loading...</div>
      ) : plans.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-ink-400" />
          <p className="text-ink-300 mb-4">No daily plans yet</p>
          <p className="text-ink-500 text-sm">Create a plan to track your daily tasks</p>
        </div>
      ) : !selectedPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => {
            const days = getDays(plan);
            const totalTasks = plan.dailyLogs?.length || 0;
            const overallCompleted = plan.dailyLogs?.filter((l: any) => l.status === 'completed').length || 0;
            const overallRatio = totalTasks > 0 ? overallCompleted / totalTasks : 0;
            
            const today = format(new Date(), 'yyyy-MM-dd');
            const todayLog = plan.dailyLogs?.filter((l: any) => l.date === today);
            const todayCompleted = todayLog?.filter((l: any) => l.status === 'completed').length || 0;
            const todayRatio = plan.tasks.length > 0 ? todayCompleted / plan.tasks.length : 0;

            return (
              <div key={plan._id} onClick={() => loadPlanDetails(plan)} 
                className="glass-card p-5 hover:border-primary cursor-pointer transition-all group relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-ink-100 group-hover:text-primary transition-colors">{plan.planName}</h3>
                    <p className="text-[10px] text-ink-400 font-mono mt-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(plan.startDate), 'dd MMM')} - {format(new Date(plan.endDate), 'dd MMM')}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan._id); }} 
                    className="text-ink-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-ink-500 uppercase font-mono tracking-wider">Overall Progress</span>
                    <span className="text-xs font-bold text-primary">{Math.round(overallRatio * 100)}%</span>
                  </div>
                  <div className="h-2 bg-ink-800 rounded-full overflow-hidden border border-ink-700/50">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-focus transition-all duration-500 ease-out" 
                      style={{ width: `${overallRatio * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-800/50">
                  <div className="flex items-center gap-1.5">
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      todayRatio >= 1 ? "bg-green-500" : todayRatio > 0 ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" : "bg-ink-700"
                    )} />
                    <span className="text-[10px] text-ink-400 font-medium">Today: {Math.round(todayRatio * 100)}%</span>
                  </div>
                  <span className="text-[10px] text-ink-500 font-mono">{days.length} Days</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          <button onClick={() => setSelectedPlan(null)} className="flex items-center gap-2 text-ink-400 hover:text-ink-200">
            <ChevronLeft size={16} /> Back to plans
          </button>
          
          <div className="grid grid-cols-4 gap-2">
            {getDays(selectedPlan).map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayLogs = selectedPlan.dailyLogs?.filter((l: any) => l.date === dateStr) || [];
              const completed = dayLogs.filter((l: any) => l.status === 'completed').length;
              const ratio = selectedPlan.tasks.length > 0 ? completed / selectedPlan.tasks.length : 0;
              const isSelected = dateStr === selectedDate;
              const isPast = dateStr <= format(new Date(), 'yyyy-MM-dd');
              
              return (
                <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                  disabled={!isPast}
                  className={clsx(
                    'p-2 text-xs rounded-lg transition-all',
                    isSelected ? 'bg-primary text-white' : ratio >= 0.8 ? 'bg-green-900/30 text-green-400' : ratio > 0 ? 'bg-yellow-900/30 text-yellow-400' : 'bg-ink-800 text-ink-500',
                    !isPast && 'opacity-30 cursor-not-allowed'
                  )}>
                  {format(day, 'dd')}
                </button>
              );
            })}
          </div>

          {selectedPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <div className="lg:col-span-2 glass-card p-4">
                <h3 className="font-medium mb-3">Tasks for {format(new Date(selectedDate), 'dd MMM yyyy')}</h3>
                <div className="space-y-2">
                  {selectedPlan.tasks.map((task: any) => {
                    const status = getTaskStatus(task);
                    return (
                      <div key={task._id} className="flex items-center justify-between p-3 bg-ink-900 rounded-lg">
                        <div>
                          <p className="font-medium">{task.taskName}</p>
                        </div>
                        <button onClick={() => handleToggleTask(task._id)}
                          className={clsx(
                            'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                            status === 'completed' ? 'bg-green-600 text-white' : 'bg-ink-800 text-ink-500'
                          )}>
                          {status === 'completed' ? <CheckCircle2 size={20} /> : <span className="w-5 h-5 rounded-full border-2 border-ink-600" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Today's Progress</span>
                  </div>
                  {planStats && (
                    <>
                      <div className="text-3xl font-bold text-primary">{Math.round(planStats.todayRatio * 100)}%</div>
                      <p className="text-sm text-ink-500 mt-1">
                        {planStats.todayRatio >= 0.8 ? 'On track!' : 'Keep going!'}
                      </p>
                    </>
                  )}
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Stats</span>
                  </div>
                  {planStats && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-500">Streak</span>
                        <span className="font-mono text-orange-400">{planStats.streak} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-500">Completed</span>
                        <span className="font-mono text-green-400">{planStats.completedDays}/{planStats.totalDays} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-ink-500">Track Score</span>
                        <span className={clsx('font-mono', planStats.onTrack ? 'text-green-400' : 'text-red-400')}>
                          {Math.round(planStats.trackScore * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass-card w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">New Daily Plan</h2>
              <button onClick={() => setShowAddModal(false)} className="text-ink-500 hover:text-ink-300">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-ink-400 mb-1">Plan Name</label>
                <input type="text" value={newPlan.planName} onChange={e => setNewPlan({...newPlan, planName: e.target.value})}
                  className="input-field w-full" placeholder="e.g., Daily Study Routine" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink-400 mb-1">Start Date</label>
                  <input type="date" value={newPlan.startDate} onChange={e => setNewPlan({...newPlan, startDate: e.target.value})}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="block text-sm text-ink-400 mb-1">End Date</label>
                  <input type="date" value={newPlan.endDate} onChange={e => setNewPlan({...newPlan, endDate: e.target.value})}
                    className="input-field w-full" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-ink-400 mb-2">Daily Tasks</label>
                {newPlan.tasks.map((task, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={task.taskName} onChange={e => updateTaskField(idx, 'taskName', e.target.value)}
                      className="input-field flex-1" placeholder="Task name" />
                    {newPlan.tasks.length > 1 && (
                      <button onClick={() => removeTaskField(idx)} className="text-red-400 p-2">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addTaskField} className="text-primary text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Task
                </button>
              </div>

              <button onClick={handleCreatePlan} disabled={saving} className="btn-primary w-full">
                {saving ? 'Creating...' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}