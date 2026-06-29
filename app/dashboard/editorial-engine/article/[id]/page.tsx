'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mic, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type Article = {
  _id: string;
  title: string;
  description: string;
  link: string;
  sourceKey: string;
  runDateKey: string;
  publishedAt: string | null;
  speechContent: string;
  keyPointersContent: string;
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [generatingSpeech, setGeneratingSpeech] = useState(false);
  const [speechOpen, setSpeechOpen] = useState(false);

  const readAloud = () => {
    if (!article?.speechContent) return;
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      const stripped = article.speechContent.replace(/<[^>]*>/g, '');
      const utterance = new SpeechSynthesisUtterance(stripped);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-IN';
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  const generateSpeech = async () => {
    if (!article) return;
    setGeneratingSpeech(true);
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.post(`/editorial-engine/items/${article._id}/generate-speech`);
      if (res.data?.speechContent) {
        setArticle({ ...article, speechContent: res.data.speechContent });
      }
    } catch (e: any) {
      alert('Failed: ' + (e?.response?.data?.error || e?.message || String(e)));
    } finally {
      setGeneratingSpeech(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (!params?.id) return;
    fetchArticle();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id, user]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { default: api } = await import('@/lib/api');
      const res = await api.get(`/editorial-engine/items/${params.id}`);
      setArticle(res.data?.item || null);
    } catch {
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-ink-800/50 rounded w-1/3" />
          <div className="h-4 bg-ink-800/50 rounded w-1/4" />
          <div className="h-40 bg-ink-800/50 rounded" />
          <div className="h-40 bg-ink-800/50 rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6 text-center">
        <p className="text-ink-400">Article not found.</p>
        <Link href="/dashboard/editorial-engine" className="text-crimson hover:underline mt-2 inline-block">
          Back to Editorial Engine
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/editorial-engine"
          className="inline-flex items-center gap-1.5 text-ink-400 text-sm hover:text-crimson transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Editorial Engine
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-ink-100 leading-tight">{article.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-crimson">{article.sourceKey}</span>
          <span className="text-ink-500">|</span>
          <span className="text-xs text-ink-400">{article.runDateKey}</span>
          {article.link && (
            <>
              <span className="text-ink-500">|</span>
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-crimson hover:underline font-semibold"
              >
                Original Source
              </a>
            </>
          )}
        </div>
      </div>

      {/* Speech Section */}
      <div className="bg-ink-900 border border-ink-600/20 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between pb-4 border-b border-ink-600/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-crimson-deep flex items-center justify-center shadow-sm shadow-crimson-deep/30">
              <Mic className="w-4 h-4 text-parchment" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-100">Speech Practice</h2>
              <p className="text-ink-400 text-xs">Read aloud to practice your articulation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {article.speechContent && (
              <button
                onClick={readAloud}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold active:scale-95 transition-all ${
                  speaking
                    ? 'bg-crimson text-white animate-pulse shadow-sm shadow-crimson/40'
                    : 'bg-crimson/10 text-crimson border border-crimson/30 hover:bg-crimson/20'
                }`}
              >
                <Mic className="w-4 h-4" />
                {speaking ? 'Stop' : 'Read Aloud'}
              </button>
            )}
            <button
              onClick={() => setSpeechOpen(!speechOpen)}
              className="p-2 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-800/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson/50"
              aria-label={speechOpen ? 'Collapse speech' : 'Expand speech'}
            >
              {speechOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div
          className={`mt-5 overflow-hidden transition-all duration-300 ease-in-out ${
            speechOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 mt-0'
          }`}
        >
            {article.speechContent ? (
              <div
                className="text-ink-200 text-sm leading-relaxed space-y-3 [&_h1]:text-crimson [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-crimson [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-crimson-deep [&_h3]:font-bold [&_h3]:text-base [&_a]:text-crimson [&_a]:font-semibold [&_a:hover]:underline [&_strong]:text-ink-100 [&_strong]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-crimson [&_blockquote]:pl-4 [&_blockquote]:text-ink-400 [&_blockquote]:italic [&_blockquote]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-ink-200 [&_li]:my-1 [&_code]:text-teal [&_code]:text-xs [&_code]:bg-ink-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_hr]:border-ink-600/20 [&_p]:my-2 [&_img]:rounded-xl [&_img]:border [&_img]:border-ink-600/20 [&_table]:w-full [&_table]:border-collapse [&_th]:text-ink-100 [&_th]:font-bold [&_th]:border [&_th]:border-ink-600/20 [&_th]:p-2 [&_th]:bg-ink-950 [&_td]:border [&_td]:border-ink-600/20 [&_td]:p-2 [&_td]:text-ink-200"
                dangerouslySetInnerHTML={{ __html: article.speechContent }}
              />
            ) : (
              <div>
                <p className="text-ink-400 text-sm italic mb-3">No speech content added yet.</p>
                {article.keyPointersContent && (
                  <button
                    onClick={generateSpeech}
                    disabled={generatingSpeech}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-teal/10 text-teal border border-teal/30 hover:bg-teal/20 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    {generatingSpeech ? 'Generating...' : 'Generate Speech from Key Pointers'}
                  </button>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Key Pointers Section */}
      <div className="bg-ink-900 border border-ink-600/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-ink-600/20">
          <div className="w-9 h-9 rounded-xl bg-teal-deep flex items-center justify-center shadow-sm shadow-teal-deep/30">
            <BookOpen className="w-4 h-4 text-parchment" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-100">Key Pointers for Mains</h2>
            <p className="text-ink-400 text-xs">Remember these points for your Mains answers</p>
          </div>
        </div>
        {article.keyPointersContent ? (
          <div
            className="text-ink-200 text-sm leading-relaxed space-y-3 [&_h1]:text-crimson [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-crimson [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-crimson-deep [&_h3]:font-bold [&_h3]:text-base [&_a]:text-crimson [&_a]:font-semibold [&_a:hover]:underline [&_strong]:text-ink-100 [&_strong]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-crimson [&_blockquote]:pl-4 [&_blockquote]:text-ink-400 [&_blockquote]:italic [&_blockquote]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-ink-200 [&_li]:my-1 [&_code]:text-teal [&_code]:text-xs [&_code]:bg-ink-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_hr]:border-ink-600/20 [&_p]:my-2 [&_img]:rounded-xl [&_img]:border [&_img]:border-ink-600/20 [&_table]:w-full [&_table]:border-collapse [&_th]:text-ink-100 [&_th]:font-bold [&_th]:border [&_th]:border-ink-600/20 [&_th]:p-2 [&_th]:bg-ink-950 [&_td]:border [&_td]:border-ink-600/20 [&_td]:p-2 [&_td]:text-ink-200"
            dangerouslySetInnerHTML={{ __html: article.keyPointersContent }}
          />
        ) : (
          <p className="text-ink-400 text-sm italic">No key pointers added yet.</p>
        )}
      </div>
    </div>
  );
}
