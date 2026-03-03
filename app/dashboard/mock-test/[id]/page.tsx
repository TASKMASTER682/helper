'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { mockTestAPI } from '@/lib/api';
import ResultScreen from '../../../../componets/ResultScreen';
import { Loader2, LayoutGrid, X, Clock } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// 1. Dynamic Import to fix 'canvas' build error
const PDFViewerComponent = dynamic(() => import('../../../../componets/PDFViewerComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-ink-950">
      <Loader2 className="animate-spin text-yellow-400 w-10 h-10 mb-4" />
      <p className="text-ink-500 animate-pulse font-mono text-sm tracking-widest uppercase">DECRYPTING EXAM PROTOCOL...</p>
    </div>
  )
});

type Answer = 'A' | 'B' | 'C' | 'D' | null;
type ExamState = 'exam' | 'submitting' | 'result';

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewAttemptId = searchParams.get('viewAttempt');
  const customTimeParam = searchParams.get('customTime');
  const forceStart = searchParams.get('force') === 'true';

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examState, setExamState] = useState<ExamState>('exam');
  const [currentQ, setCurrentQ] = useState(1);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptResult, setAttemptResult] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<any>(null);
  const [pollingAI, setPollingAI] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const submitExamRef = useRef<() => void>(() => { });

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          submitExamRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startFeedbackPolling = useCallback((attemptId: string) => {
    if (!attemptId) return;
    stopPolling();
    setPollingAI(true);

    const pollOnce = async () => {
      try {
        const { data: latest } = await mockTestAPI.getAttempt(attemptId);
        setAttemptResult(latest);

        if (latest?.aiFeedback) {
          setAiFeedback(latest.aiFeedback);
        }

        const deep = Array.isArray(latest?.deepAnalysis) && latest.deepAnalysis.length > 0
          ? latest.deepAnalysis
          : (Array.isArray(latest?.aiFeedback?.deepAnalysis) ? latest.aiFeedback.deepAnalysis : []);
        setDeepAnalysis(deep);

        if (latest?.feedbackStatus === 'completed' || latest?.feedbackStatus === 'failed') {
          setPollingAI(false);
          stopPolling();
          if (latest?.feedbackStatus === 'failed') {
            toast.error('AI analysis failed for this attempt.');
          }
        }
      } catch (err) {
        console.error('Feedback polling error:', err);
      }
    };

    void pollOnce();
    pollingRef.current = setInterval(() => {
      void pollOnce();
    }, 3000);
  }, [stopPolling]);

  const initPage = useCallback(async () => {
    try {
      stopPolling();
      setPollingAI(false);
      setLoading(true);
      const { data: testData } = await mockTestAPI.getOne(id);
      setTest(testData);

      // Attempt logic same as your code...
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

      const finalMinutes = customTimeParam ? parseInt(customTimeParam) : (testData.durationMinutes || 120);
      const initialTime = finalMinutes * 60;
      console.log('Setting timeLeft to:', initialTime, 'minutes:', finalMinutes);
      setTimeLeft(initialTime);
      setExamState('exam');

      // Start timer immediately
      console.log('Starting timer with timeLeft:', initialTime);
      startTimer();
    } catch (err) {
      console.error(err);
      toast.error('Could not load test');
    } finally {
      setLoading(false);
    }
  }, [id, startTimer, viewAttemptId, customTimeParam, forceStart, startFeedbackPolling, stopPolling]);

  useEffect(() => {
    initPage();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id, viewAttemptId, customTimeParam, forceStart]);

  // Separate useEffect for timer initialization when examState and timeLeft are set
  useEffect(() => {
    if (examState === 'exam' && timeLeft > 0 && !timerRef.current) {
      console.log('Timer initialization triggered by useEffect - examState:', examState, 'timeLeft:', timeLeft);
      startTimer();
    }
  }, [examState, timeLeft, startTimer]);

  const submitExam = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamState('submitting');
    try {
      const userAnswers: Record<string, string | null> = {};
      for (let i = 1; i <= (test?.totalQuestions || 100); i++) {
        userAnswers[String(i)] = answers[i] ?? null;
      }
      const { data } = await mockTestAPI.submitAttempt(id, { userAnswers, timeTakenMinutes: 10 });
      setAttemptResult(data);
      setAiFeedback(null);
      setDeepAnalysis([]);
      setExamState('result');
      if (data?.attemptId) {
        startFeedbackPolling(data.attemptId);
      } else {
        setPollingAI(false);
      }
    } catch (err) {
      toast.error('Submission failed');
      setExamState('exam');
    }
  }, [test, answers, id, startFeedbackPolling]);

  useEffect(() => {
    submitExamRef.current = () => { void submitExam(); };
  }, [submitExam]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-ink-950"><Loader2 className="animate-spin text-yellow-400 w-10 h-10" /></div>;

  if (examState === 'result') return (
    <ResultScreen
      result={attemptResult}
      aiFeedback={aiFeedback}
      deepAnalysis={deepAnalysis}
      onBack={() => router.push('/dashboard/mock-test')}
      onReattempt={() => router.push('/dashboard/mock-test')}
      pollingAI={pollingAI}
      testId={id as string}
    />
  );

  if (examState === 'submitting') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink-950 p-6 text-center text-white">
      <Loader2 className="w-16 h-16 animate-spin text-yellow-400 mb-6" />
      <h2 className="text-2xl font-bold">ARJUN AI is evaluating...</h2>
    </div>
  );

  return (
    <div className="relative h-screen w-full bg-ink-950 flex flex-col overflow-hidden">
      {/* Header same as your code */}
      <div className="h-14 shrink-0 flex items-center justify-between px-4 md:px-6 bg-ink-900 border-b border-ink-800 z-50">
        <div className="flex items-center gap-2 overflow-hidden max-w-[50%]">
          <span className="font-bold text-ink-100 truncate text-sm md:text-base">{test?.name}</span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <div className={clsx('px-3 py-1 rounded-full border font-mono font-bold text-xs md:text-sm flex items-center gap-2',
            timeLeft < 300 ? 'border-red-500 bg-red-500/10 text-red-400 animate-pulse' : 'border-yellow-500 bg-yellow-500/10 text-yellow-400')}>
            <Clock className="w-3 h-3" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
          <button onClick={() => setShowConfirm(true)} className="bg-teal-600 hover:bg-teal-500 text-ink-950 px-4 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95">Submit</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col bg-ink-950 h-full overflow-hidden relative" onClick={() => setIsPanelOpen(false)}>
          {/* REPLACE IFRAME WITH DYNAMIC COMPONENT */}
          <PDFViewerComponent testId={id as string} />
        </div>

        {/* Right Panel / Sidebar same as your code */}
        <div className={clsx(
          "fixed md:relative inset-y-0 right-0 z-100 w-96 md:w-80 bg-ink-950 border-l border-ink-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 shadow-2xl md:shadow-none",
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* ... (Your OMR panel logic) */}
          <div className="h-full flex flex-col pt-14 md:pt-0 bg-black">
            <div className="p-4 border-b border-ink-800 bg-ink-900/50">
              <div className="bg-ink-950 p-4 rounded-xl border border-ink-800 shadow-inner">
                <p className="text-[10px] text-ink-500 mb-3 font-bold uppercase tracking-widest text-center">Active Question: {currentQ}</p>
                <div className="grid grid-cols-2 gap-2">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [currentQ]: prev[currentQ] === opt ? null : opt as Answer }))}
                      className={clsx('py-3 rounded-lg border-2 font-bold transition-all', answers[currentQ] === opt ? 'border-blue-500 bg-blue-600 text-white' : 'border-ink-800 text-ink-400 hover:border-ink-600')}
                    > {opt} </button>
                  ))}                 </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-2 content-start custom-scrollbar">
              {Array.from({ length: test?.totalQuestions || 100 }, (_, i) => i + 1).map(qNum => (
                <button key={qNum} onClick={() => setCurrentQ(qNum)}
                  className={clsx('aspect-square rounded-lg text-xs font-mono border-2 transition-all', currentQ === qNum ? 'border-white bg-ink-800 text-white scale-110 z-10' : !!answers[qNum] ? 'border-yellow-500 bg-yellow-500 text-ink-950 font-bold' : 'border-ink-800 text-ink-600 hover:border-ink-700')}
                > {qNum} </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setIsPanelOpen(!isPanelOpen)} className={clsx("md:hidden fixed bottom-6 right-6 z-110 w-14 h-14 rounded-full flex items-center justify-center transition-all", isPanelOpen ? "bg-red-500 rotate-90" : "bg-yellow-500")}>
          {isPanelOpen ? <X className="text-white w-6 h-6" /> : <LayoutGrid className="text-ink-950 w-6 h-6" />}
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-ink-950/90 backdrop-blur-md z-120 flex items-center justify-center p-4">
          <div className="bg-black p-8 max-w-sm w-full border border-ink-800 rounded-3xl shadow-2xl">
            <h2 className="text-xl font-bold text-center text-ink-100 mb-2">Submit Exam?</h2>
            <p className="text-ink-500 text-sm text-center mb-6">You have answered <span className="text-yellow-400 font-bold">{Object.values(answers).filter(v => v !== null).length}</span> questions.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowConfirm(false)} className="py-3 rounded-xl bg-ink-800 text-ink-200 font-bold hover:bg-ink-700">Review</button>
              <button onClick={submitExam} className="py-3 rounded-xl bg-yellow-500 text-ink-950 font-bold hover:bg-yellow-400">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

