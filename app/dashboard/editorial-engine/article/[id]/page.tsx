'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Copy, Check, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type Article = {
  _id: string;
  title: string;
  description: string;
  link: string;
  sourceKey: string;
  runDateKey: string;
  publishedAt: string | null;
  keyPointersContent: string;
};

const PROMPT_TEMPLATE = `# Role & Objective
You are an expert UPSC Civil Services Examination Evaluator and Core Content Strategist. Your task is to write a highly structured, marks-fetching Mains Model Answer for the provided question. The answer must avoid dense paragraphs and focus on high scannability, concise representations, and easily crammable elements.

---

# Core Structuring Rules

1. **Demand of the Question (Brief Breakdown):**
   - Before starting the answer, write 2 lines explicitly identifying the core directives (e.g., Discuss, Critically Analyze, Evaluate) and the exact sub-parts the question is implicitly asking for.

2. **Introduction (Max 40-50 words):**
   - Provide the most appropriate type of introduction for this specific question. Choose ONLY ONE approach that fits best: (Data/Fact-based) OR (Recent Current Affairs Context) OR (Constitutional/Definition-based).

3. **Core Body Sections (Broken into Appropriate Parts):**
   - Break the body strictly into sub-headings derived directly from the question's demand.
   - **Pointer Representation Rule:** DO NOT write long explanations for points. Write a crisp, 1-line bold pointer, followed immediately by a short representation or an example/case study in parentheses.
   - *Example Format:* **Digital Divide:** Impedes equitable online education (e.g., ASER Report showing only 20% rural kids had smartphones).

4. **Integrated Data & Sources:**
   - Embed authentic statistics, reports, or indices with explicit sources (e.g., NITI Aayog, Economic Survey, NCRB, UN reports) directly within the points to substantiate arguments.

5. **Visual / Diagram / Schematic Idea:**
   - Provide a clear, textual blueprint or description of a diagram (e.g., Hub-and-Spoke model, Flowchart, 2x2 Matrix, or Formula) that the aspirant can physically draw in the exam copy to fetch extra marks.

6. **Crammable Way Forward & Conclusion (Max 40-50 words):**
   - Provide a forward-looking, visionary, or constitutionally aligned (Preamble/DPSP/Fundamental Duties) conclusion that is crisp and ready to memorize.

---

# Tone & Vocabulary
- Lucid, professional, and bureaucratic. Avoid overly flowery English or complex jargon. Maximize the use of high-yielding keywords (e.g., Minimum Government Maximum Governance, Cooperative Federalism, Inclusivity).

---

# The UPSC Question to Answer:
[INSERT QUESTION HERE]`;

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const extractQuestion = (html: string): string => {
    const stripped = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Try to find text after "Mains Practice Question" or "Q."
    const qMatch = stripped.match(/Mains Practice Question[:\s]*([\s\S]*?)(?=\n\s*\n|$)/);
    if (qMatch) return qMatch[1].trim();
    const qMatch2 = stripped.match(/Q\.[\s]*[""']?([^""']+)/);
    if (qMatch2) return qMatch2[1].trim();
    return stripped.slice(0, 300) + '...';
  };

  const getFullPrompt = (): string => {
    if (!article?.keyPointersContent) return PROMPT_TEMPLATE;
    const question = extractQuestion(article.keyPointersContent);
    return PROMPT_TEMPLATE.replace('[INSERT QUESTION HERE]', question);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(getFullPrompt());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Failed to copy. Select and copy manually.');
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
            className="text-ink-200 text-base leading-relaxed space-y-3 [&_h1]:text-crimson [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-crimson [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-crimson-deep [&_h3]:font-bold [&_h3]:text-base [&_a]:text-crimson [&_a]:font-semibold [&_a:hover]:underline [&_strong]:text-ink-100 [&_strong]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-crimson [&_blockquote]:pl-4 [&_blockquote]:text-ink-400 [&_blockquote]:italic [&_blockquote]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-ink-200 [&_li]:my-1 [&_code]:text-teal [&_code]:text-xs [&_code]:bg-ink-950 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_hr]:border-ink-600/20 [&_p]:my-2 [&_img]:rounded-xl [&_img]:border [&_img]:border-ink-600/20 [&_table]:w-full [&_table]:border-collapse [&_th]:text-ink-100 [&_th]:font-bold [&_th]:border [&_th]:border-ink-600/20 [&_th]:p-2 [&_th]:bg-ink-950 [&_td]:border [&_td]:border-ink-600/20 [&_td]:p-2 [&_td]:text-ink-200"
            dangerouslySetInnerHTML={{ __html: article.keyPointersContent }}
          />
        ) : (
          <p className="text-ink-400 text-sm italic">No key pointers added yet.</p>
        )}
      </div>

      {/* Ready Prompt Section */}
      {article.keyPointersContent && (
        <div className="bg-ink-900 border border-ink-600/20 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between pb-4 border-b border-ink-600/20 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-sm shadow-blue-500/20">
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-ink-100">Ready Prompt for AI</h2>
                <p className="text-ink-400 text-xs">Copy this prompt and use with any external AI to generate a model answer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPromptOpen(!promptOpen)}
                className="p-2 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-800/50 transition-colors"
                aria-label={promptOpen ? 'Collapse prompt' : 'Expand prompt'}
              >
                {promptOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={copyPrompt}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 active:scale-95 transition-all"
              >
                {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            promptOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <pre className="bg-ink-950 border border-ink-600/10 rounded-xl p-4 text-ink-300 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-auto max-h-[600px] select-all">
              {getFullPrompt()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
