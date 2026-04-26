'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { coursesAPI, settingsAPI } from '@/lib/api';
import { 
  Play, BookOpen, Clock, CheckCircle2, Circle, 
  ChevronRight, Loader2, Crown, Lock as LockIcon, Shield, CreditCard, X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import CheckoutModal from '@/app/components/CheckoutModal';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  subject: string;
  category: string;
  instructor: string;
  lessonCount: number;
  price: number;
  isEnrolled: boolean;
  isOwned: boolean;
  progress?: {
    percentage: number;
    completedLessons: number;
    totalLessons: number;
    lastWatchedLessonId: string;
  } | null;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [demoVideo, setDemoVideo] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('selectstart', preventSelect);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('keydown', handleKeyDown);
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
    if (e.ctrlKey && (e.key === 's' || e.key === 'p')) {
      e.preventDefault();
    }
  };

  const loadCourses = async () => {
    try {
      const [{ data: coursesData }, { data: configData }] = await Promise.all([
        coursesAPI.getCourses(),
        settingsAPI.getConfig()
      ]);
      setCourses(coursesData);
      setConfig(configData);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (course: Course) => {
    setSelectedCourse(course);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-950 border border-ink-800/50 p-8 lg:p-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-[0.2em] font-mono">Premium Academy</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-black text-ink-100 leading-tight mb-4">
            Master Your Craft with <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Expert Courses</span>
          </h1>
          <p className="text-ink-400 text-base lg:text-lg max-w-xl leading-relaxed">
            Curated curriculum designed by top rankers and educators to accelerate your preparation journey with precision and depth.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-ink-800 pb-4">
        <h2 className="font-display text-xl font-bold text-ink-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-yellow-500" />
          Available Programs
          <span className="ml-2 px-2 py-0.5 bg-ink-800 text-ink-500 text-[10px] rounded-full font-mono uppercase tracking-widest">{courses.length} Total</span>
        </h2>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-24 glass-card border-dashed border-ink-800 bg-ink-900/20">
          <div className="w-20 h-20 bg-ink-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <LockIcon className="w-10 h-10 text-ink-600" />
          </div>
          <h3 className="text-ink-200 font-display text-xl font-bold mb-2">Vault is Currently Empty</h3>
          <p className="text-ink-500 text-sm max-w-xs mx-auto">Our content team is hard at work preparing premium modules. Check back soon for updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course} 
              onEnroll={() => handleEnroll(course)}
              isEnrolled={course.isEnrolled}
              config={config}
              onDemo={(videoId) => setDemoVideo(videoId)}
            />
          ))}
        </div>
      )}

      {selectedCourse && (
        <CheckoutModal 
          course={selectedCourse} 
          onClose={() => setSelectedCourse(null)} 
          onSuccess={() => {
            loadCourses();
            setSelectedCourse(null);
          }}
        />
      )}

      {/* Demo Video Modal */}
      {demoVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <button 
              onClick={() => setDemoVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${demoVideo}?autoplay=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onEnroll, isEnrolled, config, onDemo }: { 
  course: any; 
  onEnroll: () => void;
  isEnrolled: boolean;
  config: any;
  onDemo: (videoId: string) => void;
}) {
  const progress = course.progress;
  const pct = progress?.percentage || 0;

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEnroll();
  };

  const calculateEffectivePrice = () => {
    let price = course.price;
    // Course specific discount
    if (course.discountPrice && (!course.discountExpiry || new Date(course.discountExpiry) > new Date())) {
      price = course.discountPrice;
    }
    // Global discount
    if (config?.globalDiscount?.isActive) {
      const reduction = (price * config.globalDiscount.percentage) / 100;
      price = price - reduction;
    }
    return Math.max(0, Math.round(price));
  };

  const effectivePrice = calculateEffectivePrice();
  const hasDiscount = course.price > effectivePrice;

  return (
    <div className="group relative">
      <Link href={isEnrolled ? `/dashboard/courses/${course._id}` : '#'}>
        <div className={clsx(
          "glass-card overflow-hidden transition-all duration-500 flex flex-col h-full",
          isEnrolled 
            ? "hover:border-yellow-500/40 hover:shadow-[0_20px_50px_rgba(234,179,8,0.1)]" 
            : "hover:border-ink-600 hover:bg-ink-900/60"
        )}>
          {/* Thumbnail Wrapper */}
          <div className="relative aspect-[16/9] bg-ink-950 overflow-hidden">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ink-900 to-ink-950 text-ink-700">
                <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Preview Unavailable</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* Discount Badge */}
            {hasDiscount && !isEnrolled && (
              <div className="absolute top-3 left-3 px-2 py-1 bg-teal-500 text-ink-950 text-[10px] font-black rounded-lg shadow-lg animate-bounce">
                OFFER
              </div>
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                <Play className="w-3 h-3 fill-current" />
                {course.lessonCount || 0} Modules
              </div>
              <div className="px-2 py-1 bg-yellow-500/20 backdrop-blur-md rounded-lg text-[10px] font-bold text-yellow-400 border border-yellow-500/20 uppercase tracking-widest">
                {course.subject || 'General'}
              </div>
            </div>

            {!isEnrolled && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black shadow-xl">
                  <LockIcon className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>
          
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono font-bold text-ink-500 uppercase tracking-[0.2em]">{course.category || 'Professional'}</span>
                {isEnrolled && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-teal-400 uppercase tracking-widest">
                    <Shield className="w-3 h-3" /> Enrolled
                  </span>
                )}
              </div>
              
              <h3 className="text-base font-display font-bold text-ink-100 leading-tight mb-2 group-hover:text-yellow-500 transition-colors">
                {course.title}
              </h3>
              
              <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed mb-4">
                {course.description || "Master the core concepts of this subject with our structured curriculum."}
              </p>
            </div>
            
            {isEnrolled ? (
              <div className="mt-auto pt-4 border-t border-ink-800/50">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-[9px] font-mono text-ink-500 uppercase tracking-widest mb-1">Your Progress</p>
                    <p className="text-xs font-bold text-ink-200">
                      {progress?.completedLessons || 0} <span className="text-ink-500 font-normal">/ {progress?.totalLessons || course.lessonCount} Lessons</span>
                    </p>
                  </div>
                  <span className="text-sm font-black text-yellow-500">{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden border border-ink-800/30">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(234,179,8,0.3)]" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            ) : (
              <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                <div className="shrink-0">
                  <p className="text-[9px] font-mono text-ink-500 uppercase tracking-widest">Investment</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-ink-100">
                      {effectivePrice === 0 ? "FREE" : `₹${effectivePrice}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-1">
                  {course.previewVideoId && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDemo(course.previewVideoId);
                      }}
                      className="flex-1 px-4 py-3 bg-ink-800 hover:bg-ink-700 text-white font-black rounded-xl transition-all border border-ink-700 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                    >
                      <Play className="w-3.5 h-3.5" /> Demo
                    </button>
                  )}
                  <button 
                    onClick={handleEnrollClick}
                    className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-xl transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                  >
                    <Crown className="w-3.5 h-3.5" /> Unlock
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}