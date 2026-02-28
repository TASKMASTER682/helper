'use client';
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Brain, Loader2, CheckCircle2, 
  AlertTriangle, Sparkles, Lightbulb, RefreshCcw 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import clsx from 'clsx';
import QuestionGrid from '@/componets/QuestionGrid';

interface ResultScreenProps {
  result: any;
  aiFeedback: any;
  deepAnalysis: any;
  pollingAI: boolean;
  onBack: () => void;
  onReattempt: () => void;
}

// Helper functions
const parseScore = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    const direct = Number(cleaned);
    if (Number.isFinite(direct)) return direct;
    const match = cleaned.match(/-?\d+(\.\d+)?/);
    if (match) {
      const extracted = Number(match[0]);
      if (Number.isFinite(extracted)) return extracted;
    }
  }
  return null;
};

const getStrengths = (aiFeedback: any) => {
  return aiFeedback?.summary?.strengths || aiFeedback?.strengths || [];
};

const getWeakAreas = (aiFeedback: any, result: any, strengths: string[]) => {
  const weakAreas = (aiFeedback?.topicList || aiFeedback?.weakAreas || result?.weakAreas || [])
    .filter((topic: string) => !strengths.includes(topic));
  return weakAreas;
};

const getRecommendations = (aiFeedback: any) => {
  const fromSummary = aiFeedback?.summary?.studyRecommendations;
  if (Array.isArray(fromSummary)) return fromSummary;
  if (typeof fromSummary === 'string' && fromSummary.trim()) return [fromSummary];
  if (Array.isArray(aiFeedback?.strategy) && aiFeedback.strategy.length > 0) return aiFeedback.strategy;
  if (typeof aiFeedback?.strategy === 'string' && aiFeedback.strategy.trim()) return [aiFeedback.strategy];
  return ["Review your concepts."];
};

const getFinalDeepAnalysis = (deepAnalysis: any, aiFeedback: any) => {
  return (
    (Array.isArray(deepAnalysis) && deepAnalysis.length > 0)
      ? deepAnalysis
      : (Array.isArray(aiFeedback?.deepAnalysis) ? aiFeedback.deepAnalysis : [])
  );
};

const getNormalizedAnswers = (result: any) => {
  const rawAnswers = result?.userAnswers || [];
  return Array.isArray(rawAnswers) ? rawAnswers.reduce((acc: any, curr: any) => {
    acc[String(curr.questionNumber)] = {
      status: curr.isCorrect ? 'correct' : curr.answer ? 'wrong' : 'unattempted',
      marked: curr.answer ?? null,
      correct: curr.correctAnswer || 'N/A',
    };
    return acc;
  }, {}) : {};
};

const getDisplayAccuracy = (result: any) => {
  const correct = Number(result?.correctCount) || 0;
  const wrong = Number(result?.wrongCount) || 0;
  const totalAttempted = correct + wrong;
  return totalAttempted > 0 
    ? ((correct / totalAttempted) * 100).toFixed(1) 
    : (result?.percentage || 0).toFixed(0);
};

const getDisplayScore = (result: any) => {
  const scoreFromResult = parseScore(result?.score);
  const scoreFromAnswers = Array.isArray(result?.userAnswers)
    ? result.userAnswers.reduce((sum: number, ans: any) => sum + (Number(ans?.marksAwarded) || 0), 0)
    : 0;
  const displayScore = scoreFromResult ?? scoreFromAnswers ?? 0;
  return typeof displayScore === 'number' && !isNaN(displayScore) ? displayScore : 0;
};

const getPieData = (result: any) => {
  const correct = Number(result?.correctCount) || 0;
  const wrong = Number(result?.wrongCount) || 0;
  return [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Wrong', value: wrong, color: '#ef4444' },
    { name: 'Skipped', value: Number(result?.unattemptedCount) || 0, color: '#3f3f46' },
  ];
};

export default function ResultScreen({ 
  result, aiFeedback, deepAnalysis, pollingAI, onBack, onReattempt 
}: ResultScreenProps) {
  const [localAiFeedback, setLocalAiFeedback] = useState(aiFeedback);
  const [localDeepAnalysis, setLocalDeepAnalysis] = useState(deepAnalysis);
  const [localPollingAI, setLocalPollingAI] = useState(pollingAI);

  // Update local state when props change
  useEffect(() => {
    setLocalAiFeedback(aiFeedback);
    setLocalDeepAnalysis(deepAnalysis);
    setLocalPollingAI(pollingAI);
  }, [aiFeedback, deepAnalysis, pollingAI]);

  // Clear AI feedback when polling starts to show loading state
  useEffect(() => {
    if (pollingAI) {
      setLocalAiFeedback(null);
      setLocalDeepAnalysis([]);
    }
  }, [pollingAI]);

  // Poll for AI feedback completion if still pending
  useEffect(() => {
    if (!result?.attemptId || !localPollingAI) return;

    const pollFeedback = async () => {
      try {
        const response = await fetch(`/api/mock-test/attempts/${result.attemptId}`);
        const data = await response.json();
        
        if (data.feedbackStatus === 'completed') {
          setLocalAiFeedback(data.aiFeedback);
          setLocalDeepAnalysis(data.deepAnalysis || []);
          setLocalPollingAI(false);
        } else if (data.feedbackStatus === 'failed') {
          setLocalPollingAI(false);
        }
      } catch (error) {
        console.error('Error polling feedback:', error);
      }
    };

    const interval = setInterval(pollFeedback, 3000);
    return () => clearInterval(interval);
  }, [result?.attemptId, localPollingAI]);

  const strengths = getStrengths(localAiFeedback);
  const weakAreas = getWeakAreas(localAiFeedback, result, strengths);
  const recommendations = getRecommendations(localAiFeedback);
  const finalDeepAnalysis = getFinalDeepAnalysis(localDeepAnalysis, localAiFeedback);
  const normalizedAnswers = getNormalizedAnswers(result);
  const displayAccuracy = getDisplayAccuracy(result);
  const displayScore = getDisplayScore(result);
  const scoreText = typeof displayScore === 'number' && !isNaN(displayScore)
    ? (Math.abs(displayScore) < 1 ? displayScore.toFixed(2) : displayScore.toFixed(1))
    : '0.0';
  const pieData = getPieData(result);

  return (
    <div className="min-h-screen bg-ink-950 overflow-y-auto p-6 md:p-12 pb-24 custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-ink-500 hover:text-ink-200 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <button onClick={onReattempt} className="flex items-center gap-2 px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-ink-950 font-bold rounded-xl transition-all shadow-lg shadow-saffron-500/20">
            <RefreshCcw className="w-4 h-4" /> Re-attempt Test
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-8 text-center border border-ink-800 bg-ink-900/40 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-saffron-500" />
              <p className="text-[10px] uppercase text-ink-500 font-bold">Net Score</p>
              <h1 className={clsx("text-7xl font-black my-4", displayScore < 0 ? "text-red-500" : "text-saffron-400")}>
                {scoreText}
              </h1>
              <div className="grid grid-cols-3 gap-2 border-t border-ink-800/50 pt-4 mt-2">
                <div><p className="text-[9px] text-ink-600 font-bold uppercase">Correct</p><p className="text-jade-400 font-bold">{Number(result?.correctCount) || 0}</p></div>
                <div><p className="text-[9px] text-ink-600 font-bold uppercase">Wrong</p><p className="text-red-400 font-bold">{Number(result?.wrongCount) || 0}</p></div>
                <div><p className="text-[9px] text-ink-600 font-bold uppercase">Accuracy</p><p className="text-white font-bold">{displayAccuracy}%</p></div>
              </div>
            </div>

            <div className="glass-card p-6 border border-ink-800 bg-ink-900/40 h-64 rounded-2xl">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: '#09090b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="glass-card p-8 border border-ink-800 bg-ink-900/40 rounded-3xl flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-saffron-500/10 rounded-2xl border border-saffron-500/20"><Brain className="w-6 h-6 text-saffron-400" /></div>
                  <div>
                    <h2 className="text-2xl font-bold text-ink-100 tracking-tight">{localAiFeedback?.headline || "ARJUN Analysis"}</h2>
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">AI-Driven Insights</p>
                  </div>
                </div>
                {localPollingAI && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-ink-950 rounded-full border border-ink-800">
                    <Loader2 className="w-3 h-3 animate-spin text-saffron-500" />
                    <span className="text-[10px] text-ink-400 font-bold">ARJUN is analyzing your test...</span>
                  </div>
                )}
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-jade-500/5 border border-jade-500/10 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3 text-jade-400 text-xs font-bold uppercase"><CheckCircle2 className="w-4 h-4" /> Strengths</div>
                    <div className="space-y-2">
                      {strengths.length > 0 ? strengths.map((s: string, i: number) => (
                        <p key={i} className="text-[11px] text-ink-200">• {s}</p>
                      )) : <p className="text-[11px] text-ink-600 italic">Identifying your strong points...</p>}
                    </div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3 text-red-400 text-xs font-bold uppercase"><AlertTriangle className="w-4 h-4" /> Weak Areas</div>
                    <div className="space-y-2">
                      {weakAreas.length > 0 ? weakAreas.map((w: string, i: number) => (
                        <p key={i} className="text-[11px] text-ink-200">• {w}</p>
                      )) : <p className="text-[11px] text-ink-600 italic">Great! No major weak areas found.</p>}
                    </div>
                  </div>
                </div>

                {finalDeepAnalysis.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-saffron-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                      <Sparkles className="w-4 h-4" /> Specific Concept Corrections
                    </h3>
                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {finalDeepAnalysis.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-ink-950/50 rounded-xl border border-ink-800 hover:border-saffron-500/30 transition-all group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Q.{item.qNo}</span>
                            <span className="text-[10px] text-ink-500 font-mono group-hover:text-saffron-400 transition-colors">{item.topic}</span>
                          </div>
                          <p className="text-[12px] text-ink-100 font-medium mb-1 line-clamp-1 opacity-60">{item.questionText}</p>
                          <p className="text-[13px] text-ink-300 leading-relaxed border-l-2 border-saffron-500/20 pl-3">{item.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-ink-950/50 p-6 rounded-2xl border border-ink-800 mt-6">
                  <div className="flex items-center gap-2 mb-3 text-saffron-400 text-xs font-bold uppercase"><Lightbulb className="w-4 h-4" /> Mentor Strategy</div>
                  {recommendations.map((text: string, idx: number) => (
                    <p key={idx} className="text-sm text-ink-300 leading-relaxed italic mb-1">"{text}"</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <QuestionGrid userAnswers={normalizedAnswers} />
      </div>
    </div>
  );
}