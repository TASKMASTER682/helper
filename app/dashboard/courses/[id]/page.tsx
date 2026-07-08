'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coursesAPI, subscriptionAPI } from '@/lib/api';
import ProtectedVideoPlayer from '@/components/ProtectedVideoPlayer';
import TelegramVideoPlayer from '@/components/TelegramVideoPlayer';
import DevToolsGuard from '@/components/DevToolsGuard';
import { 
  Play, BookOpen, Clock, CheckCircle2, Circle, 
  ChevronLeft, ChevronRight, Loader2, ArrowLeft, List, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Lesson {
  _id: string;
  title: string;
  description: string;
  videoId: string;
  telegramChannel?: string;
  telegramMsgId?: string;
  duration: string;
  order: number;
  isCompleted: boolean;
  lastWatchedTime: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  subject: string;
  category: string;
  instructor: string;
  lessons: Lesson[];
  progress: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    lastWatchedLessonId: string;
  };
}

export default function CoursePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [videoId, setVideoId] = useState<string>('');
  const [telegramChannel, setTelegramChannel] = useState<string>('');
  const [telegramMsgId, setTelegramMsgId] = useState<string>('');
  const [videoLoading, setVideoLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', preventSelect);
    
    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', preventSelect);
    };
  }, []);

  const preventRightClick = (e: MouseEvent) => {
    e.preventDefault();
  };

  const preventSelect = (e: Event) => {
    e.preventDefault();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
    }
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
    }
  };

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await coursesAPI.getCourse(courseId);
      
      if (!data.course.isEnrolled) {
        setError(`Enroll for Rs. ${data.course.price} to access this course`);
        return;
      }
      
      setCourse(data.course);
      
      const progress = data.progress;
      let initialLesson = null;
      if (progress?.lastWatchedLessonId) {
        initialLesson = data.course.lessons?.find((l: Lesson) => l._id === progress.lastWatchedLessonId);
      } else {
        initialLesson = data.course.lessons?.[0] || null;
      }
      
      if (initialLesson) {
        setCurrentLesson(initialLesson);
        loadVideo(initialLesson._id);
      }
    } catch (err: any) {
      console.error('Failed to load course:', err);
      if (err.response?.data?.requiresEnrollment) {
        setError(`Enroll for Rs. ${err.response.data.price} to access this course`);
      } else {
        setError(err.response?.data?.message || 'Failed to load course');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = async (lessonId: string) => {
    try {
      setVideoLoading(true);
      const { data } = await coursesAPI.getLessonVideo(courseId, lessonId);
      if (data.requiresEnrollment) {
        toast.error(`Enroll for Rs. ${data.price} to access this course`);
        return;
      }
      if (data.viewLimitReached) {
        toast.error('Maximum view limit reached for this lesson');
        setVideoId('');
        setTelegramChannel('');
        setTelegramMsgId('');
        return;
      }
      if (data.viewsRemaining !== undefined) {
        toast(`Views remaining: ${data.viewsRemaining}`, { icon: 'ℹ️' });
      }
      setVideoId(data.videoId || '');
      setTelegramChannel(data.telegramChannel || '');
      setTelegramMsgId(data.telegramMsgId || '');
    } catch (err: any) {
      if (err.response?.data?.viewLimitReached) {
        toast.error('Maximum view limit reached for this lesson');
        setVideoId('');
      } else if (err.response?.data?.requiresEnrollment) {
        toast.error(`Enroll for Rs. ${err.response.data.price} to access this course`);
      } else {
        console.error('Failed to load video:', err);
        toast.error('Failed to load video');
      }
    } finally {
      setVideoLoading(false);
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    loadVideo(lesson._id);
  };

  const handleVideoEnd = () => {
    if (!course || !currentLesson) return;
    
    if (currentLesson.isCompleted) {
      toast('This lesson is already completed!');
      return;
    }
    
    const currentIndex = course.lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex < course.lessons.length - 1) {
      selectLesson(course.lessons[currentIndex + 1]);
    } else {
      toast.success('Course completed!');
    }
  };

  const handleLessonComplete = () => {
    if (!course || !currentLesson) return;
    setCourse(prev => {
      if (!prev) return prev;
      const lessons = prev.lessons.map(l => 
        l._id === currentLesson._id ? { ...l, isCompleted: true } : l
      );
      const completed = lessons.filter(l => l.isCompleted).length;
      const progress = Math.round((completed / lessons.length) * 100);
      return {
        ...prev,
        lessons,
        progress: {
          ...prev.progress,
          percentage: progress,
          completedLessons: completed,
          lastWatchedLessonId: currentLesson._id
        }
      };
    });
  };

  const goToNextLesson = () => {
    if (!course || !currentLesson) return;
    const currentIndex = course.lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex < course.lessons.length - 1) {
      selectLesson(course.lessons[currentIndex + 1]);
    }
  };

  const goToPrevLesson = () => {
    if (!course || !currentLesson) return;
    const currentIndex = course.lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex > 0) {
      selectLesson(course.lessons[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => router.push('/dashboard/courses')}
          className="flex items-center gap-2 text-ink-400 hover:text-pink-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </button>
        
        <div className="glass-card p-12 text-center border border-red-500/20">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            {error === 'Subscription required' ? 'Subscription Required' : 'Error Loading Course'}
          </h2>
          <p className="text-ink-400 mb-4">
            {error === 'Subscription required' 
              ? 'Please subscribe to access this course content.'
              : 'Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <DevToolsGuard />
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/courses')}
            className="p-2.5 bg-ink-900 border border-ink-700/60 rounded-xl text-ink-400 hover:text-pink-400 hover:border-pink-300/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest rounded-md border border-red-500/30">
                Academy
              </span>
              <span className="text-[9px] text-ink-400 font-mono">•</span>
              <span className="text-[9px] text-ink-400 font-mono uppercase tracking-widest">{course.subject}</span>
            </div>
            <h1 className="text-xl font-display font-bold text-red-800 truncate max-w-lg">
              {course.title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-ink-900 border border-ink-700/60 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-ink-500 uppercase tracking-widest">Progress</span>
              <span className="text-sm font-black text-teal-500">{course.progress?.percentage || 0}%</span>
            </div>
            <div className="w-px h-8 bg-ink-700/60" />
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-ink-500 uppercase tracking-widest">Modules</span>
              <span className="text-sm font-black text-ink-100">{course.progress?.completedLessons || 0}/{course.progress?.totalLessons || 0}</span>
            </div>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
              showSidebar 
                ? "bg-red-500/10 border-red-500/30 text-red-500" 
                : "bg-ink-900 border-ink-700/60 text-ink-400 hover:text-ink-100 hover:border-ink-500"
            )}
          >
            {showSidebar ? <X className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {showSidebar ? 'Modules' : 'Modules'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {currentLesson && (
            <div className="space-y-6">
              {/* Video Container */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/15 to-teal-500/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-ink-800/60">
                  {telegramChannel && telegramMsgId ? (
                    <TelegramVideoPlayer
                      courseId={courseId}
                      lessonId={currentLesson._id}
                      channel={telegramChannel}
                      msgId={telegramMsgId}
                      title={currentLesson.title}
                      duration={currentLesson.duration}
                      isAlreadyCompleted={currentLesson.isCompleted}
                      onVideoEnd={handleVideoEnd}
                      onComplete={handleLessonComplete}
                    />
                  ) : videoId ? (
                    <ProtectedVideoPlayer
                      courseId={courseId}
                      lessonId={currentLesson._id}
                      initialVideoId={videoId}
                      title={currentLesson.title}
                      duration={currentLesson.duration}
                      isAlreadyCompleted={currentLesson.isCompleted}
                      onVideoEnd={handleVideoEnd}
                      onComplete={handleLessonComplete}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-ink-950 min-h-[300px]">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-800 flex items-center justify-center">
                          <svg className="w-8 h-8 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="text-ink-300 text-lg font-semibold mb-2">Video Unavailable</h3>
                        <p className="text-ink-500 text-sm max-w-sm">This video source is being configured. Please check back later.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center justify-between p-2 bg-ink-900/50 border border-ink-700/60 rounded-2xl">
                <button
                  onClick={goToPrevLesson}
                  disabled={course.lessons.findIndex(l => l._id === currentLesson._id) === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-ink-400 hover:text-ink-100 border border-ink-700/60 hover:border-teal-500/30 hover:bg-teal-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">PREVIOUS</span>
                </button>
                
                <div className="hidden sm:flex flex-col items-center">
                   <div className="flex items-center gap-1.5 mb-1.5">
                      {course.lessons.map((l, i) => (
                        <div key={l._id} className={clsx(
                          "w-2 h-2 rounded-full transition-all",
                          l._id === currentLesson._id ? "bg-red-500 scale-125 shadow-sm shadow-red-500/50" : l.isCompleted ? "bg-teal-500" : "bg-ink-700"
                        )} />
                      ))}
                   </div>
                   <span className="text-[9px] text-ink-500 font-mono tracking-widest uppercase">
                    {course.progress?.completedLessons}/{course.progress?.totalLessons} Complete
                  </span>
                </div>
                
                <button
                  onClick={goToNextLesson}
                  disabled={course.lessons.findIndex(l => l._id === currentLesson._id) >= course.lessons.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">NEXT</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Module Description */}
          <div className="glass-card p-6 relative overflow-hidden rounded-2xl border border-ink-700/60">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-1 h-8 bg-teal-500 rounded-full" />
                <div>
                  <span className="text-[9px] font-mono text-teal-500 uppercase tracking-widest font-bold">
                    Module {course.lessons.findIndex(l => l._id === (currentLesson?._id)) + 1} / {course.lessons.length}
                  </span>
                  <h2 className="text-xl font-display font-bold text-red-800">
                    {currentLesson?.title}
                  </h2>
                </div>
              </div>
              <p className="text-ink-400 text-sm leading-relaxed max-w-3xl ml-1">
                {currentLesson?.description || "In this module, we dive deep into the essential concepts required for your preparation. Follow along with the video and take structured notes."}
              </p>
              <div className="flex items-center gap-4 mt-4 ml-1">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-ink-500"><Clock className="w-3 h-3 text-teal-500" /> {currentLesson?.duration}</span>
                {currentLesson?.isCompleted && (
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-teal-500 font-bold"><CheckCircle2 className="w-3 h-3" /> Completed</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content Sidebar */}
        {showSidebar && (
          <div className="w-full lg:w-96 shrink-0 space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="glass-card flex flex-col h-full sticky top-4 max-h-[calc(100vh-100px)] rounded-2xl border border-ink-700/60">
              <div className="p-5 border-b border-ink-700/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-red-800 text-lg">Curriculum</h3>
                    <p className="text-[10px] text-ink-500 font-mono">{course.lessons.length} Modules</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-teal-500">{course.progress?.percentage || 0}%</span>
                    <span className="text-[10px] text-ink-400 font-mono">({course.progress?.completedLessons || 0}/{course.progress?.totalLessons || 0})</span>
                  </div>
                </div>
                
                <div className="h-1.5 bg-ink-950 rounded-full overflow-hidden border border-ink-700/60 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-1000"
                    style={{ width: `${course.progress?.percentage || 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {course.lessons.map((lesson, index) => {
                  const isActive = currentLesson?._id === lesson._id;
                  return (
                    <button
                      key={lesson._id}
                      onClick={() => selectLesson(lesson)}
                      className={clsx(
                        "w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all group/item border",
                        isActive
                          ? "bg-red-500/10 border-red-500/30 shadow-lg shadow-red-900/10"
                          : "bg-transparent border-transparent hover:bg-ink-900/40 hover:border-ink-600/50"
                      )}
                    >
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110",
                        lesson.isCompleted
                          ? "bg-teal-500/20 text-teal-500 border border-teal-500/30"
                          : isActive
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                            : "bg-ink-900 text-ink-500 border border-ink-600"
                      )}>
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-black">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          "text-sm font-bold leading-tight mb-1",
                          isActive ? "text-red-400" : lesson.isCompleted ? "text-ink-400" : "text-ink-100"
                        )}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 text-[10px] text-ink-600 font-mono uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.duration}</span>
                          </div>
                          {isActive && (
                            <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold uppercase animate-pulse">
                              <Play className="w-2.5 h-2.5 fill-current" /> Now Playing
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}