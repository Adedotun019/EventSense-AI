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
  error?: string;
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

      if (!res.ok) {
        throw new Error(data?.error || "Failed to transcribe");
      }

      setTranscript(data.transcription);
      setChapters(data.chapters.map((chapter) => ({ ...chapter, videoURL: videoURL || "" })));
    } catch (err: unknown) {
      console.error("Transcription error:", err);
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

    const clipDuration = (chapters[index].end - chapters[index].start) / 1000;
    if (clipDuration < 3) {
      setError(`Clip ${index + 1} is too short (${clipDuration.toFixed(1)}s). Clips must be at least 3 seconds long.`);
      return;
    }

    setDownloadingClip(index);
    try {
      const clips = await queueFFmpegTask(() => generateClips(videoFile, [chapters[index]]));

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

  return <></>; // keep empty, layout handled via latest design in other file
}
