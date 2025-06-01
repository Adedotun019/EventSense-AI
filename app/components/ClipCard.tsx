"use client";

import React from "react";
import { motion } from "framer-motion";

type ClipCardProps = {
  videoURL: string;
  start: number;
  end: number;
  summary: string;
  onDownload: () => void;
  isDownloading: boolean;
  dominantEmotion?: string;
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
}) => {
  const videoSrc = `${videoURL}#t=${start / 1000},${end / 1000}`;
  const emotion = dominantEmotion?.toLowerCase();
  const emotionInfo = emotion && emotionMap[emotion];

  return (
    <motion.div
      className="border rounded-lg p-4 shadow-lg bg-white/60 dark:bg-gray-900/70 transition-colors backdrop-blur"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <video src={videoSrc} controls className="w-full mb-4 rounded" preload="metadata" />
      <p className="text-sm text-gray-700 dark:text-gray-200">{summary}</p>

      {emotionInfo ? (
        <div
          className="mt-2 inline-flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full text-white"
          style={{ backgroundColor: emotionInfo.color }}
          aria-label={`Emotion: ${emotion}`}
        >
          <span title={emotion}>{emotionInfo.emoji}</span>
          <span className="capitalize">{emotion}</span>
        </div>
      ) : (
        <span className="mt-2 inline-block text-xs text-gray-400">No emotion detected</span>
      )}

      <button
        onClick={onDownload}
        className="mt-4 w-full bg-brand-primary hover:bg-indigo-700 text-white py-2 rounded transition focus:outline-none focus:ring-4 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isDownloading}
      >
        {isDownloading ? "Processing..." : "Download Clip"}
      </button>
    </motion.div>
  );
};
