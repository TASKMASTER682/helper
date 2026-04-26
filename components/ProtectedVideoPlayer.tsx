'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { coursesAPI } from '@/lib/api';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, CheckCircle2, Loader2, AlertTriangle,
  ChevronLeft, ChevronRight, Eye, EyeOff, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ProtectedVideoPlayerProps {
  courseId: string;
  lessonId: string;
  initialVideoId: string;
  title: string;
  duration: string;
  isAlreadyCompleted?: boolean;
  onVideoEnd?: () => void;
  onComplete?: () => void;
  onProgress?: (seconds: number) => void;
}

export default function ProtectedVideoPlayer({
  courseId,
  lessonId,
  initialVideoId,
  title,
  duration,
  isAlreadyCompleted = false,
  onVideoEnd,
  onComplete,
  onProgress
}: ProtectedVideoPlayerProps) {
  const { user } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const videoIdRef = useRef(initialVideoId);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdateRef = useRef(0);
  
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showDevToolsWarning, setShowDevToolsWarning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    videoIdRef.current = initialVideoId;
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(initialVideoId);
    } else {
      initPlayer();
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [initialVideoId]);

  useEffect(() => {
    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', preventSelect);
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
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
      setShowDevToolsWarning(true);
      setTimeout(() => setShowDevToolsWarning(false), 3000);
    }
    if (e.ctrlKey && e.key === 'c' && window.getSelection()?.toString()) {
      e.preventDefault();
    }
  };

  const initPlayer = () => {
    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
        setTimeout(createPlayer, 100);
      };
    }
  };

  const createPlayer = () => {
    const container = document.getElementById('protected-player');
    if (!container) return;

    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      playerRef.current.loadVideoById(videoIdRef.current);
    } else {
      playerRef.current = new window.YT.Player('protected-player', {
        videoId: videoIdRef.current,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          showinfo: 0,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          widget_referrer: window?.location?.origin
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      });
    }
  };

  const onPlayerReady = (event: any) => {
    setPlayerReady(true);
    const duration = playerRef.current.getDuration();
    setVideoDuration(duration);
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      playerRef.current.setPlaybackRate(rate);
    }
    setShowSpeedMenu(false);
  };

  const hasIncrementedViewRef = useRef(false);

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressTracking();
      
      // Increment view count after 10 seconds of playback (UX Improvement)
      if (!hasIncrementedViewRef.current && !isAlreadyCompleted) {
        // Set to true immediately to prevent multiple timeouts from firing
        hasIncrementedViewRef.current = true;
        
        setTimeout(async () => {
          // Check if player is still playing after 10s
          if (playerRef.current && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
            try {
              await coursesAPI.incrementLessonView(courseId, lessonId);
            } catch (err) {
              console.error('Failed to increment view:', err);
              // Only reset if it's a transient error, but generally keep it true 
              // to avoid spamming if the user re-enters.
              // For now, we leave it as true to be safe.
            }
          } else {
            // Reset if they stopped playing before 10s so it can try again next time they play
            hasIncrementedViewRef.current = false;
          }
        }, 10000);
      }
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopProgressTracking();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      stopProgressTracking();
      handleVideoEnded();
    }
  };

  const startProgressTracking = () => {
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const current = playerRef.current.getCurrentTime();
        setCurrentTime(current);
        lastProgressUpdateRef.current = current;
        
        if (onProgress) {
          onProgress(current);
        }
      }
    }, 5000);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleVideoEnded = async () => {
    if (!isCompleted && !isCompleting) {
      await markAsComplete();
    }
    if (onVideoEnd) {
      onVideoEnd();
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
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const seek = (seconds: number) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(videoDuration, playerRef.current.getCurrentTime() + seconds));
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const newTime = percent * videoDuration;
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    playerRef.current.setVolume(percent);
    setVolume(percent);
    setIsMuted(percent === 0);
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
      <div id="protected-player" className="w-full h-full" />

      <div className="absolute top-0 left-0 p-3 z-30">
        <div className="px-4 py-3 bg-black rounded-lg">
          <span className="text-white text-base font-semibold">{title}</span>
        </div>
      </div>

      {!playerReady && (
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
        onClick={togglePlay}
      >
        {!isPlaying && (
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
              className="h-full bg-yellow-500 rounded-full relative"
              style={{ width: `${(currentTime / videoDuration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="absolute bottom-full mb-1 left-0 bg-ink-900 rounded shadow-xl border border-ink-700 overflow-hidden z-50">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={clsx(
                        'block w-full px-3 py-1.5 text-xs text-left hover:bg-ink-800',
                        playbackRate === rate ? 'text-yellow-500 font-medium' : 'text-white'
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

      {!isCompleted && (
        <button
          onClick={markAsComplete}
          disabled={isCompleting}
          className="absolute top-4 right-4 px-3 py-1.5 bg-yellow-500/90 hover:bg-yellow-500 rounded-lg flex items-center gap-2 transition-colors"
        >
          {isCompleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-ink-950" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-ink-950" />
          )}
          <span className="text-ink-950 text-sm font-medium">Mark Complete</span>
        </button>
      )}

      {showDevToolsWarning && (
        <div className="absolute inset-0 bg-red-900/90 flex items-center justify-center z-50">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-white text-lg font-bold mb-2">Developer Tools Detected</h3>
            <p className="text-white/70 text-sm">This action is not allowed. Your activity is being monitored.</p>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 p-2">
      </div>
    </div>
  );
}