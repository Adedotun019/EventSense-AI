"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Transcript from "@/app/components/Transcript";
import Chapters from "@/app/components/Chapters";
import { generateClips } from "@/lib/clipper";
import { zipClips } from "@/lib/zipClips";
import { ClipCard } from "@/app/components/ClipCard";

type Chapter = {
  start: number;
  end: number;
  summary: string;
  dominantEmotion?: string;
  videoURL: string | null;
};

type TranscriptionResponse = {
  transcription: string;
  chapters: Chapter[];
};

let ffmpegLock = Promise.resolve();

export default function Home() {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadingClip, setDownloadingClip] = useState<number | null>(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoURL(url);
    setVideoFile(file);
    setTranscript(null);
    setChapters([]);
    setActiveChapterIndex(null);
    setError(null);
  }, []);

  const jumpToTime = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const Spinner = ({ label = "Loading..." }: { label?: string }) => (
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-200 mt-4 animate-pulse">
      <svg className="w-5 h-5 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span>{label}</span>
    </div>
  );

  const sendToTranscription = useCallback(async () => {
    if (!videoFile) return;
    const formData = new FormData();
    formData.append("file", videoFile);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data: TranscriptionResponse = await res.json();
      if (!res.ok) throw new Error(data?.transcription || "Failed to transcribe");

      setTranscript(data.transcription);
      setChapters(data.chapters.map(chapter => ({ ...chapter, videoURL: videoURL || "" })));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Unexpected error occurred");
      } else {
        setError("Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [videoFile, videoURL]);

  const queueFFmpegTask = (task: () => Promise<{ name: string; blob: Blob }[]>): Promise<{ name: string; blob: Blob }[]> => {
    const newTask = ffmpegLock.then(() => task());
    ffmpegLock = newTask.catch(() => {}) as Promise<void>;
    return newTask;
  };

  const handleDownloadClip = useCallback(async (index: number) => {
    if (!videoFile || !chapters[index]) return;
    setDownloadingClip(index);
    try {
      const clips = await queueFFmpegTask(() => generateClips(videoFile, [chapters[index]]));
      const url = URL.createObjectURL(clips[0].blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = clips[0].name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Clip download failed:", err);
    } finally {
      setDownloadingClip(null);
    }
  }, [videoFile, chapters]);

  const handleZipAllClips = async () => {
    if (!videoFile || chapters.length === 0) return;
    setIsDownloadingAll(true);
    try {
      const clips = await queueFFmpegTask(() => generateClips(videoFile, chapters));
      await zipClips(clips);
    } catch (error) {
      console.error("Error zipping clips:", error);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && chapters.length > 0) {
        const currentTimeMs = videoRef.current.currentTime * 1000;
        const index = chapters.findIndex(ch => currentTimeMs >= ch.start && currentTimeMs < ch.end);
        setActiveChapterIndex(index !== -1 ? index : null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [chapters]);

  return (
    <div className="animate-fade-in bg-background text-foreground transition-colors duration-500">
      <main className="min-h-screen px-4 py-12 font-sans">
        <motion.div
          className="max-w-4xl mx-auto backdrop-blur-md bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl shadow-lg p-8 sm:p-10 space-y-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.header
            className="text-center space-y-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-500 dark:text-blue-400">
              EventSense AI
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Upload a video. Let AI find the moments that matter most — with emotion.
            </p>
          </motion.header>

          <motion.section
            className="flex flex-col items-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            aria-labelledby="upload-heading"
          >
            <h2 id="upload-heading" className="sr-only">Video Upload</h2>
            <label 
              htmlFor="video-upload" 
              className="cursor-pointer bg-brand-primary text-white px-6 py-2 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('video-upload')?.click();
                }
              }}
            >
              Upload Video
            </label>
            <input 
              type="file" 
              id="video-upload" 
              accept="video/*" 
              className="hidden" 
              onChange={handleUpload}
              aria-describedby="upload-description"
            />
            <p id="upload-description" className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Select a video file to analyze and extract key moments
            </p>
            {videoURL && (
              <>
                <video 
                  ref={videoRef} 
                  src={videoURL} 
                  controls 
                  className="w-full rounded-lg shadow-md"
                  aria-label="Uploaded video preview"
                />
                {loading ? <Spinner label="Transcribing..." /> : (
                  <button
                    onClick={sendToTranscription}
                    className="mt-4 px-6 py-2 bg-brand-secondary text-white rounded hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Start AI transcription and analysis"
                  >
                    Transcribe Video
                  </button>
                )}
              </>
            )}
          </motion.section>

          {error && (
            <div className="bg-red-100 dark:bg-white/20 text-red-700 p-4 rounded-md shadow-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          <Transcript transcript={transcript} emotion={chapters[0]?.dominantEmotion || null} />
          <Chapters
            chapters={chapters}
            activeChapterIndex={activeChapterIndex}
            jumpToTime={jumpToTime}
            formatTime={formatTime}
          />

          {chapters.length > 0 && (
            <section aria-labelledby="clips-heading">
              <h2 id="clips-heading" className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
                Generated Video Clips
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 justify-center">
                {chapters.map((clip, idx) => (
                    <ClipCard
                      key={idx}
                      videoURL={videoURL || ""}
                      start={clip.start}
                      end={clip.end}
                      summary={clip.summary}
                      onDownload={() => handleDownloadClip(idx)}
                      isDownloading={downloadingClip === idx}
                      dominantEmotion={clip.dominantEmotion}
                    />
                ))}
              </div>
              
              {chapters.length > 1 && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleZipAllClips}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isDownloadingAll}
                    aria-label={`Download all ${chapters.length} clips as a ZIP file`}
                  >
                    {isDownloadingAll ? "Zipping Clips..." : "Download All Clips"}
                  </button>
                </div>
              )}
            </section>
          )}

          <footer className="pt-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Built by Dotun with ❤️ using Next.js, Tailwind, and AssemblyAI
          </footer>
        </motion.div>
      </main>
    </div>
  );
}
