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
      <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Highlights</h2>
        <ul className="space-y-3">
          {chapters.map((ch, idx) => {
            const isActive = idx === activeChapterIndex;
            const emoji = ch.dominantEmotion
              ? emotionEmojiMap[ch.dominantEmotion.toLowerCase()] || "🎯"
              : "🎯";

            return (
              <li key={idx}>
                <button
                  onClick={() => jumpToTime(ch.start / 1000)}
                  className={`flex flex-col text-left w-full px-4 py-3 rounded-md transition group focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    isActive
                      ? "bg-yellow-300 text-black font-semibold"
                      : "bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="text-sm text-gray-500 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white">
                    ▶ {formatTime(ch.start)}
                  </span>
                  <span>
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