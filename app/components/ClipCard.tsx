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
}) => {
  const videoSrc = `${videoURL}#t=${start / 1000},${end / 1000}`;
  const emotion = dominantEmotion?.toLowerCase();
  const emotionInfo = emotion && emotionMap[emotion];
  
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
      className="relative group overflow-hidden rounded-md shadow-md"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Card content */}
      <div className="relative z-10 bg-gray-900/80 border border-white/10 rounded-md">
        {/* Video or fallback image with aspect ratio container */}
        <div className="relative aspect-video rounded-t-md overflow-hidden shadow-sm" style={{ height: "80px" }}>
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
              <div className="absolute bottom-1 right-1 bg-red-500/70 text-white text-[8px] px-1 py-0.5 rounded-sm">
                Too short
              </div>
            </div>
          ) : (
            <video 
              src={videoSrc} 
              controls 
              className="absolute inset-0 w-full h-full object-cover" 
              preload="metadata"
              controlsList="nodownload nofullscreen"
              playsInline
            />
          )}
          {/* Emotion badge overlay */}
          {emotionInfo && (
            <div
              className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-medium rounded-sm text-white z-10"
              style={{ backgroundColor: emotionInfo.color + "cc" }}
              aria-label={`Emotion: ${emotion}`}
            >
              <span title={emotion}>{emotionInfo.emoji}</span>
              <span className="capitalize">{emotion}</span>
            </div>
          )}
        </div>
        
        {/* Bottom content */}
        <div className="p-1.5">
          {/* Summary text */}
          <p className="text-[10px] text-gray-200 line-clamp-2 mb-1.5 h-7">{summary}</p>
          
          {/* Download button */}
          <div className="flex justify-end">
            <button
              onClick={onDownload}
              className="bg-blue-600/30 hover:bg-blue-600/40 text-white py-0.5 px-1.5 text-[9px] rounded-sm transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/30 flex items-center"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <svg className="w-2 h-2 mr-0.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Processing</span>
                </>
              ) : (
                <>
                  <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                  <span className="ml-0.5 text-[7px] bg-blue-500/20 px-0.5 rounded-sm">MP4</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
