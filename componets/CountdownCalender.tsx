
'use client';
import { Calendar as CalendarIcon } from 'lucide-react';
import clsx from 'clsx';

const format = (date: Date, fmt: string) => {
  const d = new Date(date);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => n.toString().padStart(2, '0');
  return fmt.replace('dd', pad(d.getDate())).replace('MMM', monthNames[d.getMonth()]).replace('MMMM', monthNames[d.getMonth()]).replace('yyyy', d.getFullYear().toString());
};

const differenceInDays = (end: Date, start: Date) => {
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const startOfMonth = (date: Date) => {
  const d = new Date(date);
  d.setDate(1);
  return d;
};

const endOfMonth = (date: Date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return d;
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

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const getDay = (date: Date) => date.getDay();

interface CountdownCalendarProps {
  targetDate: string; 
  examName: string;
}

export default function CountdownCalendar({ targetDate, examName }: CountdownCalendarProps) {
  const today = new Date(); 
  const target = new Date(targetDate);
  const daysLeft = differenceInDays(target, today);
  const monthStart = startOfMonth(target);
  const monthEnd = endOfMonth(target);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);

  return (
    <div className="glass-card p-5 border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-500/10 to-transparent shadow-2xl">
<div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
            {examName}
          </h3>
          <p className="text-3xl font-display font-bold text-white mt-1">
            {daysLeft} <span className="text-xs font-normal text-slate-400 font-sans tracking-normal uppercase">Days Left</span>
          </p>
        </div>
        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
          <CalendarIcon className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2 px-1">
           <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest font-mono">
             {format(target, 'MMMM yyyy')}
           </span>
        </div>
<div className="grid grid-cols-7 gap-1 text-center">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={`weekday-${day}-${i}`} className="text-[10px] font-bold text-slate-500 pb-2">
              {day}
            </div>
          ))}
{Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
{daysInMonth.map((day) => {
            const isTargetDay = isSameDay(day, target);
            return (
              <div 
                key={day.toISOString()} 
                className={clsx(
                  "aspect-square flex items-center justify-center text-[10px] rounded-lg border transition-all duration-300",
                  isTargetDay 
                    ? "bg-cyan-500 border-cyan-400 text-slate-900 font-bold scale-110 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10" 
                    : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-cyan-500/50"
                )}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
      </div>
<div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono">
        <span className="text-slate-500 italic font-medium">D-Day: {format(target, 'dd MMM yyyy')}</span>
        <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 uppercase tracking-tighter font-bold">Live Status</span>
        </div>
      </div>
    </div>
  );
}

