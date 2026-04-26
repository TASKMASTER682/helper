'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { plansAPI } from '@/lib/api';
import clsx from 'clsx';

interface PlanCalendarProps {
  plans?: any[];
}

const format = (date: Date, fmt: string) => {
  const d = new Date(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad = (n: number) => n.toString().padStart(2, '0');
  return fmt
    .replace('dd', pad(d.getDate()))
    .replace('MMM', monthNames[d.getMonth()])
    .replace('MMMM', monthNames[d.getMonth()])
    .replace('yyyy', d.getFullYear().toString())
    .replace('EEEE', dayNames[d.getDay()]);
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

export default function PlanCalendar({ plans = [] }: PlanCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  // Calculate statuses and overlaps for all plans
  const [dayData, setDayData] = useState<Record<string, {
    plans: any[],
    isOverlapping: boolean,
    totalTasks: number,
    completedTasks: number
  }>>({});

  useEffect(() => {
    const data: Record<string, any> = {};
    const today = new Date();
    // We want to show a window of dates (e.g., 30 days around today)
    const startRange = new Date(today);
    startRange.setDate(startRange.getDate() - 15);
    const endRange = new Date(today);
    endRange.setDate(endRange.getDate() + 15);
    
    const rangeDays = eachDayOfInterval({ start: startRange, end: endRange });

    rangeDays.forEach(day => {
      const dateStr = day.toISOString().slice(0, 10);
      const activePlans = plans.filter(p => {
        const start = new Date(p.startDate).toISOString().slice(0, 10);
        const end = new Date(p.endDate).toISOString().slice(0, 10);
        return dateStr >= start && dateStr <= end;
      });

      let totalTasks = 0;
      let completedTasks = 0;

      activePlans.forEach(p => {
        const logs = p.dailyLogs?.filter((l: any) => l.date === dateStr) || [];
        totalTasks += p.tasks?.length || 0;
        completedTasks += logs.filter((l: any) => l.status === 'completed').length;
      });

      data[dateStr] = {
        plans: activePlans,
        isOverlapping: activePlans.length > 1,
        totalTasks,
        completedTasks
      };
    });

    setDayData(data);
  }, [plans]);

  const handleToggleTask = async (planId: string, taskId: string) => {
    try {
      await plansAPI.toggleTask(planId, { date: selectedDate, taskId });
      // We rely on the parent to refresh the plans prop
      window.location.reload(); // Quick fix to refresh all states, or better: parent should handle refresh
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  
  // Get active range for display (30 days)
  const todayDate = new Date();
  const displayDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - 5 + i); // Start from 5 days ago
    return d;
  });

  const selectedDayInfo = dayData[selectedDate] || { plans: [], totalTasks: 0, completedTasks: 0 };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {displayDays.map((day, i) => {
          const dateStr = day.toISOString().slice(0, 10);
          const info = dayData[dateStr];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const hasTasks = info && info.totalTasks > 0;
          const isComplete = hasTasks && info.completedTasks === info.totalTasks;
          const isPartial = hasTasks && info.completedTasks > 0 && !isComplete;
          const isMissed = hasTasks && info.completedTasks === 0 && dateStr < today;
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(dateStr)}
              className={clsx(
                'min-w-[48px] h-16 rounded-2xl flex flex-col items-center justify-center transition-all border relative group',
                isSelected 
                  ? 'bg-primary text-white border-primary shadow-xl shadow-primary/30 z-10 scale-105' 
                  : isComplete 
                    ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                    : isPartial
                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30'
                      : isMissed
                        ? 'bg-red-500/10 border-red-500/30 text-red-400/70 hover:bg-red-500/20'
                        : 'bg-ink-900/40 border-ink-800 text-ink-400 hover:border-ink-600',
                isToday && !isSelected && 'ring-1 ring-yellow-500/50',
                !hasTasks && !isSelected && 'opacity-30'
              )}
            >
              {isToday && (
                <span className="absolute -top-2 px-1.5 py-0.5 bg-yellow-500 text-[7px] font-bold text-ink-950 rounded-full tracking-tighter">TODAY</span>
              )}
              <span className="text-[9px] uppercase font-bold opacity-50 mb-1 group-hover:opacity-100 transition-opacity">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
              </span>
              <span className="text-base font-black tracking-tight">{day.getDate()}</span>
              
              {/* Overlap Marker */}
              {info?.isOverlapping && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full border border-ink-950 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
              )}

              {/* Status Indicator */}
              {hasTasks && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: Math.min(info.totalTasks, 3) }).map((_, dotIdx) => (
                    <div 
                      key={dotIdx}
                      className={clsx(
                        "w-1 h-1 rounded-full",
                        dotIdx < info.completedTasks ? "bg-green-400" : "bg-ink-700"
                      )} 
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-center gap-4 text-[9px] font-mono text-ink-500 uppercase tracking-widest opacity-60">
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Today</div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Done</div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Missed</div>
        <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Overlap</div>
      </div>

      <div className="border-t border-ink-800/50 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-100 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-yellow-500 rounded-full" />
            {format(new Date(selectedDate), 'dd MMMM, EEEE')}
          </h3>
          <span className="text-[10px] font-mono text-ink-500">
            {selectedDayInfo.completedTasks}/{selectedDayInfo.totalTasks} Tasks
          </span>
        </div>

        <div className="space-y-4">
          {selectedDayInfo.plans.length === 0 ? (
            <div className="text-center py-8 bg-ink-900/20 rounded-xl border border-dashed border-ink-800">
              <p className="text-ink-600 text-xs italic">No active plans for this date</p>
            </div>
          ) : (
            selectedDayInfo.plans.map((plan: any) => (
              <div key={plan._id} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-ink-500 uppercase tracking-tighter truncate max-w-[150px]">
                    {plan.planName}
                  </span>
                  <div className="flex-1 h-[1px] bg-ink-800" />
                </div>
                {plan.tasks.map((task: any, idx: number) => {
                  const log = plan.dailyLogs?.find((l: any) => l.date === selectedDate && l.taskId === task._id);
                  const isCompleted = log?.status === 'completed';
                  return (
                    <div 
                      key={task._id} 
                      className={clsx(
                        'flex items-center justify-between p-3 rounded-xl border transition-all hover:border-ink-600',
                        isCompleted ? 'bg-green-500/5 border-green-500/20' : 'bg-ink-900/40 border-ink-800'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={clsx("text-sm font-medium truncate", isCompleted ? "text-green-400 line-through opacity-50" : "text-ink-100")}>
                          {task.taskName}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleTask(plan._id, task._id)}
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                          isCompleted 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                            : 'bg-ink-800 text-ink-500 hover:bg-ink-700'
                        )}
                      >
                        {isCompleted ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded border-2 border-ink-600" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}