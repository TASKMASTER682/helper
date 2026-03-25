'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { File, Clock, ChevronRight, Search, Eye, Zap, Upload, X, Loader2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const SUBJECTS = ['Polity', 'History', 'Geography', 'Economy', 'Environment', 'Science & Tech', 'Ethics', 'Current Affairs', 'CSAT', 'Optional'];

interface PDFSource {
  _id: string;
  name: string;
  subject?: string;
  year?: string;
  fileName: string;
  fileSize: number;
  totalTimeSpent: number;
  lastReadDate?: string;
  lastPageRead?: number;
  isCompleted: boolean;
  averageReadingSpeed: number;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PDFReaderListPage() {
  const [pdfs, setPdfs] = useState<PDFSource[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', subject: '', year: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadPDFs();
    loadSubjects();
  }, []);

  const loadPDFs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('upsc_token');
      const response = await fetch(`${API_BASE}/pdfs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPdfs(data);
      }
    } catch (err) {
      console.error('Failed to load PDFs:', err);
      setPdfs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem('upsc_token');
      const response = await fetch(`${API_BASE}/pdfs/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('name', uploadForm.name || selectedFile.name.replace(/\.pdf$/i, ''));
      if (uploadForm.subject) formData.append('subject', uploadForm.subject);
      if (uploadForm.year) formData.append('year', uploadForm.year);

      const token = localStorage.getItem('upsc_token');
      const response = await fetch(`${API_BASE}/pdfs/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast.success('PDF uploaded successfully!');
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadForm({ name: '', subject: '', year: '' });
        loadPDFs();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to upload PDF');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this PDF?')) return;
    
    try {
      const token = localStorage.getItem('upsc_token');
      const response = await fetch(`${API_BASE}/pdfs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('PDF deleted');
        loadPDFs();
      }
    } catch (err) {
      toast.error('Failed to delete PDF');
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  const filteredPDFs = pdfs.filter(pdf => 
    pdf.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pdf.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title">Smart PDF Reader</h1>
          <p className="text-ink-500 text-sm mt-1">
            Read PDFs with highlights, notes, time tracking & quick review mode
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>AI-Powered</span>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload PDF
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search PDFs by name or subject..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-ink-900/50 border-ink-800 text-ink-200 placeholder-ink-600 text-sm focus:outline-none focus:border-yellow-500/50 transition-colors"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-600 font-mono animate-pulse text-xs">
          Loading documents...
        </div>
      ) : filteredPDFs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-ink-900/50 border border-ink-800 flex items-center justify-center mx-auto mb-4">
            <File className="w-10 h-10 text-ink-600" />
          </div>
          <h3 className="text-lg font-bold text-ink-300 mb-2">No PDFs to Read</h3>
          <p className="text-ink-600 text-sm max-w-sm mx-auto mb-6">
            {searchQuery 
              ? 'No PDFs match your search. Try a different term.'
              : 'Upload your first PDF to start reading with Smart features.'
            }
          </p>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary flex items-center gap-2 mx-auto">
            <Upload className="w-4 h-4" /> Upload Your First PDF
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPDFs.map((pdf) => (
            <div key={pdf._id} className="relative group">
              <Link
                href={`/dashboard/pdf-reader/${pdf._id}`}
                className={clsx(
                  'glass-card p-5 border transition-all duration-300 block',
                  'hover:border-yellow-500/30 hover:bg-ink-900/60',
                  pdf.isCompleted && 'border-green-500/20'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                    <File className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-ink-100 truncate group-hover:text-yellow-400 transition-colors">
                      {pdf.name}
                    </h3>
                    {pdf.subject && (
                      <p className="text-[10px] text-ink-500 uppercase tracking-wider mt-1">{pdf.subject}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-ink-600 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Open
                      </span>
                      {pdf.totalTimeSpent > 0 && (
                        <span className="text-[10px] text-green-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTime(pdf.totalTimeSpent)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4 pt-4 border-t border-ink-800/50 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-ink-950/50">
                    <span className="text-[10px] text-ink-500">Highlights</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-ink-950/50">
                    <span className="text-[10px] text-ink-500">Time Track</span>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-ink-950/50">
                    <span className="text-[10px] text-ink-500">Quick Rev</span>
                  </div>
                </div>
                {pdf.isCompleted && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                      Done
                    </span>
                  </div>
                )}
              </Link>
              <button
                onClick={(e) => handleDelete(pdf._id, e)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/0 group-hover:bg-red-500/20 text-ink-600 group-hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                title="Delete PDF"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md border border-ink-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-ink-100">Upload PDF</h3>
              <button onClick={() => { setShowUploadModal(false); setSelectedFile(null); setUploadForm({ name: '', subject: '', year: '' }); }} className="p-2 hover:bg-ink-800 rounded-lg">
                <X className="w-4 h-4 text-ink-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-ink-500 font-mono uppercase tracking-wider mb-2 block">Select PDF File *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                    selectedFile ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-ink-700 hover:border-ink-600'
                  )}
                >
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) setSelectedFile(file); }} />
                  {selectedFile ? (
                    <div>
                      <File className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm text-ink-200 font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-ink-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-ink-500 mx-auto mb-2" />
                      <p className="text-sm text-ink-400">Click to select PDF</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-500 font-mono uppercase tracking-wider mb-2 block">Name (optional)</label>
                <input type="text" value={uploadForm.name} onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })} placeholder="Custom name" className="w-full px-4 py-2.5 rounded-xl border bg-ink-900 border-ink-800 text-ink-200 placeholder-ink-600 text-sm" />
              </div>
              <div>
                <label className="text-xs text-ink-500 font-mono uppercase tracking-wider mb-2 block">Subject</label>
                <select value={uploadForm.subject} onChange={e => setUploadForm({ ...uploadForm, subject: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border bg-ink-900 border-ink-800 text-ink-200 text-sm">
                  <option value="">Select Subject...</option>
                  <optgroup label="UPSC Subjects">
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                  {subjects.length > 0 && (
                    <optgroup label="Library Subjects">
                      {subjects.filter(s => !SUBJECTS.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>
              <button onClick={handleUpload} disabled={!selectedFile || uploading} className={clsx('w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2', !selectedFile || uploading ? 'bg-ink-800 text-ink-600 cursor-not-allowed' : 'bg-yellow-500 text-ink-950 hover:bg-yellow-400')}>
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload PDF</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
