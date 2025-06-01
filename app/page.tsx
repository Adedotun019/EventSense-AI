"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Transcript from "@/app/components/Transcript";
import Chapters from "@/app/components/Chapters";
import { generateClips, Clip } from "@/lib/clipper";
import { zipClips } from "@/lib/zipClips";
import { ClipCard } from "@/app/components/ClipCard";

// Types

type Chapter = {
  start: number;
  end: number;
  summary: string;
  dominantEmotion?: string;
  videoURL: string | null;
  isFallback?: boolean;
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

  // Spinner component removed as it's no longer used

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
      setChapters(data.chapters.map((chapter) => ({ ...chapter, videoURL: videoURL || "" })));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || "Unexpected error occurred");
      else setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [videoFile, videoURL]);

  const queueFFmpegTask = (task: () => Promise<Clip[]>) => {
    const newTask = ffmpegLock.then(() => task());
    ffmpegLock = newTask.catch(() => {}) as Promise<void>;
    return newTask;
  };

  const handleDownloadClip = useCallback(async (index: number) => {
    if (!videoFile || !chapters[index]) return;
    
    // Check if the clip is too short (less than 3 seconds)
    const clipDuration = (chapters[index].end - chapters[index].start) / 1000;
    if (clipDuration < 3) {
      setError(`Clip ${index + 1} is too short (${clipDuration.toFixed(1)}s). Clips must be at least 3 seconds long.`);
      return;
    }
    
    setDownloadingClip(index);
    try {
      const clips = await queueFFmpegTask(() => generateClips(videoFile, [chapters[index]]));
      
      // Check if the clip is a fallback (too short or corrupted)
      if (clips[0].isFallback) {
        setError(`Cannot download clip ${index + 1}. ${clips[0].error || 'Clip is too short or corrupted.'}`);
        return;
      }
      
      const url = URL.createObjectURL(clips[0].blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = clips[0].name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Clip download failed:", err);
      setError(`Failed to download clip: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
        const index = chapters.findIndex((ch) => currentTimeMs >= ch.start && currentTimeMs < ch.end);
        setActiveChapterIndex(index !== -1 ? index : null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [chapters]);

  if (videoURL) {
    return (
      <div className="min-h-screen tech-background text-white">
        <div className="min-h-screen container max-w-screen-lg mx-auto px-4 py-6">
          {/* Title at the top */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative text-center mb-6"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 neon-title relative z-10">
              EventSense AI
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-lg blur-sm opacity-30 -z-10"></div>
          </motion.div>
          
          {/* Animated tech particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-20" style={{ top: '15%', left: '25%', boxShadow: '0 0 20px 2px rgba(59, 130, 246, 0.5)', animation: 'pulse 5s infinite' }}></div>
            <div className="absolute w-3 h-3 bg-purple-500 rounded-full opacity-20" style={{ top: '35%', left: '85%', boxShadow: '0 0 20px 2px rgba(168, 85, 247, 0.5)', animation: 'pulse 7s infinite' }}></div>
            <div className="absolute w-2 h-2 bg-cyan-500 rounded-full opacity-20" style={{ top: '75%', left: '10%', boxShadow: '0 0 20px 2px rgba(34, 211, 238, 0.5)', animation: 'pulse 6s infinite' }}></div>
            <div className="absolute w-2 h-2 bg-pink-500 rounded-full opacity-20" style={{ top: '65%', left: '80%', boxShadow: '0 0 20px 2px rgba(236, 72, 153, 0.5)', animation: 'pulse 8s infinite' }}></div>
          </div>
          
          <motion.div 
            className="max-w-4xl mx-auto backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-lg p-4 sm:p-6 space-y-6 relative z-10" 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-black/80 rounded-xl -z-10"></div>
            <motion.section 
              className="space-y-6" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="max-w-md mx-auto">
                <video 
                  ref={videoRef} 
                  src={videoURL} 
                  controls 
                  className="w-full rounded-lg shadow-md aspect-video object-contain" 
                  controlsList="nodownload"
                  style={{ maxHeight: "200px" }}
                  preload="metadata"
                  playsInline
                  aria-label="Uploaded video preview" 
                />
              </div>
              <div className="flex justify-center">
                {loading ? (
                  <button 
                    className="bg-blue-600/30 text-white py-0.5 px-1.5 text-[9px] rounded-sm border border-blue-500/30 flex items-center cursor-default"
                    disabled
                  >
                    <svg className="w-2 h-2 mr-0.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span>Processing</span>
                    <span className="ml-0.5 text-[7px] bg-blue-500/20 px-0.5 rounded-sm">AI</span>
                  </button>
                ) : (
                  <button 
                    onClick={sendToTranscription} 
                    className="bg-emerald-600/30 hover:bg-emerald-600/40 text-white py-0.5 px-1.5 text-[9px] rounded-sm transition focus:outline-none border border-emerald-500/30 flex items-center"
                  >
                    <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Analyze Video</span>
                    <span className="ml-0.5 text-[7px] bg-emerald-500/20 px-0.5 rounded-sm">AI</span>
                  </button>
                )}
              </div>
            </motion.section>
            {error && (
              <motion.div 
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="line-clamp-2"><span className="font-semibold">Error:</span> {error}</div>
                </div>
              </motion.div>
            )}
            <Transcript transcript={transcript} emotion={chapters[0]?.dominantEmotion || null} />
            <Chapters chapters={chapters} activeChapterIndex={activeChapterIndex} jumpToTime={jumpToTime} formatTime={formatTime} />
            {chapters.length > 0 && (
              <motion.section 
                className="space-y-4" 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.4 }} 
                aria-labelledby="clips-heading"
              >
                <h2 id="clips-heading" className="text-sm font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Generated Video Clips</h2>
                <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                      isFallback={clip.isFallback}
                      duration={(clip.end - clip.start) / 1000}
                    />
                  ))}
                </div>
                {chapters.length > 1 && (
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleZipAllClips} 
                      className="bg-purple-600/30 hover:bg-purple-600/40 text-white py-0.5 px-1.5 text-[9px] rounded-sm transition focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/30 flex items-center"
                      disabled={isDownloadingAll}
                    >
                      {isDownloadingAll ? (
                        <>
                          <svg className="w-2 h-2 mr-0.5 animate-spin text-pink-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                          </svg>
                          <span>Zipping All</span>
                          <span className="ml-0.5 text-[7px] bg-pink-500/20 px-0.5 rounded-sm">ZIP</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-2 h-2 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download All</span>
                          <span className="ml-0.5 text-[7px] bg-purple-500/20 px-0.5 rounded-sm">ZIP</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.section>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen tech-background text-white flex flex-col relative">
      <div className="container max-w-screen-lg mx-auto px-4 py-6 flex flex-col min-h-screen">
        {/* Animated tech particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-1 h-1 bg-blue-500 rounded-full opacity-20" style={{ top: '10%', left: '20%', boxShadow: '0 0 10px 1px rgba(59, 130, 246, 0.5)', animation: 'pulse 4s infinite' }}></div>
          <div className="absolute w-2 h-2 bg-purple-500 rounded-full opacity-20" style={{ top: '30%', left: '80%', boxShadow: '0 0 10px 1px rgba(168, 85, 247, 0.5)', animation: 'pulse 6s infinite' }}></div>
          <div className="absolute w-1 h-1 bg-cyan-500 rounded-full opacity-20" style={{ top: '70%', left: '15%', boxShadow: '0 0 10px 1px rgba(34, 211, 238, 0.5)', animation: 'pulse 5s infinite' }}></div>
          <div className="absolute w-1 h-1 bg-pink-500 rounded-full opacity-20" style={{ top: '60%', left: '75%', boxShadow: '0 0 10px 1px rgba(236, 72, 153, 0.5)', animation: 'pulse 7s infinite' }}></div>
          <div className="absolute w-2 h-2 bg-emerald-500 rounded-full opacity-20" style={{ top: '85%', left: '50%', boxShadow: '0 0 10px 1px rgba(16, 185, 129, 0.5)', animation: 'pulse 8s infinite' }}></div>
        </div>
        
        {/* Title at the top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 neon-title relative z-10">
            EventSense AI
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-lg blur-sm opacity-30 -z-10"></div>
        </motion.div>
        
        <motion.main 
          className="text-center max-w-xl mx-auto space-y-6 z-10 flex-1 flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.p 
            className="text-sm sm:text-base text-zinc-300 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
          >
            Upload a video and let AI instantly find and clip the most emotional, powerful moments.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
          >
            <label
              htmlFor="video-upload"
              className="bg-cyan-600/30 hover:bg-cyan-600/40 text-white py-0.5 px-1.5 text-[9px] rounded-sm transition focus:outline-none border border-cyan-500/30 flex items-center cursor-pointer"
            >
              <svg
                className="w-2 h-2 mr-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span>Upload Video</span>
              <span className="ml-0.5 text-[7px] bg-cyan-500/20 px-0.5 rounded-sm">MP4</span>
            </label>
            <input
              type="file"
              id="video-upload"
              accept="video/*"
              className="hidden"
              onChange={handleUpload}
            />
          </motion.div>
        </motion.main>
        <motion.footer 
          className="mt-8 text-xs text-zinc-500 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeInOut" }}
        >
          Built with Next.js, Tailwind, and AssemblyAI
        </motion.footer>
      </div>
    </div>
  );
}
