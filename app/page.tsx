"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Transcript from "@/app/components/Transcript";
import Chapters from "@/app/components/Chapters";
import { generateClips } from "@/lib/clipper";
import { zipClips } from "@/lib/zipClips";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Chapter = {
  start: number;
  end: number;
  summary: string;
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
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-200 mt-4">
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
    <main className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-indigo-950 dark:via-gray-900 dark:to-black text-black dark:text-white px-4 py-10 font-sans transition-colors duration-500">
      <div className="max-w-4xl mx-auto backdrop-blur-md bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl shadow-lg p-10 space-y-10">

        <header className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-500 dark:text-blue-400 font-sans animate-fade-in">
            EventSense AI
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Upload a video. Let AI find the moments that matter most.
          </p>
        </header>

        <section aria-labelledby="upload-section" className="flex flex-col items-center space-y-4">
          <h2 id="upload-section" className="sr-only">Upload Section</h2>
          <label htmlFor="video-upload" className="cursor-pointer bg-brand-primary text-white px-4 py-2 rounded hover:bg-indigo-700 transition" aria-label="Upload a video file">
            Upload Video
          </label>
          <input type="file" id="video-upload" accept="video/*" className="hidden" onChange={handleUpload} />
          {videoURL && (
            <>
              <video ref={videoRef} src={videoURL} controls className="w-full rounded-lg shadow-lg" />
              {loading ? <Spinner label="Transcribing..." /> : (
                <button onClick={sendToTranscription} className="mt-4 px-6 py-2 bg-brand-secondary text-white rounded hover:bg-emerald-700 transition" aria-label="Start transcription">
                  Transcribe Video
                </button>
              )}
            </>
          )}
        </section>

        {error && (
          <div role="alert" className="bg-red-100 dark:bg-white/20 text-red-700 p-4 rounded-md shadow-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        <section aria-labelledby="transcript-section">
          <h2 id="transcript-section" className="sr-only">Transcript Section</h2>
          <Transcript transcript={transcript} />
        </section>

        <section aria-labelledby="chapters-section">
          <h2 id="chapters-section" className="sr-only">Chapters Section</h2>
          <Chapters
            chapters={chapters}
            activeChapterIndex={activeChapterIndex}
            jumpToTime={jumpToTime}
            formatTime={formatTime}
          />
        </section>

        {chapters.length > 0 && (
          <section aria-labelledby="download-buttons" className="mt-6 flex flex-wrap gap-4 justify-center">
            <h2 id="download-buttons" className="sr-only">Download Clips</h2>

            <button
              onClick={handleZipAllClips}
              className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded"
              disabled={isDownloadingAll}
              aria-label="Download all clips as a zip file"
            >
              {isDownloadingAll ? "Zipping Clips..." : "Download All Clips"}
            </button>

            {chapters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDownloadClip(idx)}
                className="bg-emerald-600 hover:bg-emerald-800 text-white px-4 py-2 rounded"
                aria-label={`Download Clip ${idx + 1}`}
              >
                {downloadingClip === idx ? "Downloading..." : `Download Clip ${idx + 1}`}
              </button>
            ))}
          </section>
        )}

        <footer className="pt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Built by Dotun with Next.js, Tailwind, and AssemblyAI
        </footer>
      </div>
    </main>
  );
}