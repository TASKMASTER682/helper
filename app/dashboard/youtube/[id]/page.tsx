'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { youtubeCourseAPI } from '@/lib/api';
import { 
  ArrowLeft, Play, CheckCircle2, Circle, Clock, 
  ChevronRight, ChevronLeft, Loader2, Youtube, List
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Link from 'next/link';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Video {
  videoId: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: string;
  durationSeconds: number;
  position: number;
}

export default function YouTubePlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const loadCourse = useCallback(async () => {
    try {
      const { data } = await youtubeCourseAPI.getCourse(courseId);
      setCourse(data.course);
      setProgress(data.progress);
      
      if (data.progress?.lastWatchedVideoId && data.course.videos) {
        const idx = data.course.videos.findIndex((v: Video) => v.videoId === data.progress.lastWatchedVideoId);
        if (idx !== -1) setCurrentVideoIndex(idx);
      }
    } catch (err) {
      toast.error('Failed to load course');
      router.push('/dashboard/youtube');
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setPlayerReady(true);
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!playerReady || !course?.videos?.length) return;

    const currentVideo = course.videos[currentVideoIndex];
    if (!currentVideo) return;

    const initPlayer = () => {
      const container = document.getElementById('youtube-player');
      if (!container) return;

      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById(currentVideo.videoId);
      } else {
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: currentVideo.videoId,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            iv_load_policy: 3,
          },
          events: {
            onStateChange: onPlayerStateChange,
          },
        });
      }
    };

    setTimeout(initPlayer, 200);

    youtubeCourseAPI.updateWatched(courseId, currentVideo.videoId).catch(console.error);
  }, [playerReady, currentVideoIndex, course]);

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      handleVideoComplete();
    }
  };

  const handleVideoComplete = async () => {
    if (isCompleting || !course?.videos?.[currentVideoIndex]) return;
    
    setIsCompleting(true);
    const video = course.videos[currentVideoIndex];
    
    try {
      const { data } = await youtubeCourseAPI.markVideoComplete(courseId, video.videoId);
      setProgress(data.progress);
      setCourse(data.course);
      toast.success('Video marked as completed!');
      
      if (currentVideoIndex < course.videos.length - 1) {
        setCurrentVideoIndex(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleVideoClick = (index: number) => {
    if (index === currentVideoIndex && playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
    } else {
      setCurrentVideoIndex(index);
    }
  };

  const toggleComplete = async (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isCompleted = progress?.videos?.some((v: any) => v.videoId === video.videoId && v.completed);
    
    try {
      if (isCompleted) {
        const { data } = await youtubeCourseAPI.markVideoIncomplete(courseId, video.videoId);
        setProgress(data.progress);
      } else {
        const { data } = await youtubeCourseAPI.markVideoComplete(courseId, video.videoId);
        setProgress(data.progress);
      }
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const isVideoCompleted = (videoId: string) => {
    return progress?.videos?.some((v: any) => v.videoId === videoId && v.completed);
  };

  const goToNext = () => {
    if (currentVideoIndex < course.videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-ink-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-500">Course not found</p>
        <Link href="/dashboard/youtube" className="btn-primary mt-4 inline-block">
          Back to Courses
        </Link>
      </div>
    );
  }

  const currentVideo = course.videos[currentVideoIndex];
  const pct = progress?.percentage || 0;

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/youtube" className="p-2 hover:bg-ink-800 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-ink-400" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-ink-100 truncate">{course.title}</h1>
          <div className="flex items-center gap-3 text-xs font-mono text-ink-500 mt-1">
            <span className="flex items-center gap-1">
              <Youtube className="w-3 h-3 text-red-500" />
              {course.type === 'playlist' ? 'Playlist' : 'Video'}
            </span>
            <span className="flex items-center gap-1">
              <List className="w-3 h-3" />
              {currentVideoIndex + 1} / {course.videos.length}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-500" />
              {progress?.completedVideos || 0} completed
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-ink-950 rounded-full overflow-hidden">
          <div 
            className={clsx('h-full transition-all duration-300', 
              pct >= 70 ? 'bg-teal-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            )} 
            style={{ width: `${pct}%` }} 
          />
        </div>
        <span className="text-xs font-mono text-ink-400">{pct}%</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-0 overflow-hidden">
            <div ref={playerContainerRef} className="aspect-video bg-black">
              <div id="youtube-player" className="w-full h-full" />
            </div>
            
            <div className="p-4 border-t border-ink-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-ink-100 mb-1">
                    {currentVideo?.title}
                  </h2>
                  {currentVideo?.duration && (
                    <span className="text-xs font-mono text-ink-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {currentVideo.duration}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleVideoComplete}
                  disabled={isCompleting || isVideoCompleted(currentVideo?.videoId)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                    isVideoCompleted(currentVideo?.videoId)
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : 'bg-ink-800 text-ink-300 hover:bg-ink-700 border border-ink-700'
                  )}
                >
                  {isCompleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isVideoCompleted(currentVideo?.videoId) ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                  {isVideoCompleted(currentVideo?.videoId) ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-800">
                <button
                  onClick={goToPrev}
                  disabled={currentVideoIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-ink-400 hover:text-ink-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs font-mono text-ink-500">
                  Video {currentVideoIndex + 1} of {course.videos.length}
                </span>
                <button
                  onClick={goToNext}
                  disabled={currentVideoIndex === course.videos.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-ink-400 hover:text-ink-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card">
            <div className="p-3 border-b border-ink-800">
              <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                Course Content
              </h3>
            </div>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {course.videos.map((video: Video, index: number) => {
                const completed = isVideoCompleted(video.videoId);
                const isActive = index === currentVideoIndex;
                
                return (
                  <div
                    key={video.videoId}
                    onClick={() => handleVideoClick(index)}
                    className={clsx(
                      'p-3 flex items-start gap-3 cursor-pointer transition-all border-b border-ink-800/50',
                      isActive ? 'bg-ink-800/50' : 'hover:bg-ink-900/30'
                    )}
                  >
                    <button
                      onClick={(e) => toggleComplete(video, e)}
                      className="shrink-0 mt-0.5"
                    >
                      {completed ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-500" />
                      ) : isActive ? (
                        <Play className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-ink-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        'text-xs line-clamp-2',
                        completed ? 'text-ink-500' : isActive ? 'text-ink-100' : 'text-ink-400'
                      )}>
                        {video.title}
                      </p>
                      <span className="text-[10px] font-mono text-ink-600 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {video.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
