import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

import { analyzeSentiment } from "@/lib/analyzeSentiment";   // ⬅️ NEW

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


/* ───────────────────────────
   Environment & End-points
   ─────────────────────────── */
const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY;
const UPLOAD_URL       = "https://api.assemblyai.com/v2/upload";
const TRANSCRIBE_URL   = "https://api.assemblyai.com/v2/transcript";

if (!ASSEMBLY_API_KEY) {
  throw new Error("Missing AssemblyAI API key.  Add ASSEMBLY_API_KEY to .env.local");
}

/* ───────────────────────────
   POST /api/transcribe
   ─────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    /* 1. Grab file from form-data */
    const formData = await req.formData();
    const file     = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    /* 2. Upload the raw bytes to AssemblyAI */
    const buffer    = Buffer.from(await file.arrayBuffer());
    const uploadRes = await axios.post(UPLOAD_URL, buffer, {
      headers: {
        authorization: ASSEMBLY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
    });
    const uploadUrl = uploadRes.data.upload_url;

    /* 3. Kick off the transcription job */
    const transRes = await axios.post(
      TRANSCRIBE_URL,
      {
        audio_url      : uploadUrl,
        auto_chapters  : true,            // chapter detection
        sentiment_analysis: true,         // coarse sentiment from AssemblyAI
      },
      {
        headers: {
          authorization: ASSEMBLY_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    const transcriptId = transRes.data.id;

    /* 4. Poll until the job completes (max ~60 s) */
    let transcript: AssemblyAITranscript | null = null;
    for (let i = 0; i < 30; i++) {
      const poll = await axios.get(`${TRANSCRIBE_URL}/${transcriptId}`, {
        headers: { authorization: ASSEMBLY_API_KEY },
      });

      if (poll.data.status === "completed") {
        transcript = poll.data as AssemblyAITranscript;
        break;
      }
      if (poll.data.status === "error") {
        throw new Error(poll.data.error);
      }
      await new Promise(r => setTimeout(r, 2000)); // wait 2 s
    }

    if (!transcript) {
      return NextResponse.json({ error: "Transcription timed out." }, { status: 504 });
    }

    /* 5. Build chapter objects + Hugging-Face sentiment (fallback / refinement) */
    const sentimentResults = transcript.sentiment_analysis_results ?? [];

    const chapters = (transcript.chapters || []).map((ch) => {
      /* AssemblyAI coarse sentiment inside this chapter */
      const localSentiments = sentimentResults
        .filter((s: AssemblyAISentimentAnalysisResult) => s.start >= ch.start && s.end <= ch.end)
        .sort((a: AssemblyAISentimentAnalysisResult, b: AssemblyAISentimentAnalysisResult) => b.confidence - a.confidence);

      const dominant = localSentiments[0]?.sentiment as string | undefined;

      return {
        start           : ch.start,
        end             : ch.end,
        summary         : ch.summary,
        dominantEmotion : dominant ?? null,
      };
    });

    /* Optional extra pass with Hugging Face for a nicer label */
    const chapterPromises = chapters.map(async (ch) => {
      try {
        const hf = await analyzeSentiment(ch.summary);
        if (hf) ch.dominantEmotion = hf.toLowerCase();
      } catch {
        // silently ignore
      }
    });

    await Promise.all(chapterPromises);

    /* 6. Ship it back to the client */
    return NextResponse.json(
      {
        transcription: transcript.text || "",
        chapters,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    /* Normalise errors for the client */
    let msg: string;
    if (err instanceof Error) {
      msg = err.message;
    } else if (typeof err === 'string') {
      msg = err;
    } else {
      msg = "Unknown transcription error";
    }
    console.error("Transcription Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
