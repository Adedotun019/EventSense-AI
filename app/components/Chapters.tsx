import React from "react";

interface Chapter {
  start: number;
  end: number;
  summary: string;
  dominantEmotion?: string;
}

interface ChaptersProps {
  chapters: Chapter[];
  activeChapterIndex: number | null;
  jumpToTime: (seconds: number) => void;
  formatTime: (ms: number) => string;
}

const emotionEmojiMap: Record<string, string> = {
  anger: "😠",
  joy: "😄",
  sadness: "😢",
  fear: "😨",
  disgust: "🤢",
  surprise: "😲",
  excitement: "🤩",
  neutral: "😐",
};

const Chapters: React.FC<ChaptersProps> = ({
  chapters,
  activeChapterIndex,
  jumpToTime,
  formatTime,
}) => {
  return (
    chapters.length > 0 && (
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-md border border-white/10">
        <h2 className="text-sm font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Highlights</h2>
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {chapters.map((ch, idx) => {
            const isActive = idx === activeChapterIndex;
            const emoji = ch.dominantEmotion
              ? emotionEmojiMap[ch.dominantEmotion.toLowerCase()] || "🎯"
              : "🎯";

            return (
              <li key={idx}>
                <button
                  onClick={() => jumpToTime(ch.start / 1000)}
                  className={`relative flex flex-col text-left w-full px-3 py-2 rounded-md transition-all duration-300 group focus:outline-none ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white font-semibold"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  {/* Time indicator */}
                  <span className="text-xs text-cyan-300 group-hover:text-cyan-200 flex items-center">
                    <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(ch.start)}
                  </span>
                  
                  {/* Summary with emotion */}
                  <span className="mt-0.5 text-gray-100 group-hover:text-white text-xs line-clamp-2">
                    {isActive && (
                      <span
                        aria-label="Active Chapter"
                        role="img"
                        className="mr-1"
                      >
                        {emoji}
                      </span>
                    )}
                    {ch.summary}
                  </span>
                  
                  {/* Subtle highlight effect for active item */}
                  {isActive && (
                    <div className="absolute inset-0 border border-blue-500/50 rounded-md pointer-events-none"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    )
  );
};

export default Chapters;
