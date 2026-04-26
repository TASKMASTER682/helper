'use client';
import { useEffect, useState } from 'react';
import { plansAPI } from '@/lib/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import clsx from 'clsx';

interface PlanGraphProps {
  planId?: string;
  plans?: any[];
}

export default function PlanGraph({ planId, plans: propPlans }: PlanGraphProps) {
  const [graphData, setGraphData] = useState<any[]>([]);
  const [planStats, setPlanStats] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    plansAPI.getPlans()
      .then(res => {
        setPlans(res.data);
        if (res.data.length > 0) {
          const targetId = planId || res.data[0]._id;
          setSelectedPlanId(targetId);
        }
      })
      .catch(err => console.error(err));
  }, [planId]);

  useEffect(() => {
    if (selectedPlanId) {
      plansAPI.getStats(selectedPlanId)
        .then(res => {
          setPlanStats(res.data);
          setGraphData(res.data.graphData || []);
        })
        .catch(err => console.error(err));
    }
  }, [selectedPlanId]);

  useEffect(() => {
    if (propPlans && propPlans.length > 0 && selectedPlanId) {
      const matched = propPlans.find(p => p._id === selectedPlanId);
      if (matched) {
        plansAPI.getStats(selectedPlanId)
          .then(res => {
            setPlanStats(res.data);
            setGraphData(res.data.graphData || []);
          })
          .catch(err => console.error(err));
      }
    }
  }, [propPlans]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}`;
  };

  if (plans.length === 0) {
    return (
      <div className="glass-card p-4 text-center">
        <p className="text-ink-500 text-xs">Create a plan to see your progress</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Consistency Graph</h3>
        <select
          className="input-field text-xs py-1"
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
        >
          {plans.map((p: any) => (
            <option key={p._id} value={p._id}>{p.planName}</option>
          ))}
        </select>
      </div>

      {planStats && (
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-ink-500">Streak:</span>
            <span className="ml-1 text-orange-400 font-bold">{planStats.streak}</span>
          </div>
          <div>
            <span className="text-ink-500">Track:</span>
            <span className={clsx('ml-1 font-bold', planStats.onTrack ? 'text-green-400' : 'text-red-400')}>
              {Math.round(planStats.trackScore * 100)}%
            </span>
          </div>
          <div>
            <span className="text-ink-500">Today:</span>
            <span className="ml-1 text-primary font-bold">{Math.round(planStats.todayRatio * 100)}%</span>
          </div>
        </div>
      )}

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="colorRatio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 10 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis 
              domain={[0, 1]} 
              tickFormatter={(v) => `${Math.round(v * 100)}%`}
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value) => [`${Math.round((value as number) * 100)}%`, 'Completion']}
            />
            <Area 
              type="monotone" 
              dataKey="ratio" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorRatio)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}