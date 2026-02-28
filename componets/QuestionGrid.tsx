

'use client';
import React, { useState } from 'react';
import { CheckCircle2, XCircle, MinusCircle, Filter, Info } from 'lucide-react';
import clsx from 'clsx';

interface UserAnswer {
  status: 'correct' | 'wrong' | 'unattempted';
  marked: string | null;
  correct: string;
}

interface QuestionGridProps {
  userAnswers: Record<string, UserAnswer>;
}

const QuestionGrid = ({ userAnswers = {} }: QuestionGridProps) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');
  const [hoveredQ, setHoveredQ] = useState<string | null>(null);

  const qNums = Object.keys(userAnswers).sort((a, b) => parseInt(a) - parseInt(b));

  const filteredNums = qNums.filter(num => {
    if (filter === 'all') return true;
    return userAnswers[num].status === filter;
  });
  const getStatusColorClasses = (status?: string) => {
    switch (status) {
      case 'correct': return "bg-sky-500/10 border-sky-500/50 text-sky-400";
      case 'wrong': return "bg-red-500/10 border-red-500/50 text-red-400";
      case 'unattempted': return "bg-ink-800/30 border-ink-700 text-ink-500";
      default: return "bg-ink-950/50 border-ink-800 text-ink-600";
    }
  };

  return (
    <div className="glass-card p-6 mt-8 border border-ink-800/50 bg-ink-900/20 rounded-2xl relative">
<div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-bold text-ink-100 flex items-center gap-2">
            <Filter className="w-5 h-5 text-saffron-500" />
            Performance Breakdown
          </h3>
          <p className="text-[10px] text-ink-500 uppercase tracking-widest mt-1 italic">
            Analyze your response logic
          </p>
        </div>
<div className={clsx(
          "min-h-[70px] rounded-xl border p-4 flex items-center transition-all duration-300 shadow-xl",
          hoveredQ ? getStatusColorClasses(userAnswers[hoveredQ].status) : "bg-ink-950 border-ink-800 text-ink-600"
        )}>
          {hoveredQ && userAnswers[hoveredQ] ? (
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black/20 flex flex-col items-center justify-center border border-current/20">
                  <span className="text-[8px] font-bold uppercase opacity-60">Q.</span>
                  <span className="text-sm font-black">{hoveredQ}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[9px] font-bold uppercase tracking-tight opacity-70">Your Selection</span>
                   <span className="text-sm font-black uppercase tracking-widest">
                     {userAnswers[hoveredQ].marked || 'Skipped'}
                   </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-tight opacity-70">Correct Answer</span>
                <span className="text-xl font-black leading-none bg-jade-500/20 px-2 py-1 rounded text-jade-400">
                  {userAnswers[hoveredQ].correct}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium italic">Hover over any question below to see details...</span>
            </div>
          )}
        </div>
      </div>
<div className="flex bg-ink-950 p-1 rounded-xl border border-ink-800 mb-6 self-start inline-flex">
        {(['all', 'correct', 'wrong', 'unattempted'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
              filter === f ? "bg-saffron-500 text-ink-950 shadow-lg" : "text-ink-500 hover:text-ink-200"
            )}
          >
            {f === 'unattempted' ? 'Skipped' : f}
          </button>
        ))}
      </div>
<div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-3">
        {filteredNums.map((num) => {
          const data = userAnswers[num];
          if (!data) return null;

          const isCorrect = data.status === 'correct';
          const isWrong = data.status === 'wrong';
          const isSkipped = data.status === 'unattempted';
          
          return (
            <div
              key={num}
              onMouseEnter={() => setHoveredQ(num)}
              onMouseLeave={() => setHoveredQ(null)}
              className={clsx(
                "group relative h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-200 cursor-pointer",
                isCorrect && "bg-sky-500/10 border-sky-500 text-sky-200 hover:bg-sky-500/20",
                isWrong && "bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20",
                isSkipped && "bg-ink-900/50 border-ink-800 text-ink-500 hover:bg-ink-800",
                hoveredQ === num && "scale-110 z-10 shadow-lg ring-2 ring-saffron-500/50"
              )}
            >
              <span className="text-[10px] opacity-60 mb-0.5 font-mono">{num}</span>
              <span className="font-black text-sm leading-none uppercase">
                {data.marked || '—'}
              </span>
<div className="absolute -top-1.5 -right-1.5 shadow-xl rounded-full bg-ink-950 ring-1 ring-ink-800">
                {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-jade-500" />}
                {isWrong && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                {isSkipped && <MinusCircle className="w-3.5 h-3.5 text-ink-700" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionGrid;
