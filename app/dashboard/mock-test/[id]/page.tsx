'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { mockTestAPI } from '@/lib/api';
import ResultScreen from '../../../../componets/ResultScreen';
import {
  Clock, ChevronLeft, ChevronRight, BookmarkPlus, Trash2,
  LayoutGrid, X, Loader2, CheckCircle2, AlertCircle, Send, Eye
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import PDF viewer (client-only, no SSR)
const PDFViewerComponent = dynamic(() => import('../../../../componets/PDFViewerComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-ink-950">
      <Loader2 className="animate-spin text-yellow-400 w-10 h-10 mb-4" />
      <p className="text-ink-500 animate-pulse font-mono text-sm tracking-widest uppercase">DECRYPTING EXAM PROTOCOL...</p>
    </div>
  )
});

// ─── Types ──────────────────────────────────────────────────────────────────
type Answer = 'A' | 'B' | 'C' | 'D' | null;
type QStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-marked';
type ExamState = 'exam' | 'submitting' | 'result';

interface Question {
  _id: string;
  questionNumber: number;
  text: string;
  options: { a: string; b: string; c: string; d: string };
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;
const OPTION_MAP: Record<string, 'a' | 'b' | 'c' | 'd'> = { A: 'a', B: 'b', C: 'c', D: 'd' };

// ─── Status Legend Config ────────────────────────────────────────────────────
const STATUS_CFG = {
  'not-visited': { label: 'Not Visited', bg: 'bg-ink-700', text: 'text-ink-300', dot: 'bg-ink-600' },
  'not-answered': { label: 'Not Answered', bg: 'bg-red-500/20 border border-red-500/40', text: 'text-red-400', dot: 'bg-red-500' },
  'answered': { label: 'Answered', bg: 'bg-teal-500/20 border border-teal-500/40', text: 'text-teal-300', dot: 'bg-teal-500' },
  'marked': { label: 'Marked for Review', bg: 'bg-purple-500/20 border border-purple-500/40', text: 'text-purple-300', dot: 'bg-purple-500' },
  'answered-marked': { label: 'Answered & Marked', bg: 'bg-purple-500/20 border border-teal-500/40', text: 'text-teal-300', dot: 'bg-purple-500' },
};

// ─── Helper ──────────────────────────────────────────────────────────────────
const fmt = (s: number) => `${Math.floor(s / 3600) > 0 ? Math.floor(s / 3600) + ':' : ''}${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewAttemptId = searchParams.get('viewAttempt');
  const customTimeParam = searchParams.get('customTime');

  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [examState, setExamState] = useState<ExamState>('exam');
  const [currentIdx, setCurrentIdx] = useState(0); // 0-indexed
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [statuses, setStatuses] = useState<Record<number, QStatus>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [timeLeft, setTimeLeft] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<any>(null);
  const [pollingAI, setPollingAI] = useState(false);
  // PDF mode state
  const [isPdfPanelOpen, setIsPdfPanelOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const submitRef = useRef<() => void>(() => { });

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalQ = questions.length || test?.totalQuestions || 0;
  const currentQ = questions[currentIdx];
  const currentQNum = currentQ?.questionNumber ?? currentIdx + 1;
  const currentAnswer = answers[currentQNum] ?? null;

  const computeStatuses = useCallback(() => {
    const s: Record<number, QStatus> = {};
    for (let i = 1; i <= totalQ; i++) {
      const isVisited = visited.has(i);
      const hasAnswer = !!answers[i];
      const isMarked = marked.has(i);
      if (!isVisited) s[i] = 'not-visited';
      else if (hasAnswer && isMarked) s[i] = 'answered-marked';
      else if (hasAnswer) s[i] = 'answered';
      else if (isMarked) s[i] = 'marked';
      else s[i] = 'not-answered';
    }
    return s;
  }, [answers, marked, visited, totalQ]);

  useEffect(() => {
    setStatuses(computeStatuses());
  }, [computeStatuses]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); submitRef.current(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Feedback polling ───────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  const startFeedbackPolling = useCallback((attemptId: string) => {
    if (!attemptId) return;
    stopPolling();
    setPollingAI(true);
    const poll = async () => {
      try {
        const { data } = await mockTestAPI.getAttempt(attemptId);
        setAttemptResult(data);
        if (data?.aiFeedback) setAiFeedback(data.aiFeedback);
        const deep = Array.isArray(data?.deepAnalysis) && data.deepAnalysis.length > 0 ? data.deepAnalysis : (Array.isArray(data?.aiFeedback?.deepAnalysis) ? data.aiFeedback.deepAnalysis : []);
        setDeepAnalysis(deep);
        if (data?.feedbackStatus === 'completed' || data?.feedbackStatus === 'failed') {
          setPollingAI(false); stopPolling();
          if (data?.feedbackStatus === 'failed') toast.error('AI analysis failed.');
        }
      } catch { }
    };
    void poll();
    pollingRef.current = setInterval(poll, 3000);
  }, [stopPolling]);

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        stopPolling();
        setLoading(true);
        const { data: testData } = await mockTestAPI.getOne(id);
        setTest(testData);

        // Viewing a past attempt
        if (viewAttemptId) {
          const { data: allAttempts } = await mockTestAPI.getAllAttempts();
          const target = allAttempts.find((a: any) => a._id === viewAttemptId);
          if (target) {
            setAttemptResult(target);
            setAiFeedback(target.aiFeedback);
            setDeepAnalysis(target.deepAnalysis || []);
            setExamState('result');
            if (target?.feedbackStatus === 'pending' || target?.feedbackStatus === 'generating') {
              startFeedbackPolling(target._id);
            }
            setLoading(false);
            return;
          }
        }

        // Set questions (structured mode has populated structuredQuestions)
        if (Array.isArray(testData.structuredQuestions) && testData.structuredQuestions.length > 0) {
          const qs = testData.structuredQuestions.map((q: any) => ({
            _id: q._id,
            questionNumber: q.questionNumber,
            text: q.text,
            options: q.options,
          }));
          qs.sort((a: Question, b: Question) => a.questionNumber - b.questionNumber);
          setQuestions(qs);
          setVisited(new Set([qs[0]?.questionNumber ?? 1]));
        }

        const finalMinutes = customTimeParam ? parseInt(customTimeParam) : (testData.durationMinutes || 120);
        setTimeLeft(finalMinutes * 60);
        setExamState('exam');
        startTimer();
      } catch (err) {
        toast.error('Could not load test');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id, viewAttemptId, customTimeParam]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const submitExam = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamState('submitting');
    try {
      const userAnswers: Record<string, string | null> = {};
      for (let i = 1; i <= totalQ; i++) {
        userAnswers[String(i)] = answers[i] ?? null;
      }
      const timeTaken = Math.round((test?.durationMinutes ?? 120) - timeLeft / 60);
      const { data } = await mockTestAPI.submitAttempt(id, { userAnswers, timeTakenMinutes: timeTaken });
      setAttemptResult(data);
      setAiFeedback(null);
      setDeepAnalysis([]);
      setExamState('result');
      if (data?.attemptId) startFeedbackPolling(data.attemptId);
      else setPollingAI(false);
    } catch {
      toast.error('Submission failed');
      setExamState('exam');
    }
  }, [test, answers, id, timeLeft, totalQ, startFeedbackPolling]);

  useEffect(() => { submitRef.current = () => void submitExam(); }, [submitExam]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goToQuestion = (idx: number) => {
    const qNum = questions[idx]?.questionNumber ?? idx + 1;
    setVisited(prev => new Set([...prev, qNum]));
    // Mark current as not-answered if visited but no answer
    setCurrentIdx(idx);
    setSidebarOpen(false);
  };

  const handleOptionSelect = (opt: typeof OPTION_KEYS[number]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQNum]: prev[currentQNum] === opt ? null : opt
    }));
  };

  const handleMarkForReview = () => {
    setMarked(prev => {
      const next = new Set(prev);
      if (next.has(currentQNum)) next.delete(currentQNum);
      else next.add(currentQNum);
      return next;
    });
  };

  const handleClearResponse = () => {
    setAnswers(prev => ({ ...prev, [currentQNum]: null }));
  };

  const handleNextSave = () => {
    if (currentIdx < totalQ - 1) goToQuestion(currentIdx + 1);
  };

  // ── States summary ─────────────────────────────────────────────────────────
  const answered = Object.values(answers).filter(Boolean).length;
  const notAnswered = [...visited].filter(q => !answers[q]).length;
  const markedCount = marked.size;
  const notVisited = totalQ - visited.size;

  // ── Render guards ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-950">
      <Loader2 className="animate-spin text-yellow-400 w-10 h-10 mb-4" />
      <p className="text-ink-500 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Exam...</p>
    </div>
  );

  if (examState === 'result') return (
    <ResultScreen
      result={attemptResult}
      testMode={test?.mode}
      aiFeedback={aiFeedback}
      deepAnalysis={deepAnalysis}
      onBack={() => router.push('/dashboard/mock-test')}
      onReattempt={() => router.push('/dashboard/mock-test')}
      pollingAI={pollingAI}
      testId={id as string}
    />
  );

  if (examState === 'submitting') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-950 gap-6">
      <Loader2 className="w-16 h-16 animate-spin text-yellow-400" />
      <h2 className="text-2xl font-bold text-ink-100">Submitting & Evaluating...</h2>
      <p className="text-ink-500 text-sm">Arjun AI is Analysing Your Performance</p>
    </div>
  );

  const isLastQ = currentIdx === totalQ - 1;
  const isMarkedCurrent = marked.has(currentQNum);

  // ── PDF mode: render classic split view ───────────────────────────────────
  if (test?.mode === 'pdf') {
    return (
      <div className="relative h-screen w-full bg-ink-950 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 bg-ink-900 border-b border-ink-800 z-50">
          <div className="flex items-center gap-2 overflow-hidden max-w-[50%]">
            <span className="font-bold text-teal-100 truncate text-sm md:text-base">{test?.name}</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className={clsx('px-3 py-1 rounded-full border font-mono font-bold text-xs md:text-sm flex items-center gap-2',
              timeLeft < 300 ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' : 'border-yellow-500 bg-yellow-500/10 text-yellow-400')}>
              <Clock className="w-3 h-3" />
              {fmt(timeLeft)}
            </div>
            <button onClick={() => setShowConfirm(true)} className="bg-teal-600 hover:bg-teal-500 text-ink-950 px-4 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95">
              Submit
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
          {/* PDF area */}
          <div className="flex-1 flex flex-col bg-ink-950 h-full overflow-hidden relative" onClick={() => setIsPdfPanelOpen(false)}>
            <PDFViewerComponent testId={id as string} />
          </div>

          {/* OMR Sidebar */}
          <div className={clsx(
            'fixed md:relative inset-y-0 right-0 z-40 w-80 bg-ink-950 border-l border-ink-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none',
            isPdfPanelOpen ? 'translate-x-0' : 'translate-x-full'
          )}>
            <div className="h-full flex flex-col pt-14 md:pt-0 bg-black">
              {/* Current Q answer input */}
              <div className="p-4 border-b border-ink-800 bg-ink-900/50">
                <div className="bg-ink-950 p-4 rounded-xl border border-ink-800 shadow-inner">
                  <p className="text-[10px] text-ink-500 mb-3 font-bold uppercase tracking-widest text-center">Active Question: {currentIdx + 1}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                      <button key={opt}
                        onClick={() => setAnswers(prev => ({ ...prev, [currentIdx + 1]: prev[currentIdx + 1] === opt ? null : opt }))}
                        className={clsx('py-3 rounded-lg border-2 font-bold transition-all',
                          answers[currentIdx + 1] === opt
                            ? 'border-blue-500 bg-blue-600 text-white'
                            : 'border-ink-800 text-ink-400 hover:border-ink-600'
                        )}
                      >{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Question grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-2 content-start custom-scrollbar">
                {Array.from({ length: test?.totalQuestions || 100 }, (_, i) => i + 1).map(qNum => (
                  <button key={qNum}
                    onClick={() => { setCurrentIdx(qNum - 1); setIsPdfPanelOpen(false); }}
                    className={clsx('aspect-square rounded-lg text-xs font-mono border-2 transition-all',
                      currentIdx + 1 === qNum
                        ? 'border-white bg-ink-800 text-white scale-110 z-10'
                        : !!answers[qNum]
                          ? 'border-yellow-500 bg-yellow-500 text-ink-950 font-bold'
                          : 'border-ink-800 text-ink-600 hover:border-ink-700'
                    )}
                  >{qNum}</button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPdfPanelOpen(!isPdfPanelOpen)}
            className={clsx('md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all',
              isPdfPanelOpen ? 'bg-red-500 rotate-90' : 'bg-yellow-500'
            )}
          >
            {isPdfPanelOpen ? <X className="text-white w-6 h-6" /> : <LayoutGrid className="text-ink-950 w-6 h-6" />}
          </button>
        </div>

        {/* Confirm dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-ink-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-black p-8 max-w-sm w-full border border-ink-800 rounded-3xl shadow-2xl">
              <h2 className="text-xl font-bold text-center text-ink-100 mb-2">Submit Exam?</h2>
              <p className="text-ink-500 text-sm text-center mb-6">You have answered <span className="text-yellow-400 font-bold">{Object.values(answers).filter(Boolean).length}</span> questions.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowConfirm(false)} className="py-3 rounded-xl bg-ink-800 text-ink-200 font-bold hover:bg-ink-700">Review</button>
                <button onClick={() => { setShowConfirm(false); void submitExam(); }} className="py-3 rounded-xl bg-yellow-500 text-ink-950 font-bold hover:bg-yellow-400">Submit</button>
              </div>
            </div>
          </div>
        )}
        <style>{`.custom-scrollbar::-webkit-scrollbar{width:4px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#2d2820;border-radius:10px}`}</style>
      </div>
    );
  }

  // ── Structured CBT mode below ───────────────────────────────────────────────
  return (
    <div className="h-screen w-full bg-[#0d0d0f] flex flex-col overflow-hidden font-sans">

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 bg-[#111114] border-b border-ink-800/60 z-50 gap-4">
        {/* Test name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
            <span className="text-yellow-400 text-[10px] font-black">Q</span>
          </div>
          <span className="font-bold text-ink-100 truncate text-sm hidden sm:block">{test?.name}</span>
          <span className="text-[10px] text-teal-500 font-mono shrink-0">{currentIdx + 1}/{totalQ}</span>
        </div>

        {/* Center: Stats */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-bold font-mono">
          <span className="flex items-center gap-1 text-teal-400"><CheckCircle2 className="w-3 h-3" />{answered} ANS</span>
          <span className="flex items-center gap-1 text-red-400"><AlertCircle className="w-3 h-3" />{notAnswered} SKIP</span>
          <span className="flex items-center gap-1 text-purple-400"><BookmarkPlus className="w-3 h-3" />{markedCount} MARK</span>
          <span className="flex items-center gap-1 text-ink-500"><Eye className="w-3 h-3" />{notVisited} LEFT</span>
        </div>

        {/* Right: Timer + Submit */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className={clsx('px-3 py-1.5 rounded-xl border font-mono font-black text-sm flex items-center gap-1.5 transition-all',
            timeLeft < 300 ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' :
              timeLeft < 600 ? 'border-orange-500 bg-orange-500/10 text-orange-400' :
                'border-yellow-500/40 bg-yellow-500/5 text-yellow-400')}>
            <Clock className="w-3.5 h-3.5" />
            {fmt(timeLeft)}
          </div>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="md:hidden p-2 rounded-lg bg-ink-800 text-ink-300"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-bold text-xs transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" /> Submit
          </button>
        </div>
      </header>

      {/* ── MAIN BODY ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── QUESTION AREA ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0f]">
          {/* Progress bar */}
          <div className="h-0.5 bg-ink-900 shrink-0">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-teal-500 transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
            />
          </div>

          {/* Question + Options */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-3xl mx-auto">

              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all',
                    isMarkedCurrent ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400')}>
                    {currentQNum}
                  </div>
                  <span className="text-[10px] text-ink-500 font-mono uppercase tracking-[0.15em]">Question {currentIdx + 1} of {totalQ}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isMarkedCurrent && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      MARKED
                    </span>
                  )}
                  {currentAnswer && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                      ANSWERED
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-8 p-6 bg-ink-900/40 rounded-2xl border border-yellow-500 shadow-inner">
                {currentQ?.text && /<[a-z][\s\S]*>/i.test(currentQ.text) ? (
                  <div className="text-ink-100 text-[15px] leading-relaxed font-medium ai-content" dangerouslySetInnerHTML={{ __html: currentQ.text }} />
                ) : (
                  <p className="text-ink-100 text-base leading-relaxed whitespace-pre-wrap font-medium">
                    {currentQ?.text || `Question ${currentQNum}`}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3 mb-8">
                {OPTION_KEYS.map((opt) => {
                  const optText = currentQ?.options?.[OPTION_MAP[opt]] || `Option ${opt}`;
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className={clsx(
                        'w-full text-left p-4 rounded-2xl border-2 flex items-start gap-4 transition-all duration-200 group',
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10'
                          : 'border-ink-800/60 bg-ink-900/20 hover:border-teal-600 hover:bg-ink-900/50'
                      )}
                    >
                      {/* Option bubble */}
                      <span className={clsx(
                        'w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-black text-sm border-2 transition-all',
                        isSelected
                          ? 'bg-yellow-500 border-yellow-500 text-teal-950'
                          : 'border-ink-700 text-ink-500 group-hover:border-teal-500 group-hover:text-ink-300'
                      )}>
                        {opt}
                      </span>
                      <span className={clsx(
                        'text-[14px] leading-relaxed pt-0.5 font-medium transition-colors',
                        isSelected ? 'text-ink-100' : 'text-ink-400 group-hover:text-ink-200'
                      )}>
                        {optText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkForReview}
                    className={clsx(
                      'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all',
                      isMarkedCurrent
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30'
                        : 'border-ink-700 text-ink-400 hover:border-purple-500/50 hover:text-purple-400'
                    )}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    {isMarkedCurrent ? 'Unmark' : 'Mark for Review'}
                  </button>
                  <button
                    onClick={handleClearResponse}
                    disabled={!currentAnswer}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-ink-700 text-ink-500 text-xs font-bold hover:text-red-400 hover:border-red-500/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>

                {/* Prev / Next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToQuestion(currentIdx - 1)}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-ink-700 text-ink-300 text-xs font-bold hover:bg-ink-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </button>
                  <button
                    onClick={isLastQ ? () => setShowConfirm(true) : handleNextSave}
                    className={clsx(
                      'flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95',
                      isLastQ
                        ? 'bg-yellow-500 hover:bg-yellow-400 text-ink-950'
                        : 'bg-teal-600 hover:bg-teal-500 text-white'
                    )}
                  >
                    {isLastQ ? <><Send className="w-3.5 h-3.5" /> Submit</> : <>Save & Next <ChevronRight className="w-3.5 h-3.5" /></>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR: Question Palette ── */}
        <aside className={clsx(
          'fixed md:relative inset-y-0 right-0 z-40 w-72 bg-[#111114] border-l border-ink-800/60 flex flex-col transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-ink-800/60 flex items-center justify-between shrink-0">
            <span className="font-bold text-ink-200 text-sm">Question Palette</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-ink-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Legend */}
          <div className="p-3 border-b border-ink-800/60 grid grid-cols-2 gap-1.5 shrink-0">
            {(Object.entries(STATUS_CFG) as [QStatus, typeof STATUS_CFG[QStatus]][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={clsx('w-2.5 h-2.5 rounded-sm shrink-0', cfg.dot)} />
                <span className="text-[9px] text-ink-500 font-medium">{cfg.label}</span>
              </div>
            ))}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 divide-x divide-ink-800/60 border-b border-ink-800/60 shrink-0">
            {[
              { val: answered, label: 'Ans', color: 'text-teal-400' },
              { val: notAnswered, label: 'Skip', color: 'text-red-400' },
              { val: markedCount, label: 'Mark', color: 'text-purple-400' },
              { val: notVisited, label: 'Left', color: 'text-ink-500' },
            ].map(({ val, label, color }) => (
              <div key={label} className="py-2 flex flex-col items-center">
                <span className={clsx('text-base font-black', color)}>{val}</span>
                <span className="text-[8px] font-bold text-ink-600 uppercase">{label}</span>
              </div>
            ))}
          </div>

          {/* Question Grid */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQ }, (_, i) => {
                const qNum = questions[i]?.questionNumber ?? i + 1;
                const status = statuses[qNum] || 'not-visited';
                const isCurrent = i === currentIdx;
                const cfg = STATUS_CFG[status];
                return (
                  <button
                    key={i}
                    onClick={() => goToQuestion(i)}
                    className={clsx(
                      'aspect-square rounded-xl text-xs font-bold transition-all relative',
                      cfg.bg, cfg.text,
                      isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-ink-900 scale-110 z-10' : 'hover:scale-105'
                    )}
                  >
                    {qNum}
                    {marked.has(qNum) && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-ink-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </aside>
      </div>

      {/* ── MOBILE SIDEBAR TOGGLE ─────────────────────────────────────────── */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-yellow-500 text-ink-950 shadow-lg shadow-yellow-500/30 flex items-center justify-center"
        >
          <LayoutGrid className="w-6 h-6" />
        </button>
      )}

      {/* ── CONFIRM SUBMIT DIALOG ─────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111114] border border-ink-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-ink-100 mb-1">Submit Exam?</h2>
              <p className="text-ink-500 text-sm">This action cannot be undone.</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[
                { val: answered, label: 'Answered', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
                { val: notAnswered, label: 'Skipped', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                { val: totalQ - answered - notAnswered, label: 'Not Visited', color: 'text-ink-400', bg: 'bg-ink-800/40 border-ink-700/40' },
              ].map(({ val, label, color, bg }) => (
                <div key={label} className={clsx('p-3 rounded-xl border text-center', bg)}>
                  <p className={clsx('text-2xl font-black', color)}>{val}</p>
                  <p className="text-[9px] text-ink-500 font-bold uppercase">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="py-3 rounded-xl border border-ink-700 text-ink-300 font-bold hover:bg-ink-800 transition-all"
              >
                Review
              </button>
              <button
                onClick={() => { setShowConfirm(false); void submitExam(); }}
                className="py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-bold transition-all"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2d2820; border-radius: 10px; }
      `}</style>
    </div>
  );
}
