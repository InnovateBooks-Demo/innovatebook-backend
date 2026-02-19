import React, { useState, useRef } from "react";
import {
  Play,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X,
} from "lucide-react";

/**
 * VideoWalkthrough - Reusable video walkthrough section for module detail pages
 * Now supports actual video playback with Pexels stock videos
 *
 * @param {string} title - Video title (e.g., "Multi-Bank Management Demo")
 * @param {string} description - Short description of video content
 * @param {string} duration - Video duration (e.g., "4 min")
 * @param {string} moduleName - Name of the module (e.g., "IB Capital")
 * @param {string} subModule - Name of the sub-module (e.g., "Banks Module")
 * @param {React.Component} Icon - Lucide icon component for the module
 * @param {string} videoUrl - URL to the video file
 * @param {string} posterUrl - URL to the video poster/thumbnail image
 * @param {string} category - Category for stock video fallback: 'finance' | 'business' | 'technology' | 'team' | 'analytics'
 */

// Stock video URLs from Pexels (free to use)
const stockVideos = {
  finance: {
    url: "https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/3129957/free-video-3129957.jpg?auto=compress&w=800",
  },
  business: {
    url: "https://videos.pexels.com/video-files/3252122/3252122-uhd_2560_1440_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/3252122/free-video-3252122.jpg?auto=compress&w=800",
  },
  technology: {
    url: "https://videos.pexels.com/video-files/5377684/5377684-uhd_2560_1440_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/5377684/pexels-photo-5377684.jpeg?auto=compress&w=800",
  },
  team: {
    url: "https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/3209828/free-video-3209828.jpg?auto=compress&w=800",
  },
  analytics: {
    url: "https://videos.pexels.com/video-files/7579962/7579962-uhd_2560_1440_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/7579962/pexels-photo-7579962.jpeg?auto=compress&w=800",
  },
  dashboard: {
    url: "https://videos.pexels.com/video-files/6963744/6963744-uhd_2560_1440_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/6963744/free-video-6963744.jpg?auto=compress&w=800",
  },
  office: {
    url: "https://videos.pexels.com/video-files/3255275/3255275-uhd_2560_1440_25fps.mp4",
    poster:
      "https://images.pexels.com/videos/3255275/free-video-3255275.jpg?auto=compress&w=800",
  },
};

const VideoWalkthrough = ({
  title,
  description,
  duration = "4 min",
  moduleName,
  subModule,
  Icon,
  videoUrl = null,
  posterUrl = null,
  category = "business",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Get video source (custom or stock)
  const stockVideo = stockVideos[category] || stockVideos.business;
  const finalVideoUrl = videoUrl || stockVideo.url;
  const finalPosterUrl = posterUrl || stockVideo.poster;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <PlayCircle className="h-6 w-6 text-[#033F99]" />
        <h2 className="text-3xl font-bold text-slate-900">Video Walkthrough</h2>
        <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full font-semibold">
          {duration}
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden aspect-video cursor-pointer group"
        onClick={togglePlay}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          poster={finalPosterUrl}
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          preload="metadata"
        >
          <source src={finalVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay when not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-opacity">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-4 animate-pulse">
              <Play className="h-12 w-12 text-[#033F99] ml-2" />
            </div>
            <h3 className="text-white text-2xl font-bold">{title}</h3>
            <p className="text-slate-300 mt-2">{description}</p>
            <p className="text-slate-400 text-sm mt-2">Click to play</p>
          </div>
        )}

        {/* Video Controls */}
        {isPlaying && (
          <div
            className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient overlay for controls */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Controls bar */}
            <div className="relative z-10 p-4 space-y-3">
              {/* Progress bar */}
              <div
                className="h-1 bg-white/30 rounded-full cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-[#033F99] rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Maximize className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Center play/pause indicator (brief flash) */}
        {isPlaying && showControls && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            onClick={togglePlay}
          >
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white ml-1" />
              )}
            </div>
          </div>
        )}

        {/* Module Branding */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
          <div className="w-10 h-10 bg-[#033F99] rounded-lg flex items-center justify-center shadow-lg">
            {Icon && <Icon className="h-5 w-5 text-white" />}
          </div>
          <div className="text-white">
            <p className="text-sm font-semibold">{moduleName}</p>
            <p className="text-xs text-slate-300">{subModule}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoWalkthrough;
