"use client";
import React from "react";

interface ClipCardProps {
  start: number;
  end: number;
  summary: string;
  onDownload: () => void;
  index: number;
}

export const ClipCard: React.FC<ClipCardProps> = ({
  start,
  end,
  summary,
  onDownload,
  index,
}) => {
  return (
    <div className="mb-4 border-b border-white/10 pb-4">
      <p className="text-sm italic text-gray-400 mb-1">
        ▶ {Math.floor(start / 1000)}s – {Math.floor(end / 1000)}s
      </p>
      <p className="text-sm mb-2 text-white">{summary}</p>

      <button
        onClick={onDownload}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
      >
        Download Clip {index + 1}
      </button>
    </div>
  );
};