"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type ClipCardProps = {
  videoURL: string;
  start: number;
  end: number;
  summary: string;
  onDownload: () => void;
  isDownloading: boolean;
  dominantEmotion?: string;
  isFallback?: boolean;
  fallbackImage?: string;
  duration?: number;
  index?: number; // Added index property
};

const emotionMap: Record<string, { emoji: string; color: string }> = {
  anger: { emoji: "😠", color: "#dc2626" },
  joy: { emoji: "😄", color: "#facc15" },
  sadness: { emoji: "😢", color: "#3b82f6" },
  fear: { emoji: "😨", color: "#7c3aed" },
  disgust: { emoji: "🤢", color: "#22c55e" },
  surprise: { emoji: "😲", color: "#ec4899" },
  excitement: { emoji: "🤩", color: "#f97316" },
  neutral: { emoji: "😐", color: "#9ca3af" },
};


export const ClipCard: React.FC<ClipCardProps> = ({
  videoURL,
  start,
  end,
  summary,
  onDownload,
  isDownloading,
  dominantEmotion,
  isFallback = false,
  fallbackImage,
  duration,
  index,
}) => {
  const videoSrc = `${videoURL}#t=${start / 1000},${end / 1000}`;
  const emotion = dominantEmotion?.toLowerCase();
  const emotionInfo = emotion && emotionMap[emotion];
  
  // Calculate clip duration in seconds
  const clipDuration = (end - start) / 1000;
  
  // Create a default fallback image if none is provided
  const defaultFallbackImage = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Preview not available', canvas.width / 2, canvas.height / 2 - 15);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '16px sans-serif';
      ctx.fillText('Clip may be too short or corrupted', canvas.width / 2, canvas.height / 2 + 15);
      
      if (duration) {
        ctx.fillStyle = '#475569';
        ctx.font = '14px sans-serif';
        ctx.fillText(`Duration: ${duration.toFixed(1)}s`, canvas.width / 2, canvas.height / 2 + 45);
      }
      
      // Add EventSense AI watermark
      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.fillText('EventSense AI', canvas.width / 2, canvas.height - 20);
    }
    
    return canvas.toDataURL('image/png');
  }, [duration]);

  return (
    <motion.div
      className="relative group overflow-hidden rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index ? index * 0.1 : 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      
      {/* Card content */}
      <div className="relative z-10 bg-gradient-to-br from-gray-900/90 to-black/90 border border-white/10 rounded-lg overflow-hidden">
        {/* Video or fallback image with aspect ratio container */}
        <div className="relative aspect-video overflow-hidden">
          {isFallback ? (
            <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
              <Image 
                src={fallbackImage || defaultFallbackImage} 
                alt="Preview not available" 
                className="absolute inset-0 w-full h-full object-cover"
                fill
                sizes="100vw"
                priority={false}
              />
              <div className="absolute bottom-2 right-2 bg-red-500/70 text-white text-xs px-1.5 py-0.5 rounded-md">
                Too short
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video 
                src={videoSrc} 
                controls 
                className="absolute inset-0 w-full h-full object-cover" 
                preload="metadata"
                controlsList="nodownload nofullscreen"
                playsInline
              />
              
              {/* Duration badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {clipDuration.toFixed(1)}s
              </div>
            </div>
          )}
          
          {/* Emotion badge overlay */}
          {emotionInfo && (
            <div
              className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-white z-10 backdrop-blur-sm"
              style={{ backgroundColor: emotionInfo.color + "aa" }}
              aria-label={`Emotion: ${emotion}`}
            >
              <span title={emotion} className="text-base">{emotionInfo.emoji}</span>
              <span className="capitalize">{emotion}</span>
            </div>
          )}
        </div>
        
        {/* Bottom content */}
        <div className="p-3">
          {/* Summary text */}
          <p className="text-sm text-gray-200 line-clamp-2 mb-3 leading-snug">{summary}</p>
          
          {/* Download button */}
          <div className="flex justify-end">
            <button
              onClick={onDownload}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600/40 to-blue-800/40 hover:from-blue-600/60 hover:to-blue-800/60 text-white py-1.5 px-3 text-xs rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 flex items-center group"
              disabled={isDownloading}
            >
              {/* Button background glow effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/0 via-blue-400/30 to-blue-400/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
              
              {isDownloading ? (
                <>
                  <svg className="w-3 h-3 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="relative z-10">Download</span>
                  <span className="ml-1.5 text-[10px] bg-blue-500/30 px-1 py-0.5 rounded-sm">MP4</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
