import React from "react";
import { motion } from "framer-motion";

interface TranscriptProps {
  transcript: string | null;
  emotion?: string | null;
}

const Transcript: React.FC<TranscriptProps> = ({ transcript, emotion }) => {
  if (!transcript) return null;

  const emotionEmojiMap: { [key: string]: string } = {
    happy: "😊",
    angry: "😠",
    fearful: "😨",
    disgust: "🤢",
    sad: "😢",
    neutral: "😐",
    surprised: "😲",
  };

  const dominant = emotion?.toLowerCase();
  const emotionIcon = dominant ? emotionEmojiMap[dominant] || "🎭" : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      aria-label="Transcript section"
      className="bg-white/10 backdrop-blur-md p-4 rounded-lg shadow-md border border-white/10 transition-all max-w-3xl mx-auto mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center">
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
            Emotion: <span className="font-semibold capitalize">{dominant}</span>
          </span>
        )}
      </div>
      
      <div className="bg-white/5 rounded-lg p-3 border border-white/5">
        <p className="whitespace-pre-line text-gray-200 text-xs leading-relaxed max-h-40 overflow-y-auto">
          {transcript}
        </p>
      </div>
    </motion.section>
  );
};

export default Transcript;
