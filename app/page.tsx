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
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mt-4 animate-pulse">
      <svg className="w-5 h-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          className="text-center space-y-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Main Title */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              EventSense AI
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              Upload a video. Let AI find the moments that matter most — with emotion.
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <label 
              htmlFor="video-upload" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('video-upload')?.click();
                }
              }}
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
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
            <p id="upload-description" className="text-gray-400 text-sm max-w-md mx-auto">
              Select a video file to analyze and extract key moments with AI-powered emotion detection
            </p>
          </motion.div>
        </motion.div>

        {/* Footer Credit */}
        <motion.footer
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p className="text-gray-500 text-sm">
            Built by Dotun with ❤️ using Next.js, Tailwind, and AssemblyAI
          </p>
        </motion.footer>
      </div>

      {/* Content Section - Only shown when video is uploaded */}
      {videoURL && (
        <div className="min-h-screen px-4 py-12">
          <motion.div
            className="max-w-6xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-12 space-y-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Video Player */}
            <motion.section
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <video 
                ref={videoRef} 
                src={videoURL} 
                controls 
                className="w-full rounded-2xl shadow-2xl"
                aria-label="Uploaded video preview"
              />
              
              {loading ? (
                <Spinner label="Transcribing and analyzing..." />
              ) : (
                <div className="flex justify-center">
                  <button
                    onClick={sendToTranscription}
                    className="px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/50"
                    aria-label="Start AI transcription and analysis"
                  >
                    <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Analyze with AI
                  </button>
                </div>
              )}
            </motion.section>

            {/* Error Display */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <strong className="font-semibold">Error:</strong> {error}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Transcript and Chapters */}
            <Transcript transcript={transcript} emotion={chapters[0]?.dominantEmotion || null} />
            <Chapters
              chapters={chapters}
              activeChapterIndex={activeChapterIndex}
              jumpToTime={jumpToTime}
              formatTime={formatTime}
            />

            {/* Generated Clips */}
            {chapters.length > 0 && (
              <motion.section
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                aria-labelledby="clips-heading"
              >
                <h2 id="clips-heading" className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Generated Video Clips
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="flex justify-center pt-8">
                    <button
                      onClick={handleZipAllClips}
                      className="px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={isDownloadingAll}
                      aria-label={`Download all ${chapters.length} clips as a ZIP file`}
                    >
                      {isDownloadingAll ? (
                        <>
                          <svg className="w-5 h-5 mr-2 inline animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          Zipping Clips...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download All Clips
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.section>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
