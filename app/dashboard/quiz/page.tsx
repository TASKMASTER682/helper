'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { quizAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Zap, Loader2, Clock, CheckCircle2, XCircle, Brain, RotateCcw, Play, Settings } from 'lucide-react';
import clsx from 'clsx';

const SUBJECTS = [
  'Modern History', 'Ancient History', 'Medieval History', 'Art & Culture',
  'Physical Geography', 'Indian Geography', 'World Geography',
  'Polity', 'Economy', 'Environment & Ecology', 'Science & Technology',
  'IR And Mapping', 'Current Affairs', 'CSAT'
];

const QUESTION_TYPES = [
  { value: '', label: 'All Questions' },
  { value: 'pyq', label: 'PYQ Only' },
  { value: 'non-pyq', label: 'Non-PYQ Only' },
];

function QuizSetup({ onStart }: { onStart: (config: { count: number; subject: string; type: string }) => void }) {
  const [count, setCount] = useState(10);
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');

  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="parchment rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-7 h-7 text-crimson" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Rapid-Fire Quiz</h2>
          <p className="text-ink-mute text-sm mt-1">1 minute per question — answer anytime to advance</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="label-text">Number of Questions</label>
            <input type="range" min={5} max={30} value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="w-full accent-crimson mt-2" />
            <div className="flex justify-between text-xs text-ink-mute font-mono mt-1">
              <span>5</span>
              <span className="font-bold text-crimson text-lg">{count}</span>
              <span>30</span>
            </div>
          </div>

          <div>
            <label className="label-text">Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}
              className="input-field w-full">
              <option value="">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="label-text">Question Type</label>
            <div className="flex gap-2">
              {QUESTION_TYPES.map(qt => (
                <button key={qt.value}
                  onClick={() => setType(qt.value)}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border',
                    type === qt.value
                      ? 'bg-crimson text-cream border-crimson'
                      : 'bg-transparent text-ink-mute border-ink-600 hover:border-crimson/50'
                  )}>
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => onStart({ count, subject, type })}
            className="btn-primary w-full py-3.5 rounded-2xl mt-2 flex items-center justify-center gap-2 text-sm">
            <Play className="w-4 h-4" /> Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizSession({ config, onBack }: { config: { count: number; subject: string; type: string }; onBack: () => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadQuestions();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const clearTimers = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const loadQuestions = async () => {
    try {
      const { data } = await quizAPI.generate(config);
      if (!data.questions || data.questions.length === 0) {
        toast.error('No questions found for the given criteria');
        onBack();
        return;
      }
      setQuestions(data.questions);
    } catch {
      toast.error('Failed to load questions');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = useCallback(() => {
    clearTimers();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setTimeLeft(60);
    } else {
      setFinished(true);
    }
  }, [currentIdx, questions.length]);

  useEffect(() => {
    if (loading || finished || selectedAnswer) return;
    setTimeLeft(60);
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearTimers(); return 0; }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = setTimeout(() => { clearTimers(); nextQuestion(); }, 60000);
    return clearTimers;
  }, [currentIdx, loading, finished, selectedAnswer, nextQuestion]);

  const handleAnswer = (opt: string) => {
    if (selectedAnswer) return;
    clearTimers();
    setSelectedAnswer(opt);
    setAnswers(prev => ({ ...prev, [currentIdx]: opt }));
    setTimeout(nextQuestion, 400);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="w-10 h-10 text-crimson animate-spin" />
        <p className="text-ink-mute font-mono text-xs animate-pulse">Loading questions...</p>
      </div>
    );
  }

  if (finished) {
    const correct = questions.reduce((sum, q, i) => sum + (answers[i] === q.correctAnswer ? 1 : 0), 0);
    const unattempted = questions.reduce((sum, q, i) => sum + (answers[i] === undefined ? 1 : 0), 0);
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="parchment rounded-3xl p-8 text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-crimson/10 flex items-center justify-center mx-auto mb-4">
            {pct >= 50 ? <CheckCircle2 className="w-8 h-8 text-crimson" /> : <XCircle className="w-8 h-8 text-crimson" />}
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2">Quiz Complete</h2>
          <div className="text-5xl font-black text-crimson mb-4">{pct}%</div>
          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="text-teal font-bold">{correct} Correct</span>
            <span className="text-crimson font-bold">{total - correct - unattempted} Wrong</span>
            <span className="text-ink-mute">{unattempted} Skipped</span>
          </div>
          <div className="w-full bg-ink-600/30 rounded-full h-2 mt-6">
            <div className="h-full bg-crimson rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctAnswer;
            const labelMap: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };
            const correctLabel = q.options ? Object.entries(q.options).find(([, v]) => v === q.correctAnswer)?.[0] : '';
            const userAns = answers[i] || '—';
            return (
              <div key={i} className={clsx('parchment rounded-2xl p-5 text-left', isCorrect ? 'border-l-4 border-teal' : 'border-l-4 border-crimson')}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={clsx(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                    isCorrect ? 'bg-teal/10 text-teal' : 'bg-crimson/10 text-crimson'
                  )}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink font-medium leading-relaxed">{q.text}</p>
                    {q.subject && <span className="inline-block mt-1 text-[10px] text-ink-mute font-bold uppercase tracking-widest">{q.subject}</span>}
                  </div>
                </div>

                {q.options && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {Object.entries(q.options).map(([key, val]) => {
                      const letter = key.toUpperCase();
                      const isUserChoice = answers[i] === letter;
                      const isRight = letter === q.correctAnswer;
                      return (
                        <div key={key} className={clsx(
                          'px-3 py-2 rounded-xl text-xs border',
                          isRight ? 'border-teal bg-teal/5 text-teal font-bold' :
                          isUserChoice ? 'border-crimson bg-crimson/5 text-crimson font-bold' :
                          'border-ink-600/50 text-ink-mute'
                        )}>
                          <span className="font-bold mr-1">{letter}.</span> {String(val)}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs mb-2">
                  {isCorrect
                    ? <span className="text-teal font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Correct</span>
                    : <span className="text-crimson font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Wrong — Your answer: {userAns}</span>}
                </div>

                {q.explanation && (
                  <div className="mt-2 p-3 rounded-xl bg-ink-600/10 border border-ink-600/20">
                    <p className="text-[10px] font-bold text-ink-mute uppercase tracking-widest mb-1">Solution</p>
                    <p className="text-sm text-ink leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button onClick={onBack} className="btn-primary inline-flex items-center gap-2 py-3 px-8 rounded-2xl">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];
  const opts = q.options ? [q.options.a, q.options.b, q.options.c, q.options.d].filter(Boolean) : [];
  const labels = ['A', 'B', 'C', 'D'];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="parchment rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-ink-mute font-mono">{currentIdx + 1} / {questions.length}</span>
          <span className={clsx("flex items-center gap-1 text-xs font-bold font-mono", timeLeft <= 10 ? 'text-red-500' : 'text-crimson')}>
            <Clock className="w-3 h-3" /> {timeLeft}s
          </span>
        </div>
        <div className="w-full bg-ink-600/30 rounded-full h-1.5 mb-6">
          <div className="h-full bg-crimson rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mb-6">
          <p className="text-ink text-base md:text-lg font-medium leading-relaxed">{q.text}</p>
          {q.subject && <span className="inline-block mt-2 text-[10px] font-bold text-ink-mute uppercase tracking-widest px-2 py-1 bg-ink-600/20 rounded">{q.subject}</span>}
        </div>

        <div className="space-y-2">
          {opts.map((opt, i) => {
            const isSelected = selectedAnswer === labels[i];
            const isCorrectOpt = labels[i] === q.correctAnswer;
            let cls = 'border-ink-600 hover:border-crimson/40 hover:bg-crimson/5';
            if (selectedAnswer) {
              if (isCorrectOpt) cls = 'border-teal bg-teal/5';
              else if (isSelected) cls = 'border-crimson bg-crimson/5';
            }
            return (
              <button key={i} onClick={() => handleAnswer(labels[i])}
                disabled={!!selectedAnswer}
                className={clsx('w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3', cls)}>
                <span className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border',
                  selectedAnswer && isCorrectOpt ? 'bg-teal text-cream border-teal' :
                  isSelected ? 'bg-crimson text-cream border-crimson' :
                  'bg-transparent text-ink-mute border-ink-600'
                )}>
                  {selectedAnswer && isCorrectOpt ? <CheckCircle2 className="w-4 h-4" /> :
                   isSelected ? <XCircle className="w-4 h-4" /> : labels[i]}
                </span>
                <span className="text-ink text-sm">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [config, setConfig] = useState<{ count: number; subject: string; type: string } | null>(null);

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-crimson" />
          </div>
          <div>
            <h1 className="text-xl font-black text-ink uppercase tracking-tight">Rapid Quiz</h1>
            <p className="text-[10px] text-ink-mute font-mono uppercase tracking-widest">Quick Recall Training</p>
          </div>
        </div>

        {!config ? (
          <QuizSetup onStart={setConfig} />
        ) : (
          <QuizSession config={config} onBack={() => setConfig(null)} />
        )}
      </div>
    </div>
  );
}
