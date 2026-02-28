'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, Timer, Settings2, Coffee, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const DEFAULT_MINUTES = 50;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.max(0, seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

export default function FocusModePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get('title') || 'Deep Focus Session';
  const initialMinutes = Math.max(1, Number(searchParams.get('minutes')) || DEFAULT_MINUTES);

  const [inputMinutes, setInputMinutes] = useState(initialMinutes);
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const progressPercentage = useMemo(() => {
    return Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds));
  }, [remainingSeconds, totalSeconds]);

  const offset = circumference - progressPercentage * circumference;

  const handleApply = () => {
    const mins = Math.max(1, Math.min(300, Number(inputMinutes)));
    setTotalSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
    setIsRunning(false);
  };

  const handleReset = () => {
    setRemainingSeconds(totalSeconds);
    setIsRunning(false);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 overflow-hidden relative bg-ink-950">
<div className={clsx(
        "absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000",
        isRunning ? "bg-yellow-500/20 scale-125" : "bg-yellow-500/10 scale-100"
      )} />
      <div className={clsx(
        "absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000",
        isRunning ? "bg-teal-500/20 scale-125" : "bg-teal-500/10 scale-100"
      )} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl z-10"
      >
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-ink-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-mono uppercase tracking-widest">Exit</span>
          </button>
          
          <motion.div 
            animate={isRunning ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ repeat: Infinity, duration: 3 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-yellow-500 text-[10px] font-mono uppercase tracking-[0.2em]"
          >
            <div className={clsx("w-1.5 h-1.5 rounded-full bg-yellow-500", isRunning && "animate-ping")} />
            {isRunning ? 'Flow Active' : 'System Ready'}
          </motion.div>
        </div>

        <div className="glass-card p-8 md:p-12 backdrop-blur-3xl border-white/5 shadow-2xl rounded-3xl">
          <h1 className="text-center text-3xl md:text-4xl font-display font-bold text-white mb-10 tracking-tight">
            {initialTitle}
          </h1>
          
          <div className="relative flex items-center justify-center mb-12">
            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
              <circle
                cx="50%" cy="50%" r={radius}
                stroke="currentColor" strokeWidth="6" fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="50%" cy="50%" r={radius}
                stroke="currentColor" strokeWidth="6" fill="transparent"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round"
                className="text-yellow-500"
                style={{ filter: 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.4))' }}
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={remainingSeconds}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-7xl font-display font-bold text-white tracking-tighter"
                >
                  {formatTime(remainingSeconds)}
                </motion.span>
              </AnimatePresence>
              <div className="h-px w-12 bg-white/20 my-2" />
              <span className="text-[10px] font-mono text-ink-500 uppercase tracking-[0.3em]">
                {Math.round(progressPercentage * 100)}% Focus
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 justify-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRunning(!isRunning)}
              className={clsx(
                "h-20 w-20 rounded-full flex items-center justify-center transition-all",
                isRunning 
                  ? "bg-white/5 text-white border border-white/20 shadow-inner" 
                  : "bg-yellow-500 text-ink-950 shadow-[0_10px_40px_-10px_rgba(234,179,8,0.5)]"
              )}
            >
              {isRunning ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
            </motion.button>

            <motion.button
              whileHover={{ rotate: -180, scale: 1.1 }}
              onClick={handleReset}
              className="h-14 w-14 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-ink-400 hover:text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>
<div className="pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
              
              <div className="w-full md:w-auto flex-shrink-0">
                <label className="block text-[10px] font-mono text-ink-500 uppercase tracking-widest mb-3">
                  <Settings2 className="w-3 h-3 inline mr-1.5 mb-0.5" /> Session Length
                </label>
                <div className="flex gap-2 h-11">
                  <input
                    type="number"
                    value={inputMinutes}
                    onChange={(e) => setInputMinutes(Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/10 rounded-xl text-center font-bold text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                  />
                  <button 
                    onClick={handleApply} 
                    className="px-5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                  >
                    Set Time
                  </button>
                </div>
              </div>

              <div className="w-full md:max-w-[260px]">
                <div className="bg-teal-500/5 border border-teal-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <Coffee className="w-4 h-4 text-teal-500 mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-teal-200/60 font-medium">
                    Break intervals are crucial. Every 50m, take 5m to rest your eyes.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
