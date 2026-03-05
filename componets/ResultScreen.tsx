'use client';
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, Brain, Loader2, CheckCircle2,
  AlertTriangle, Sparkles, Lightbulb, RefreshCcw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import clsx from 'clsx';
import QuestionGrid from '@/componets/QuestionGrid';
import dynamic from 'next/dynamic';

const PDFViewerComponent = dynamic(() => import('@/componets/PDFViewerComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-ink-900 border border-ink-800 rounded-2xl">
      <Loader2 className="animate-spin text-yellow-500 w-6 h-6 mr-2" />
      <span className="text-ink-500 font-mono text-xs uppercase">Loading PDF...</span>
    </div>
  )
});

interface ResultScreenProps {
  result: any;
  testMode?: string;
  aiFeedback: any;
  deepAnalysis: any;
  pollingAI: boolean;
  testId: string;
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
  result, testMode, aiFeedback, deepAnalysis, pollingAI, testId, onBack, onReattempt
}: ResultScreenProps) {
  const [localAiFeedback, setLocalAiFeedback] = useState(aiFeedback);
  const [localDeepAnalysis, setLocalDeepAnalysis] = useState(deepAnalysis);
  const [localPollingAI, setLocalPollingAI] = useState(pollingAI);
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct' | 'skipped'>('wrong');

  const isStructured = testMode === 'structured';

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

  const filteredAnswers = result?.userAnswers?.filter((a: any) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'correct') return a.isCorrect;
    if (filterMode === 'wrong') return !a.isCorrect && a.answer;
    if (filterMode === 'skipped') return !a.answer;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-ink-950 overflow-y-auto p-4 md:p-8 pb-32 custom-scrollbar">
      <div className="max-w-[1500px] mx-auto">
        {/* Top Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-ink-500 hover:text-ink-200 transition-colors font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            {localPollingAI && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-ink-900 rounded-lg border border-ink-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />
                <span className="text-[10px] text-ink-400 font-bold uppercase tracking-wider">ARJUN is analyzing...</span>
              </div>
            )}
            <button onClick={onReattempt} className="flex items-center text-black gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-ink-950 font-bold rounded-xl transition-all shadow-lg shadow-yellow-500/20">
              <RefreshCcw className="w-4 h-4 text-teal-600" /> Re-attempt Test
            </button>
          </div>
        </div>

        {/* Top Row: Score Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 glass-card p-8 text-center border border-teal-800 bg-ink-900/40 relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />
            <p className="text-[10px] uppercase text-teal-500 font-bold tracking-widest">Net Score</p>
            <h1 className={clsx("text-6xl font-black my-2", displayScore < 0 ? "text-red-500" : "text-yellow-400")}>
              {scoreText}
            </h1>
            <div className="flex justify-between border-t border-ink-800/50 pt-4 mt-2">
              <div><p className="text-[8px] text-ink-600 font-bold uppercase mb-1">Correct</p><p className="text-teal-400 font-black">{Number(result?.correctCount) || 0}</p></div>
              <div><p className="text-[8px] text-ink-600 font-bold uppercase mb-1">Wrong</p><p className="text-red-400 font-black">{Number(result?.wrongCount) || 0}</p></div>
              <div><p className="text-[8px] text-ink-600 font-bold uppercase mb-1">Accuracy</p><p className="text-white font-black">{displayAccuracy}%</p></div>
            </div>
          </div>

          <div className="lg:col-span-3 glass-card p-6 border border-teal-800 bg-ink-900/40 rounded-2xl flex items-center justify-center">
            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: '#09090b', border: 'none', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 ml-8">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-ink-400 font-bold uppercase">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Body Grid: Paper vs Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-start">

          {/* Left Column: PDF Viewer (Only if NOT structured) */}
          {!isStructured && (
            <div className="lg:col-span-10 lg:col-start-2 sticky top-4">
              <div className="glass-card border border-ink-800 bg-ink-900/40 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-ink-900/60 border-b border-ink-800 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-teal-400 uppercase tracking-[0.2em]">Question Paper</h3>
                  <span className="text-[9px] text-ink-600 font-mono">Reference View</span>
                </div>
                <div className="h-[800px] w-full bg-black">
                  <PDFViewerComponent testId={testId} />
                </div>
              </div>
              <p className="mt-4 text-[11px] text-teal-500 font-bold tracking-widest uppercase text-center">Refer to the PDF above to cross-check your mistakes</p>
            </div>
          )}

          {/* Right Column: Detailed Solutions & AI Analysis (Only if structured) */}
          {isStructured && (
            <div className="lg:col-span-12 space-y-6">
              <div className="glass-card p-6 md:p-8 border border-teal-800 bg-ink-900/40 rounded-3xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20"><Brain className="w-6 h-6 text-yellow-400" /></div>
                  <div>
                    <h2 className="text-xl font-bold text-teal-500 tracking-tight leading-tight">Digital Evaluation Report</h2>
                    <p className="text-[10px] text-teal-100 uppercase font-bold tracking-widest mt-1">Detailed Solutions & Analysis</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 bg-ink-950 p-1.5 rounded-xl border border-teal-800 flex-wrap">
                  {(['all', 'wrong', 'correct', 'skipped'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilterMode(tab)}
                      className={clsx(
                        "flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all",
                        filterMode === tab
                          ? (tab === 'wrong' ? 'bg-red-500 text-white' : tab === 'correct' ? 'bg-teal-500 text-white' : tab === 'skipped' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-ink-950')
                          : "text-ink-500 hover:text-ink-300 hover:bg-ink-900"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  <div className={clsx(
                    "grid gap-4 overflow-y-auto pr-2 custom-scrollbar",
                    isStructured ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 max-h-250" : "grid-cols-1 max-h-[800px]"
                  )}>
                    {filteredAnswers.map((item: any, idx: number) => {
                      const isSkipped = !item.answer;
                      const isCorrect = item.isCorrect;

                      const statusColor = isSkipped ? 'blue' : isCorrect ? 'teal' : 'red';

                      return (
                        <div key={idx} className={clsx(
                          "p-5 bg-ink-950/50 rounded-2xl border transition-all relative overflow-hidden flex flex-col",
                          `border-${statusColor}-500/20 hover:border-${statusColor}-500/40`
                        )}>
                          {/* Status bar top */}
                          <div className={`absolute top-0 left-0 w-full h-1 bg-${statusColor}-500/50`} />

                          <div className="flex items-start justify-between mb-4 mt-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={clsx("text-[10px] font-bold px-2.5 py-1 rounded-md", `bg-${statusColor}-500/10 text-${statusColor}-400 border border-${statusColor}-500/20`)}>
                                Q.{item.questionNumber}
                              </span>

                              {isSkipped ? (
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-ink-800 text-ink-400 rounded-md">SKIPPED</span>
                              ) : (
                                <>
                                  <span className={clsx("text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1",
                                    isCorrect ? "bg-teal-500/10 text-teal-400" : "bg-red-500/10 text-red-400"
                                  )}>
                                    Marked: <strong className="text-white ml-1">{item.answer}</strong>
                                  </span>
                                </>
                              )}

                              <span className="text-[10px] font-bold px-2.5 py-1 bg-ink-800 text-teal-400 rounded-md flex items-center gap-1 border border-ink-700">
                                Correct: <strong className="text-white ml-1">{item.correctAnswer}</strong>
                              </span>
                            </div>
                          </div>

                          {item.questionText && (
                            <div className="mb-4 p-4 bg-ink-900/30 rounded-xl border-2 border-yellow-800/50">
                              {/<[a-z][\s\S]*>/i.test(item.questionText) ? (
                                <div className="text-[14px] text-ink-200 leading-relaxed font-medium ai-content" dangerouslySetInnerHTML={{ __html: item.questionText }} />
                              ) : (
                                <p className="text-[14px] text-ink-200 leading-relaxed font-medium whitespace-pre-wrap">{item.questionText}</p>
                              )}
                            </div>
                          )}

                          <div className="mt-auto pt-4 border-t border-ink-800/50 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2 px-1">
                              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                              <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Detailed Solution</p>
                            </div>
                            <div className="text-[13px] text-ink-200 leading-relaxed bg-black/40 p-4 rounded-xl border border-ink-800/60 whitespace-pre-wrap overflow-y-auto custom-scrollbar shadow-inner" style={{ maxHeight: '180px' }}>
                              {item.explanation || <span className="text-ink-600 italic">No detailed explanation available.</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredAnswers.length === 0 && (
                      <div className={clsx("text-center py-16 border border-dashed border-ink-800 rounded-3xl", isStructured && "col-span-full")}>
                        <Lightbulb className="w-12 h-12 text-ink-600 mx-auto mb-4 opacity-50" />
                        <p className="text-ink-400 font-bold text-sm">No questions in this category</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section: Question Grid */}
        <div className="mt-12">
          <h3 className="text-ink-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-6 text-center">Grid Response Overview</h3>
          <QuestionGrid userAnswers={normalizedAnswers} />
        </div>
      </div>
    </div>
  );
}