"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRef, useState } from "react";

// Types - needed for transcription functionality
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Chapter = {
  start: number;
  end: number;
  summary: string;
  dominantEmotion?: string;
  videoURL: string | null;
  isFallback?: boolean;
};

export default function Home() {
  return <></>; // keep empty, layout handled via latest design in other file
}
