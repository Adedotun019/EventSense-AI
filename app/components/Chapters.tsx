import React from "react";
import { motion } from "framer-motion";

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
  if (chapters.length === 0) return null;
  
  return (
    <motion.div 
      className="bg-gradient-to-br from-black/40 to-blue-900/20 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Highlights
        </h2>
        
        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-200 border border-white/5">
          {chapters.length} moments
        </span>
      </div>
      
      <div className="bg-black/30 rounded-lg border border-white/10 overflow-hidden">
        <ul className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {chapters.map((ch, idx) => {
            const isActive = idx === activeChapterIndex;
            const emotion = ch.dominantEmotion?.toLowerCase();
            const emoji = emotion ? emotionEmojiMap[emotion] || "🎯" : "🎯";
            
            return (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="border-b border-white/5 last:border-b-0"
              >
                <button
                  onClick={() => jumpToTime(ch.start / 1000)}
                  className={`relative flex flex-col text-left w-full px-4 py-3 transition-all duration-300 group focus:outline-none ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white"
                      : "hover:bg-white/5"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <div className="flex items-center justify-between mb-1">
                    {/* Time indicator with emotion */}
                    <div className="flex items-center">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-gray-400'} mr-2`}></span>
                      <span className="text-xs font-medium text-cyan-300 group-hover:text-cyan-200 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(ch.start)}
                      </span>
                      
                      {emotion && (
                        <span
                          title={`Emotion: ${emotion}`}
                          className="ml-2 text-sm"
                          role="img"
                          aria-label={emotion}
                        >
                          {emoji}
                        </span>
                      )}
                    </div>
                    
                    {/* Play button */}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-500' : 'bg-white/10 group-hover:bg-white/20'
                    } transition-colors`}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <p className="text-gray-200 group-hover:text-white text-sm line-clamp-2">
                    {ch.summary}
                  </p>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500"></div>
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
};

export default Chapters;
