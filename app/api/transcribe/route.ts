import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { analyzeSentiment } from "@/lib/analyzeSentiment";

interface AssemblyAITranscript {
  id: string;
  text: string;
  chapters: AssemblyAIChapter[];
  sentiment_analysis_results: AssemblyAISentimentAnalysisResult[];
}

interface AssemblyAIChapter {
  start: number;
  end: number;
  summary: string;
}

interface AssemblyAISentimentAnalysisResult {
  start: number;
  end: number;
  sentiment: string;
  confidence: number;
}

const UPLOAD_URL = "https://api.assemblyai.com/v2/upload";
const TRANSCRIBE_URL = "https://api.assemblyai.com/v2/transcript";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASSEMBLY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing AssemblyAI API key.' }, { status: 500 });
    }
    
    console.log("Request received for transcription");
const formData = await req.formData();
    const file = formData.get("file") as File | null;
console.log("File received:", file);
    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 500MB." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadRes = await axios.post(UPLOAD_URL, buffer, {
      headers: {
        authorization: apiKey,
        "Content-Type": "application/octet-stream",
      },
    });
    const uploadUrl = uploadRes.data.upload_url;
console.log("Upload URL:", uploadUrl);

    const transRes = await axios.post(
      TRANSCRIBE_URL,
      {
        audio_url: uploadUrl,
        auto_chapters: true,
        sentiment_analysis: true,
      },
      {
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    const transcriptId = transRes.data.id;
    console.log("Transcript ID:", transcriptId);

    let transcript: AssemblyAITranscript | null = null;
    for (let i = 0; i < 60; i++) {
      const poll = await axios.get(`${TRANSCRIBE_URL}/${transcriptId}`, {
        headers: { authorization: apiKey },
      });

      if (poll.data.status === "completed") {
        transcript = poll.data as AssemblyAITranscript;
        console.log("Transcription completed:", transcript);
        break;
      }
      if (poll.data.status === "error") {
        console.error("Transcription error:", poll.data.error);
        throw new Error(poll.data.error);
      }
      console.log("Polling transcript status:", poll.data.status);
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!transcript) {
      return NextResponse.json({ error: "Transcription timed out." }, { status: 504 });
    }

    const sentimentResults = transcript.sentiment_analysis_results ?? [];

    const chapters = (transcript.chapters || []).map((ch) => {
      const localSentiments = sentimentResults
        .filter((s) => s.start >= ch.start && s.end <= ch.end)
        .sort((a, b) => b.confidence - a.confidence);

      const dominant = localSentiments[0]?.sentiment;

      return {
        start: ch.start,
        end: ch.end,
        summary: ch.summary,
        dominantEmotion: dominant ?? null,
      };
    });

    await Promise.all(
      chapters.map(async (ch) => {
        try {
          const hf = await analyzeSentiment(ch.summary);
          if (hf) ch.dominantEmotion = hf.toLowerCase();
        } catch {
          // ignore errors
        }
      })
    );

    return NextResponse.json(
      {
        transcription: transcript.text || "",
        chapters,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    let msg: string;
    if (err instanceof Error) {
      msg = err.message;
    } else if (typeof err === "string") {
      msg = err;
    } else {
      msg = "Unknown transcription error";
    }
    console.error("Transcription Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
