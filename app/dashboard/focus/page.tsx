'use client';

import { useEffect, useState } from 'react';
import { Play, ArrowLeft, Clock, Target, Zap, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { scheduleAPI, missionsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function FocusPage() {
  const [availableHours, setAvailableHours] = useState(4);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const { data } = await missionsAPI.getMissions();
      setMissions(data.filter((m: any) => m.status === 'active'));
    } catch (e) {
      console.error(e);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      const { data } = await scheduleAPI.generatePlan(availableHours);
      setPlan(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const totalRequired = plan?.totalRequired ? Math.round(plan.totalRequired / 60 * 10) / 10 : 0;
  const hasDeficit = plan?.deficit > 0;
  const hasExcess = plan?.excessHours > 0;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Daily Planner</h1>
          <p className="text-ink-500 text-sm mt-1 font-mono text-[10px]">MATH-DRIVEN EXECUTION ENGINE</p>
        </div>
      </div>

      <div className="glass-card p-6 border border-yellow-500/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold text-ink-100">Enter Available Time</h2>
            <p className="text-ink-500 text-xs">How many hours can you study today?</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="18"
            value={availableHours}
            onChange={(e) => setAvailableHours(Math.max(1, Math.min(18, Number(e.target.value))))}
            className="input-field w-24 text-center text-xl font-bold"
          />
          <span className="text-ink-400 font-mono text-sm">hours</span>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="btn-primary flex items-center gap-2 flex-1 justify-center"
          >
            {loading ? 'Generating...' : (
              <>
                <Zap className="w-4 h-4" /> Generate Plan
              </>
            )}
          </button>
        </div>
      </div>

      {plan && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {hasDeficit && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium text-sm">You are behind by {plan.deficit ? Math.round(plan.deficit / 60 * 10) / 10 : 0} hours</p>
                <p className="text-ink-500 text-xs mt-1">
                  Increase daily effort to {plan.shouldIncreaseBy || Math.ceil(totalRequired)} hours to catch up
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-black text-teal-500">{totalRequired}</div>
              <div className="text-[9px] font-mono text-ink-500 uppercase tracking-wider">Required</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-black text-white">{availableHours}</div>
              <div className="text-[9px] font-mono text-ink-500 uppercase tracking-wider">Available</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-black text-yellow-500">
                {plan.allocations?.length || 0}
              </div>
              <div className="text-[9px] font-mono text-ink-500 uppercase tracking-wider">Missions</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono text-ink-500 uppercase tracking-widest">Today's Allocation</h3>
            
            {plan.allocations?.length === 0 ? (
              <div className="text-center py-8 text-ink-500">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active missions to allocate</p>
              </div>
            ) : (
              plan.allocations?.map((allocation: any, idx: number) => (
                <div 
                  key={allocation.missionId}
                  className="glass-card p-4 border border-ink-800 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={clsx(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
                        idx === 0 ? 'bg-yellow-500 text-ink-950' : 'bg-ink-800 text-ink-400'
                      )}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-ink-100">{allocation.missionName}</h4>
                        <p className="text-ink-500 text-xs mt-1">
                          {allocation.daysLeft} days remaining · {allocation.remainingHours.toFixed(1)} hours left
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-teal-500">
                        {Math.round(allocation.allocatedMinutes / 60 * 10) / 10}h
                      </div>
                      <div className="text-[9px] text-ink-600 font-mono">allocated</div>
                    </div>
                  </div>

                  {allocation.blocks?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-ink-800">
                      <p className="text-[9px] text-ink-600 font-mono mb-2">SESSION BLOCKS</p>
                      <div className="flex gap-2">
                        {allocation.blocks.map((block: number, bIdx: number) => (
                          <div 
                            key={bIdx}
                            className="flex-1 py-2 bg-ink-900 rounded-lg text-center text-xs font-mono text-ink-400"
                          >
                            {block >= 60 ? `${block / 60}h` : `${block}m`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {hasExcess && (
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
              <p className="text-teal-400 text-sm font-medium">
                +{plan.excessHours.toFixed(1)} hours extra available for revision or buffer
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}