'use client';
import { useState, useEffect, useRef } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PDFViewerComponent({ testId }: { testId: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const isFetching = useRef(false); // Loop rokne ke liye
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
  // Agar testId nahi hai toh return kar jao
  if (!testId) return;

  const loadPDF = async () => {
    // Agar pehle se fetch ho gaya hai toh mat karo
    if (pdfUrl) return; 

    try {
      const token = localStorage.getItem('upsc_token');
      // Console log check karne ke liye ki backend hit ho raha hai ya nahi
      console.log("Fetching from:", `${process.env.NEXT_PUBLIC_API_URL}/mock-tests/${testId}/pdf`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mock-tests/${testId}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Failed to load PDF:", err);
    }
  };

  loadPDF();

  // CLEANUP: Sirf tabhi revoke karein jab component unmount ho ya testId badle
  return () => {
    // Yahan revoke ko thoda delay de sakte hain ya avoid karein agar same session hai
  };
}, [testId]);

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