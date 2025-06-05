import React, { useState } from "react";
import { motion } from "framer-motion";

interface TranscriptProps {
  transcript: string | null;
  emotion?: string | null;
}

const Transcript: React.FC<TranscriptProps> = ({ transcript, emotion }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!transcript) return null;

  const emotionEmojiMap: { [key: string]: string } = {
    happy: "😊",
    angry: "😠",
    fearful: "😨",
    disgust: "🤢",
    sad: "😢",
    neutral: "😐",
    surprised: "😲",
    joy: "😄",
    fear: "😨",
    excitement: "🤩",
  };

  const dominant = emotion?.toLowerCase();
  const emotionIcon = dominant ? emotionEmojiMap[dominant] || "🎭" : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      aria-label="Transcript section"
      className="bg-gradient-to-br from-black/40 to-blue-900/20 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/10 transition-all max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center">
          <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Transcript
          {emotionIcon && (
            <span
              role="img"
              aria-label={dominant}
              title={`Dominant emotion: ${dominant}`}
              className="ml-2 text-lg cursor-default select-none transition-transform hover:scale-110"
            >
              {emotionIcon}
            </span>
          )}
        </h2>
        
        {dominant && (
          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-200 border border-white/5 flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mr-1.5"></span>
            <span className="font-medium capitalize">{dominant}</span>
          </span>
        )}
      </div>
      
      <div className="relative">
        <div 
          className={`bg-black/30 rounded-lg p-4 border border-white/10 transition-all ${expanded ? 'max-h-96' : 'max-h-40'} overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`}
        >
          <p className="whitespace-pre-line text-gray-200 text-sm leading-relaxed">
            {transcript}
          </p>
        </div>
        
        {/* Gradient fade at bottom when collapsed */}
        {!expanded && transcript.length > 300 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none rounded-b-lg"></div>
        )}
        
        {/* Expand/collapse button */}
        {transcript.length > 300 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center mx-auto"
          >
            {expanded ? (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show Less
              </>
            ) : (
              <>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Show More
              </>
            )}
          </button>
        )}
      </div>
    </motion.section>
  );
};

export default Transcript;
