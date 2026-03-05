'use client';
import { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { FileText } from 'lucide-react';

export default function PDFViewerComponent({ testId }: { testId: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [noPdf, setNoPdf] = useState(false);
  const isFetching = useRef(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    if (!testId || pdfUrl || noPdf) return;

    const loadPDF = async () => {
      try {
        const token = localStorage.getItem('upsc_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mock-tests/${testId}/pdf`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Structured tests return 404 — show no-pdf state, not an error
        if (response.status === 404) {
          setNoPdf(true);
          return;
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setNoPdf(true);
      }
    };

    loadPDF();
  }, [testId]);

  if (noPdf) return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-ink-950 text-ink-600 gap-3">
      <FileText className="w-10 h-10 opacity-20" />
      <p className="text-xs font-mono uppercase tracking-widest">Structured Bank — No PDF</p>
      <p className="text-[10px] text-ink-700 italic">Questions are embedded directly in the answer sheet</p>
    </div>
  );

  if (!pdfUrl) return (
    <div className="h-full w-full flex items-center justify-center bg-ink-950 text-ink-500 font-mono text-xs">
      PREPARING DOCUMENT...
    </div>
  );

  return (
    <div className="h-full w-full bg-ink-900">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} theme="dark" />
      </Worker>
    </div>
  );
}
