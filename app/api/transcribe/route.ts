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

const TRANSCRIBE_URL = "https://api.assemblyai.com/v2/transcript";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASSEMBLY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing AssemblyAI API key." }, { status: 500 });
    }

    const { upload_url } = await req.json();

    if (!upload_url) {
      return NextResponse.json({ error: "No upload_url provided." }, { status: 400 });
    }

    console.log("Starting transcription for:", upload_url);

    const transRes = await axios.post(
      TRANSCRIBE_URL,
      {
        audio_url: upload_url,
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
        console.log("Transcription completed.");
        break;
      }

      if (poll.data.status === "error") {
        console.error("Transcription error:", poll.data.error);
        return NextResponse.json({ error: poll.data.error }, { status: 500 });
      }

      console.log("Polling... current status:", poll.data.status);
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
        } catch (error) {
          console.error("Error analyzing sentiment:", error);
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
    let msg = "Unknown error.";
    if (err instanceof Error) msg = err.message;

    console.error("Error in /api/transcribe:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
