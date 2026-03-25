'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import {
  Highlighter, Play, Pause, ChevronLeft, ChevronRight,
  X, Zap, Trash2, Sun, Moon, Download, Target, ArrowLeft, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const COLORS = [
  { name: 'yellow', bg: 'rgba(253, 224, 71, 0.4)', border: '#fde047' },
  { name: 'green', bg: 'rgba(74, 222, 128, 0.4)', border: '#4ade80' },
  { name: 'pink', bg: 'rgba(244, 114, 182, 0.4)', border: '#f472b6' },
  { name: 'blue', bg: 'rgba(96, 165, 250, 0.4)', border: '#60a5fa' },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Highlight {
  _id: string;
  pageNumber: number;
  highlightType: string;
  color: string;
  text: string;
  position: { x: number; y: number; width: number; height: number };
  notes: Array<{ _id: string; content: string; createdAt: string }>;
}

interface SmartPDFReaderProps {
  pdfId: string;
  pdfUrl: string;
  pdfName: string;
  onBack?: () => void;
}

export default function SmartPDFReader({ pdfId, pdfUrl, pdfName, onBack }: SmartPDFReaderProps) {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [selectedTool, setSelectedTool] = useState<'select' | 'highlight'>('select');
  
  const [mode, setMode] = useState<'normal' | 'quickReview'>('normal');

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(45);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserRef = useRef<any>(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({ 
    sidebarTabs: () => [],
  });

  useEffect(() => {
    const userStr = localStorage.getItem('upsc_user');
    if (userStr) {
      currentUserRef.current = JSON.parse(userStr);
    }
    
    let blobUrl: string | null = null;
    
    const loadPdf = async () => {
      try {
        const token = localStorage.getItem('upsc_token');
        const response = await fetch(pdfUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
        setPdfData(blobUrl);
      } catch (err) {
        console.error('Failed to load PDF:', err);
      }
    };
    
    loadPdf();
    
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    // Load user and then fetch highlights
    const init = async () => {
      const userStr = localStorage.getItem('upsc_user');
      if (userStr) {
        currentUserRef.current = JSON.parse(userStr);
        loadHighlights();
        startSession();
      }
    };
    
    init();
  }, [pdfId]);

  useEffect(() => {
    if (!isPaused && sessionStarted) {
      timerRef.current = setInterval(() => {
        setTotalTimeSpent(s => s + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, sessionStarted]);

  useEffect(() => {
    if (sessionStarted && !isPaused) {
      autoSaveRef.current = setInterval(() => saveProgress(), 30000);
    }
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [sessionStarted, isPaused, totalTimeSpent]);

  const toggleTimer = () => {
    if (!sessionStarted) {
      setSessionStarted(true);
      setIsPaused(false);
    } else {
      setIsPaused(p => !p);
    }
  };

  const loadHighlights = async () => {
    const userStr = localStorage.getItem('upsc_user');
    const token = localStorage.getItem('upsc_token');
    
    if (!userStr || !token) return;
    
    const user = JSON.parse(userStr);
    const userId = user._id || user.id || user.userId;
    
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE}/pdf-reader/highlights/${userId}/${pdfId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHighlights(data);
      }
    } catch (err) {
      console.error('Failed to load highlights:', err);
    }
  };

  const startSession = async () => {
    try {
      const token = localStorage.getItem('upsc_token');
      await fetch(`${API_BASE}/pdf-reader/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pdfId, startPage: currentPage }),
      });
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('upsc_token');
      await fetch(`${API_BASE}/pdf-reader/session/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pdfId, currentPage, totalTimeSpent }),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const handleTextSelection = useCallback(async () => {
    if (selectedTool !== 'highlight') return;
    const selection = window.getSelection();
    if (!selection?.toString().trim()) return;

    const text = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const token = localStorage.getItem('upsc_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/pdf-reader/highlight`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          pdfId, pageNumber: currentPage, highlightType: 'text',
          color: selectedColor, text,
          position: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
        }),
      });

      if (response.ok) {
        const newHighlight = await response.json();
        setHighlights(prev => [...prev, { ...newHighlight, notes: [] }]);
        selection.removeAllRanges();
        toast.success('Highlight saved!');
      } else {
        toast.error('Failed to save highlight');
      }
    } catch (err) {
      toast.error('Failed to save highlight');
    }
  }, [selectedTool, selectedColor, currentPage, pdfId]);

  const addNote = async () => {
    if (!noteContent.trim() || !activeHighlightId) return;
    try {
      const token = localStorage.getItem('upsc_token');
      const response = await fetch(`${API_BASE}/pdf-reader/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ pdfId, highlightId: activeHighlightId, pageNumber: currentPage, content: noteContent }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setHighlights(prev => prev.map(h => h._id === activeHighlightId ? { ...h, notes: [...h.notes, newNote] } : h));
        setNoteContent('');
        setShowNoteModal(false);
        setActiveHighlightId(null);
        toast.success('Note added');
      }
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const deleteHighlight = async (id: string) => {
    if (!confirm('Delete this highlight?')) return;
    try {
      const token = localStorage.getItem('upsc_token');
      const response = await fetch(`${API_BASE}/pdf-reader/highlight/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setHighlights(prev => prev.filter(h => h._id !== id));
        toast.success('Highlight deleted');
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const goToHighlight = (h: Highlight) => {
    setCurrentPage(h.pageNumber);
  };

  const exportHighlights = () => {
    let md = `# Highlights from ${pdfName}\n\n`;
    md += `**Total:** ${highlights.length} | **Time:** ${formatTime(totalTimeSpent)}\n\n---\n\n`;
    
    const grouped = highlights.reduce((acc, h) => {
      (acc[h.pageNumber] = acc[h.pageNumber] || []).push(h);
      return acc;
    }, {} as Record<number, Highlight[]>);
    
    Object.keys(grouped).sort((a, b) => +a - +b).forEach(page => {
      md += `## Page ${page}\n\n`;
      grouped[+page].forEach(h => {
        if (h.text) md += `> ${h.text}\n\n`;
        h.notes.forEach(n => md += `**Note:** ${n.content}\n`);
        md += '\n';
      });
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${pdfName}-highlights.md`;
    a.click();
    toast.success('Exported!');
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}` : `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pageProgress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const targetProgress = targetTime ? Math.min(100, Math.round((totalTimeSpent / targetTime) * 100)) : 0;

  const highlightedPages = useMemo(() => new Set(highlights.map(h => h.pageNumber)), [highlights]);
  const quickReviewStats = { pages: highlightedPages.size, time: Math.ceil(highlightedPages.size * 2) };

  const groupedHighlights = useMemo(() => {
    return highlights.reduce((acc, h) => {
      (acc[h.pageNumber] = acc[h.pageNumber] || []).push(h);
      return acc;
    }, {} as Record<number, Highlight[]>);
  }, [highlights]);

  const bgClass = darkMode ? 'bg-ink-950' : 'bg-gray-100';
  const headerBgClass = darkMode ? 'bg-ink-900 border-ink-800' : 'bg-white border-gray-200';
  const sidebarBgClass = darkMode ? 'bg-ink-900 border-ink-800' : 'bg-white border-gray-200';
  const cardBgClass = darkMode ? 'bg-ink-950 border-ink-800' : 'bg-gray-50 border-gray-200';
  const textClass = darkMode ? 'text-ink-100' : 'text-gray-900';
  const mutedTextClass = darkMode ? 'text-ink-500' : 'text-gray-500';
  const borderClass = darkMode ? 'border-ink-800' : 'border-gray-200';

  return (
    <div className={`h-screen flex flex-col ${bgClass}`}>
      {/* Mobile Header */}
      <div className={`lg:hidden border-b px-3 py-2 flex items-center justify-between gap-2 ${darkMode ? 'bg-[#0a0a0f] border-ink-800' : 'bg-gray-100 border-gray-200'}`}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-ink-800 text-ink-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => setMobileSidebarOpen(true)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-ink-800 text-ink-400' : 'hover:bg-gray-100 text-gray-600'}`}>
            <FileText className="w-5 h-5" />
          </button>
          <div>
            <h2 className={`font-bold text-xs truncate max-w-[120px] ${textClass}`}>{pdfName}</h2>
            <p className={`text-[9px] font-mono ${mutedTextClass}`}>Pg {currentPage}/{totalPages}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTimer} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${!isPaused ? 'bg-green-500/20 text-green-400' : darkMode ? 'bg-ink-800 text-ink-300' : 'bg-gray-100 text-gray-700'}`}>
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span className="hidden sm:inline">{formatTime(totalTimeSpent)}</span>
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-ink-800 text-ink-400' : 'hover:bg-gray-100 text-gray-600'}`}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className={`hidden lg:flex border-b px-4 py-2 items-center justify-between gap-4 ${headerBgClass}`}>
        <div className="flex items-center gap-3 flex-1">
          {onBack && (
            <button onClick={onBack} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-ink-800 text-ink-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className={`font-bold text-sm truncate max-w-[200px] ${textClass}`}>{pdfName}</h2>
              <span className={`text-xs font-mono ${mutedTextClass}`}>{pageProgress}%</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 max-w-[200px] h-2 rounded-full overflow-hidden" style={{ background: darkMode ? '#130f0a' : '#e5e7eb' }}>
                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all" style={{ width: `${pageProgress}%` }} />
              </div>
              <span className={`text-[10px] font-mono ${mutedTextClass}`}>Pg {currentPage}/{totalPages}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(mode === 'normal' ? 'quickReview' : 'normal')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === 'quickReview' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : darkMode ? 'bg-ink-800 text-ink-300 border border-ink-700' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
            <Zap className="w-3.5 h-3.5" />{mode === 'normal' ? 'Quick Review' : 'Normal'}
          </button>
          <button onClick={toggleTimer} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold font-mono transition-all ${!isPaused ? 'bg-green-500/20 text-green-400 border border-green-500/40' : darkMode ? 'bg-ink-800 text-ink-300 border border-ink-700' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}{formatTime(totalTimeSpent)}
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-ink-800 text-ink-400' : 'hover:bg-gray-100 text-gray-600'}`}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block w-80 border-r overflow-y-auto ${sidebarBgClass}`}>
          <div className="p-4 space-y-4">
            <div className={`rounded-xl p-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-ink-500">Progress</span>
                <button onClick={() => setShowTargetModal(true)} className="text-[10px] text-yellow-500">Set Target</button>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] text-ink-500 mb-1"><span>Page Progress</span><span>{currentPage}/{totalPages}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: darkMode ? '#130f0a' : '#e5e7eb' }}>
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all" style={{ width: `${pageProgress}%` }} />
                  </div>
                  <span className="text-[10px] text-yellow-500">{pageProgress}%</span>
                </div>
                {targetTime ? (
                  <div>
                    <div className="flex justify-between text-[10px] text-ink-500 mb-1"><span>Time vs Target</span><span>{formatTime(totalTimeSpent)} / {formatTime(targetTime)}</span></div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: darkMode ? '#130f0a' : '#e5e7eb' }}>
                      <div className="h-full transition-all" style={{ width: `${Math.min(targetProgress, 100)}%`, background: targetProgress >= 100 ? '#ef4444' : '#22c55e' }} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {mode === 'quickReview' ? (
              <div className={`rounded-xl p-4 border-2 border-yellow-500/30 ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-500">Quick Review</span>
                </div>
                <p className="text-[10px] text-ink-500">{quickReviewStats.pages} pages with highlights</p>
                <p className="text-[10px] text-ink-500">Est. time: ~{quickReviewStats.time} min</p>
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-ink-500">Highlights ({highlights.length})</span>
                <button onClick={exportHighlights} className="text-[10px] text-yellow-500 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export
                </button>
              </div>
              {highlights.length === 0 ? (
                <p className="text-[10px] text-ink-600 text-center py-4">No highlights yet. Select text to highlight.</p>
              ) : (
                <div className="space-y-2">
                  {Object.keys(groupedHighlights).sort((a, b) => +a - +b).map(page => (
                    <div key={page}>
                      <div className="text-[10px] font-mono text-ink-600 uppercase mb-1">Page {page}</div>
                      {groupedHighlights[+page].map(h => (
                        <div key={h._id} className={`w-full p-2 rounded-lg mb-1 border transition-all group ${darkMode ? 'bg-ink-950 border-ink-800 hover:border-ink-700' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: COLORS.find(c => c.name === h.color)?.border || '#fde047' }} />
                            <button onClick={() => goToHighlight(h)} className="flex-1 text-left">
                              <p className="text-[11px] text-ink-300 line-clamp-2">{h.text || '(Area)'}</p>
                            </button>
                            <button onClick={() => deleteHighlight(h._id)} className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'}`}>
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed left-0 top-0 bottom-0 w-72 border-r overflow-y-auto z-50 transform transition-transform duration-300 ${sidebarBgClass} ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-ink-500">Reader</span>
              <button onClick={() => setMobileSidebarOpen(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-ink-800 text-ink-400' : 'hover:bg-gray-100 text-gray-600'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`rounded-xl p-4 ${cardBgClass}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-ink-500">Progress</span>
                <button onClick={() => setShowTargetModal(true)} className="text-[10px] text-yellow-500">Set Target</button>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] text-ink-500 mb-1"><span>Page</span><span>{currentPage}/{totalPages}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: darkMode ? '#130f0a' : '#e5e7eb' }}>
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all" style={{ width: `${pageProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-ink-500">Highlights ({highlights.length})</span>
              {highlights.length === 0 ? (
                <p className="text-[10px] text-ink-600 text-center py-2">No highlights yet</p>
              ) : (
                <div className="space-y-1">
                  {Object.keys(groupedHighlights).sort((a, b) => +a - +b).map(page => (
                    <div key={page}>
                      <div className="text-[9px] font-mono text-ink-600 uppercase mb-1">Pg {page}</div>
                      {groupedHighlights[+page].map(h => (
                        <button key={h._id} onClick={() => { goToHighlight(h); setMobileSidebarOpen(false); }} className={`w-full p-2 rounded-lg mb-1 border text-left ${darkMode ? 'bg-ink-950 border-ink-800' : 'bg-gray-50 border-gray-200'}`}>
                          <p className="text-[10px] text-ink-300 line-clamp-2">{h.text || '(Area)'}</p>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Tools Bar */}
          <div className={`hidden lg:flex border-b px-4 py-2 items-center gap-4 ${darkMode ? 'bg-ink-900/50 border-ink-800' : 'bg-gray-50 border-gray-200'}`}>
            <button onClick={() => setSelectedTool('select')} className={`p-2 rounded-lg transition-all ${selectedTool === 'select' ? 'bg-yellow-500/20 text-yellow-400' : darkMode ? 'text-ink-500 hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
              <FileText className="w-4 h-4" />
            </button>
            <button onClick={() => setSelectedTool('highlight')} className={`p-2 rounded-lg transition-all ${selectedTool === 'highlight' ? 'bg-yellow-500/20 text-yellow-400' : darkMode ? 'text-ink-500 hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
              <Highlighter className="w-4 h-4" />
            </button>
            {selectedTool === 'highlight' ? (
              <div className="flex items-center gap-1">
                {COLORS.map(c => (
                  <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`w-6 h-6 rounded-lg border-2 transition-all ${selectedColor === c.name ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c.border }} />
                ))}
              </div>
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className={`p-2 rounded-lg transition-all ${currentPage <= 1 ? 'opacity-30' : darkMode ? 'text-ink-400 hover:bg-ink-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input type="number" value={currentPage} onChange={e => { const p = +e.target.value; if (p >= 1 && p <= totalPages) setCurrentPage(p); }} className={`w-14 px-2 py-1 text-center text-sm rounded-lg border font-mono ${darkMode ? 'bg-ink-950 border-ink-800 text-ink-200' : 'bg-white border-gray-200 text-gray-800'}`} />
              <span className="text-xs text-ink-500">/ {totalPages}</span>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className={`p-2 rounded-lg transition-all ${currentPage >= totalPages ? 'opacity-30' : darkMode ? 'text-ink-400 hover:bg-ink-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-1 sm:p-4 pb-20 lg:pb-4" onMouseUp={handleTextSelection}>
            <div className="mx-auto max-w-4xl">
              {pdfData ? (
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <Viewer
                    fileUrl={pdfData}
                    plugins={[defaultLayoutPluginInstance]}
                    onPageChange={e => setCurrentPage(e.currentPage + 1)}
                    onDocumentLoad={e => setTotalPages(e.doc.numPages)}
                    theme={darkMode ? 'dark' : 'light'}
                    initialPage={currentPage - 1}
                  />
                </Worker>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-ink-500">Loading PDF...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tools Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t px-4 py-2 flex items-center justify-between gap-2 ${darkMode ? 'bg-[#0a0a0f] border-ink-800' : 'bg-gray-100 border-gray-200'}`}>
        <button onClick={() => setSelectedTool('select')} className={`p-3 rounded-lg transition-all ${selectedTool === 'select' ? 'bg-yellow-500/20 text-yellow-400' : darkMode ? 'text-ink-400 hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
          <FileText className="w-5 h-5" />
        </button>
        <button onClick={() => setSelectedTool('highlight')} className={`p-3 rounded-lg transition-all ${selectedTool === 'highlight' ? 'bg-yellow-500/20 text-yellow-400' : darkMode ? 'text-ink-400 hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Highlighter className="w-5 h-5" />
        </button>
        {selectedTool === 'highlight' ? (
          <div className="flex items-center gap-1">
            {COLORS.map(c => (
              <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`w-7 h-7 rounded-lg border-2 transition-all ${selectedColor === c.name ? 'border-white scale-110' : 'border-transparent'}`} style={{ background: c.border }} />
            ))}
          </div>
        ) : null}
        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className={`p-3 rounded-lg transition-all ${currentPage <= 1 ? 'opacity-30' : darkMode ? 'text-ink-400 hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-mono text-ink-400 min-w-[50px] text-center">{currentPage}/{totalPages}</span>
        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className={`p-3 rounded-lg transition-all ${currentPage >= totalPages ? 'opacity-30' : darkMode ? 'text-ink-400 hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={() => setMode(mode === 'normal' ? 'quickReview' : 'normal')} className={`p-3 rounded-lg transition-all ${mode === 'quickReview' ? 'bg-yellow-500/20 text-yellow-400' : darkMode ? 'text-ink-400 hover:bg-ink-800' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Zap className="w-5 h-5" />
        </button>
      </div>

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl ${darkMode ? 'bg-ink-900 border border-ink-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add Note</h3>
              <button onClick={() => { setShowNoteModal(false); setActiveHighlightId(null); setNoteContent(''); }} className="p-2 hover:bg-ink-800 rounded-lg"><X className="w-4 h-4 text-ink-400" /></button>
            </div>
            <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Write your note..." className={`w-full h-32 p-3 rounded-xl border resize-none text-sm ${darkMode ? 'bg-ink-950 border-ink-800 text-ink-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`} autoFocus />
            <div className="flex gap-3 mt-4">
              <button onClick={addNote} disabled={!noteContent.trim()} className="flex-1 btn-primary disabled:opacity-50">Save</button>
              <button onClick={() => { setShowNoteModal(false); setActiveHighlightId(null); setNoteContent(''); }} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showTargetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl ${darkMode ? 'bg-ink-900 border border-ink-800' : 'bg-white border border-gray-200'}`}>
            <h3 className="font-bold text-lg mb-4">Set Reading Target</h3>
            <label className="text-xs text-ink-500 uppercase mb-2 block">Target Time (minutes)</label>
            <input type="number" value={targetMinutes} onChange={e => setTargetMinutes(Math.max(1, +e.target.value || 1))} className={`w-full p-3 rounded-xl border text-lg font-mono text-center ${darkMode ? 'bg-ink-950 border-ink-800 text-ink-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setTargetTime(targetMinutes * 60); setShowTargetModal(false); toast.success(`Target: ${targetMinutes} min`); }} className="flex-1 btn-primary">Set</button>
              <button onClick={() => setShowTargetModal(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
