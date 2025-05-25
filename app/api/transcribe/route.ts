import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const ASSEMBLY_API_KEY = process.env.ASSEMBLY_API_KEY!;
const UPLOAD_URL = "https://api.assemblyai.com/v2/upload";
const TRANSCRIBE_URL = "https://api.assemblyai.com/v2/transcript";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload video to AssemblyAI
    const uploadRes = await axios.post(UPLOAD_URL, buffer, {
      headers: {
        authorization: ASSEMBLY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
    });

    const uploadUrl = uploadRes.data.upload_url;

    // Request transcription with auto_chapters
    const transcriptRes = await axios.post(
      TRANSCRIBE_URL,
      {
        audio_url: uploadUrl,
        auto_chapters: true,
      },
      {
        headers: {
          authorization: ASSEMBLY_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const transcriptId = transcriptRes.data.id;

    // Poll transcription result
    let completedTranscript = null;
    for (let i = 0; i < 15; i++) {
      const pollRes = await axios.get(`${TRANSCRIBE_URL}/${transcriptId}`, {
        headers: { authorization: ASSEMBLY_API_KEY },
      });

      if (pollRes.data.status === "completed") {
        completedTranscript = pollRes.data;
        break;
      } else if (pollRes.data.status === "error") {
        throw new Error(pollRes.data.error);
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    if (!completedTranscript) {
      return NextResponse.json({ error: "Transcription timed out." }, { status: 504 });
    }

    return NextResponse.json(
      {
        transcription: completedTranscript.text || "",
        chapters: completedTranscript.chapters || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Transcription Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Transcription failed. " + (error.message || "Unknown error.") },
      { status: 500 }
    );
  }
}