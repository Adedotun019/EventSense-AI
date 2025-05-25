import { useCallback } from "react";

interface Chapter {
  start: number;
  end: number;
  summary: string;
}

interface ChaptersProps {
  chapters: Chapter[];
  activeChapterIndex: number | null;
  jumpToTime: (seconds: number) => void;
  formatTime: (ms: number) => string;
}

const Chapters: React.FC<ChaptersProps> = ({ chapters, activeChapterIndex, jumpToTime, formatTime }) => {
  return (
    chapters.length > 0 && (
      <div className="bg-white/20 backdrop-blur-md p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Highlights</h2>
        <ul className="space-y-3">
          {chapters.map((ch, idx) => (
            <li key={idx}>
              <button
                onClick={() => jumpToTime(ch.start / 1000)}
                className={`flex flex-col text-left w-full px-4 py-3 rounded-md transition group ${
                  idx === activeChapterIndex
                    ? "bg-yellow-300 text-black font-semibold"
                    : "bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <span className="text-sm text-gray-500 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white">
                  ▶ {formatTime(ch.start)}
                </span>
                <span>{ch.summary}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

export default Chapters;
