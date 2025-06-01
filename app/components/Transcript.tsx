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
      className="bg-white/20 dark:bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-md transition-all max-w-4xl mx-auto mb-10"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
        Transcript{" "}
        {emotionIcon && (
          <span
            role="img"
            aria-label={dominant}
            title={`Dominant emotion: ${dominant}`}
            className="ml-3 text-2xl sm:text-3xl text-gray-800 dark:text-gray-300 cursor-default select-none transition-transform hover:scale-110"
          >
            {emotionIcon}
          </span>
        )}
      </h2>
      <p className="whitespace-pre-line text-gray-700 dark:text-gray-200 text-sm sm:text-base leading-relaxed">
        {transcript}
      </p>
    </motion.section>
  );
};

export default Transcript;