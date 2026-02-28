
'use client';
import { useState, useRef, useEffect } from 'react';
import { mentorAPI } from '@/lib/api';
import { 
  Brain, Send, User, RefreshCw, TrendingUp, 
  AlertTriangle, CheckCircle2, ChevronDown, LayoutPanelLeft 
} from 'lucide-react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "How am I doing this week?",
  "I'm feeling burnt out. What should I do?",
  "I keep avoiding Economy. Help!",
  "Evaluate my preparation strategy",
  "I failed a mock test. What now?",
  "Give me a motivational reality check",
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I'm ARJUN — your UPSC mentor. I'm here to make decisions for your preparation, not just answer questions.\n\nWhat's on your mind today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false); // Mobile toggle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg?: string) => {
    const text = msg || input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setShowPrompts(false); // Close mobile prompts on selection

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await mentorAPI.chat({ message: text, conversationHistory: history });
      const aiMsg: Message = { role: 'assistant', content: data.response, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        role: 'assistant',
        content: 'Connection issue. Your preparation cannot afford distractions — keep studying!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyReport = async () => {
    try {
      const { data } = await mentorAPI.weeklyReport();
      setWeeklyReport(data);
      setShowReport(true);
    } catch {
      console.error('Failed to load report');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)] lg:h-[calc(100vh-7rem)] animate-fade-in relative">
<div className="flex-1 flex flex-col glass-card overflow-hidden h-full">
<div className="p-4 border-b border-ink-700/50 flex items-center justify-between gap-3 bg-ink-950/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-600 to-deep-800 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-500 rounded-full border-2 border-ink-900 animate-pulse-slow" />
            </div>
            <div>
              <h2 className="font-display text-sm lg:text-base font-bold text-ink-100">ARJUN</h2>
              <p className="text-[10px] font-mono text-teal-400 uppercase tracking-wider">AI Mentor · Online</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowPrompts(!showPrompts)} 
              className="lg:hidden p-2 rounded-lg bg-ink-800 text-ink-300"
            >
              <LayoutPanelLeft className="w-4 h-4" />
            </button>
            <button onClick={loadWeeklyReport} className="btn-ghost text-[10px] lg:text-xs flex items-center gap-1.5 px-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Weekly Report</span>
            </button>
          </div>
        </div>
<div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={clsx('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                msg.role === 'user' ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-deep-600/30 border border-deep-500/30'
              )}>
                {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-yellow-400" /> : <Brain className="w-3.5 h-3.5 text-deep-400" />}
              </div>
              <div className={clsx('max-w-[85%] lg:max-w-[75%] rounded-xl p-3.5', 
                msg.role === 'user' ? 'bg-yellow-900/30 border border-yellow-700/30' : 'bg-ink-800/60 border border-ink-700/30'
              )}>
                <p className="text-sm text-ink-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className="text-[10px] font-mono text-ink-600 mt-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-deep-600/30 border border-deep-500/30 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-deep-400" />
              </div>
              <div className="bg-ink-800/60 border border-ink-700/30 rounded-xl p-3.5">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-deep-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
<div className="p-4 border-t border-ink-700/50 bg-ink-950/50">
          <div className="flex gap-2 max-w-4xl mx-auto w-full">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Talk to ARJUN..."
              className="input-field flex-1 text-sm bg-ink-900"
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="btn-primary p-3 disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
<div className={clsx(
        "fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-0 lg:w-72 flex flex-col gap-4 p-4 lg:p-0 transition-transform duration-300",
        showPrompts ? "translate-y-0" : "translate-y-full lg:translate-y-0"
      )}>
<div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm lg:hidden -z-10" 
          onClick={() => setShowPrompts(false)} 
        />
<div className="mt-auto lg:mt-0 bg-ink-950 lg:bg-transparent rounded-t-3xl lg:rounded-none p-6 lg:p-0 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="w-12 h-1 bg-ink-700 rounded-full mx-auto mb-4 lg:hidden" />
<div className="glass-card p-4 border-ink-700/50 shadow-2xl lg:shadow-none">
            <h3 className="text-[10px] font-mono text-ink-500 uppercase tracking-wider mb-3">Quick Consult</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="text-left text-[11px] text-ink-300 hover:text-yellow-400 hover:bg-yellow-500/5 border border-ink-800 hover:border-yellow-500/30 rounded-lg p-2.5 transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
{showReport && weeklyReport && (
            <div className="glass-card p-4 space-y-3 animate-slide-up border-teal-500/30">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-mono text-teal-500 uppercase tracking-wider">Weekly Performance</h3>
                <button onClick={() => setShowReport(false)} className="text-ink-500 hover:text-ink-100 text-xs p-1">✕</button>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/20 p-3 rounded-xl">
                <p className="text-xs font-semibold text-teal-300">{weeklyReport.headline}</p>
              </div>
<div className="space-y-3">
                <div className="text-[10px] font-mono text-teal-500 uppercase">Strengths</div>
                {weeklyReport.strengths?.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-ink-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
<div className="glass-card p-4 hidden sm:block">
            <h3 className="text-[10px] font-mono text-ink-500 uppercase tracking-wider mb-3">Core Philosophy</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {['Consistency > Intensity', 'Process over Fantasy', 'Habits build IAS'].map(p => (
                <div key={p} className="flex items-center gap-2 text-[10px] text-ink-400 bg-ink-900/50 px-2 py-1 rounded-md">
                  <div className="w-1 h-1 rounded-full bg-yellow-500" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


