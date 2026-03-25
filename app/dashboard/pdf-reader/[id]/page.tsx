'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';

const SmartPDFReader = dynamic(() => import('@/components/SmartPDFReader'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-ink-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mx-auto mb-4" />
        <p className="text-ink-400 font-mono text-sm">Loading PDF Engine...</p>
      </div>
    </div>
  ),
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PDFReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [pdfData, setPdfData] = useState<{ id: string; name: string; url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const token = localStorage.getItem('upsc_token');
        const response = await fetch(`${API_BASE}/pdfs/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('PDF not found');
        
        const pdf = await response.json();
        const fileUrl = `${API_BASE}/pdfs/${params.id}/file`;
        
        setPdfData({ id: pdf._id, name: pdf.name, url: fileUrl });
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        setError(err.message || 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadPDF();
  }, [params.id]);

  const handleBack = () => router.push('/dashboard/pdf-reader-list');

  if (loading) {
    return (
      <div className="h-screen bg-ink-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-ink-400 font-mono text-sm">Preparing Smart Reader...</p>
        </div>
      </div>
    );
  }

  if (error || !pdfData) {
    return (
      <div className="h-screen bg-ink-950 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-ink-100 mb-2">PDF Not Available</h2>
          <p className="text-ink-500 text-sm mb-6">{error || 'This PDF could not be found.'}</p>
          <button onClick={handleBack} className="btn-primary">Back to Library</button>
        </div>
      </div>
    );
  }

  return <SmartPDFReader pdfId={pdfData.id} pdfUrl={pdfData.url} pdfName={pdfData.name} onBack={handleBack} />;
}
