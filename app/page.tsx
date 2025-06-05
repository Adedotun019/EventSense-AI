"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
};

type TranscriptionResponse = {
  transcription: string;
  chapters: Chapter[];
};

export default function Home() {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
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
    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-3">
      <svg className="w-4 h-4 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
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
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data: TranscriptionResponse = await res.json();
      if (!res.ok) throw new Error(data?.transcription || "Failed to transcribe");
      setTranscript(data.transcription);
      setChapters(data.chapters);
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [videoFile]);

  const handleDownloadClip = useCallback(async (index: number) => {
    if (!videoFile || !chapters[index]) return;
    setDownloadingClip(index);
    try {
      const clips = await generateClips(videoFile, [chapters[index]]);
      const url = URL.createObjectURL(clips[0].blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = clips[0].name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Clip download failed:", err);
      setError("Failed to download clip. Please try again.");
    } finally {
      setDownloadingClip(null);
    }
  }, [videoFile, chapters]);

  const handleZipAllClips = async () => {
    if (!videoFile || chapters.length === 0) return;
    setIsDownloadingAll(true);
    try {
      const clips = await generateClips(videoFile, chapters);
      await zipClips(clips);
    } catch (error) {
      console.error("Error zipping clips:", error);
      setError("Failed to zip clips. Please try again.");
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
<main className="min-h-screen relative overflow-hidden dark:bg-black dark:text-white">
      {/* Background layers */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1581091012184-e48f4f9f9ef6?auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 to-black/95" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 space-y-6">
         <header className="text-center space-y-2 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold neon-title bg-clip-text text-transparent">
            EventSense AI
          </h1>
          <p className="text-sm text-gray-300">Automatically find and extract key moments from your videos with AI.</p>
        </header>
        
        

        <section className="flex flex-col items-center space-y-4">
           <div className="bg-black/30 p-4 rounded-lg w-full max-w-md text-center">
            <h3 className="text-sm font-semibold mb-1">Upload Your Video</h3>
            <p className="text-xs text-gray-400 mb-2">MP4, MOV, AVI (max 500MB)</p>
            <label htmlFor="video-upload" className="cursor-pointer">
              <div className="upload-button">Select Video File</div>
              <input type="file" id="video-upload" accept="video/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>

          {videoURL && (
            <div className="w-full space-y-3">
              <video ref={videoRef} src={videoURL} controls className="w-full aspect-video rounded-md" />
              {loading ? (
                <Spinner label="Transcribing..." />
              ) : (
                <button
                  onClick={sendToTranscription}
                  className="mx-auto bg-emerald-600 hover:bg-emerald-700 px-3 py-1 text-xs rounded transition disabled:opacity-50"
                  disabled={!videoFile}
                >
                  Analyze with AI
                </button>
              )}
            </div>
          )}
        </section>

        {error && (
          <div className="bg-red-600/20 border border-red-600/30 text-sm p-3 rounded">
            <p className="text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-100 hover:text-white mt-2">Dismiss</button>
          </div>
        )}

        <Transcript transcript={transcript} />

        <Chapters
          chapters={chapters}
          activeChapterIndex={activeChapterIndex}
          jumpToTime={jumpToTime}
          formatTime={formatTime}
        />

        {chapters.length > 0 && (
          <section className="space-y-4">
            <button
              onClick={handleZipAllClips}
              className="bg-purple-600 hover:bg-purple-700 text-xs px-3 py-1 rounded disabled:opacity-50 transition"
              disabled={isDownloadingAll}
            >
              {isDownloadingAll ? "Processing..." : "Download All Clips"}
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {chapters.map((chapter, idx) => (
                <ClipCard
                  key={idx}
                  index={idx}
                  videoURL={videoURL!}
                  start={chapter.start}
                  end={chapter.end}
                  summary={chapter.summary}
                  dominantEmotion={chapter.dominantEmotion}
                  onDownload={() => handleDownloadClip(idx)}
                  isDownloading={downloadingClip === idx}
                />
              ))}
            </div>
          </section>
        )}

        <footer className="pt-8 text-xs text-center text-gray-500">
          <p>© {new Date().getFullYear()} EventSense AI. Built with Next.js, Tailwind, and AssemblyAI.</p>
        </footer>
      </div>
    </main>
  );
}
