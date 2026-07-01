'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { coursesAPI } from '@/lib/api';
import {
  Play, Pause, Volume2, VolumeX,
  Maximize, Settings, CheckCircle2, Loader2, AlertTriangle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CF_WORKER_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL || '';

interface TelegramVideoPlayerProps {
  courseId: string;
  lessonId: string;
  channel: string;
  msgId: string;
  title: string;
  duration: string;
  isAlreadyCompleted?: boolean;
  onVideoEnd?: () => void;
  onComplete?: () => void;
  onProgress?: (seconds: number) => void;
}

export default function TelegramVideoPlayer({
  courseId,
  lessonId,
  channel,
  msgId,
  title,
  duration,
  isAlreadyCompleted = false,
  onVideoEnd,
  onComplete,
  onProgress
}: TelegramVideoPlayerProps) {
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasIncrementedViewRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const params = `channel=${encodeURIComponent(channel)}&msgId=${encodeURIComponent(msgId)}`;
  const backendStreamUrl = `${API_BASE}/videos/stream?${params}`;
  const cfStreamUrl = CF_WORKER_URL ? `${CF_WORKER_URL}/stream?${params}` : '';
  const videoSrc = cfStreamUrl || backendStreamUrl;

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setLoadError(false);
    setIsBuffering(true);
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.load();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [channel, msgId]);

  useEffect(() => {
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', preventSelect);

    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', preventSelect);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const preventRightClickReact = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const preventRightClick = (e: Event) => {
    e.preventDefault();
  };

  const preventSelect = (e: Event) => {
    e.preventDefault();
    return false;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
    }
    if (e.ctrlKey && e.key === 'c' && window.getSelection()?.toString()) {
      e.preventDefault();
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (onProgress) {
        onProgress(videoRef.current.currentTime);
      }
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setIsBuffering(false);
    }
  };

  const onPlay = () => {
    setIsPlaying(true);
    startProgressTracking();

    if (!hasIncrementedViewRef.current && !isAlreadyCompleted) {
      hasIncrementedViewRef.current = true;
      setTimeout(async () => {
        try {
          await coursesAPI.incrementLessonView(courseId, lessonId);
        } catch (err) {
          console.error('Failed to increment view:', err);
        }
      }, 10000);
    }
  };

  const onPause = () => {
    setIsPlaying(false);
    stopProgressTracking();
  };

  const onEnded = async () => {
    setIsPlaying(false);
    stopProgressTracking();
    if (!isCompleted && !isCompleting) {
      await markAsComplete();
    }
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  const onWaiting = () => setIsBuffering(true);
  const onCanPlay = () => setIsBuffering(false);
  const onError = () => {
    setLoadError(true);
    setIsBuffering(false);
  };

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      if (videoRef.current && onProgress) {
        onProgress(videoRef.current.currentTime);
      }
    }, 5000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const markAsComplete = async () => {
    if (isCompleting || isCompleted) return;
    setIsCompleting(true);
    try {
      await coursesAPI.markLessonComplete(courseId, lessonId);
      setIsCompleted(true);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    videoRef.current.currentTime = percent * videoDuration;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    videoRef.current.volume = percent / 100;
    setVolume(percent);
    if (percent === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const changeSpeed = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full bg-black rounded-xl overflow-hidden"
      onMouseMove={handleMouseMove}
      onContextMenu={preventRightClickReact}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        preload="auto"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onWaiting={onWaiting}
        onCanPlay={onCanPlay}
        onError={onError}
      />

      <div className="absolute top-0 left-0 p-3 z-30">
        <div className="px-4 py-3 bg-black rounded-lg">
          <span className="text-white text-base font-semibold">{title}</span>
        </div>
      </div>

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
          <div className="text-center px-6">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-bold mb-2">Video Load Failed</h3>
            <p className="text-ink-400 text-sm">
              Could not load video from Telegram. The link may be invalid or the bot lacks access.
            </p>
          </div>
        </div>
      )}

      {isBuffering && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      )}

      <div
        className={clsx(
          'absolute inset-0 flex items-center justify-center transition-opacity cursor-pointer',
          isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
        onClick={loadError ? undefined : togglePlay}
      >
        {!isPlaying && !loadError && (
          <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
        )}
      </div>

      <div
        className={clsx(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="space-y-2">
          <div
            className="h-1 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-red-500 rounded-full relative"
              style={{ width: `${(currentTime / videoDuration) * 100 || 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 bg-black/40 hover:bg-black/60 rounded text-white text-xs font-medium"
              >
                {playbackRate}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full mb-1 left-0 bg-ink-900 rounded shadow-xl border border-ink-500 overflow-hidden z-50">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={clsx(
                        'block w-full px-3 py-1.5 text-xs text-left hover:bg-ink-800',
                        playbackRate === rate ? 'text-red-500 font-medium' : 'text-white'
                      )}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              </button>

              <div
                className="w-20 h-1 bg-white/20 rounded-full cursor-pointer"
                onClick={handleVolumeChange}
              >
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${isMuted ? 0 : volume}%` }}
                />
              </div>
            </div>

            <div className="text-white text-xs font-mono">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Maximize className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-jade-500/90 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium">Completed</span>
        </div>
      )}

      {!isCompleted && !loadError && (
        <button
          onClick={markAsComplete}
          disabled={isCompleting}
          className="absolute top-4 right-4 px-3 py-1.5 bg-red-500/90 hover:bg-pink-200 rounded-lg flex items-center gap-2 transition-colors"
        >
          {isCompleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-ink-950" />
          )}
          <span className="text-ink-950 text-sm font-medium">Mark Complete</span>
        </button>
      )}
    </div>
  );
}
