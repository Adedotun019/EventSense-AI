import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "/ffmpeg-core.js",
});

export async function generateClips(
  file: File,
  chapters: { start: number; end: number }[],
  setProgress?: (msg: string) => void
) {
  if (!ffmpeg.isLoaded()) {
    setProgress?.("Loading FFmpeg...");
    await ffmpeg.load();
  }

  const fileName = "input.mp4";
  ffmpeg.FS("writeFile", fileName, await fetchFile(file));

  const clips: { name: string; blob: Blob }[] = [];

  for (let i = 0; i < chapters.length; i++) {
    const start = (chapters[i].start / 1000).toFixed(2);
    const end = (chapters[i].end / 1000).toFixed(2);
    const duration = parseFloat(end) - parseFloat(start);
    const output = `clip_${i + 1}.mp4`;

    if (duration < 1) {
      console.warn(`⏭ Skipping clip ${i + 1} — too short (${duration}s)`);
      continue;
    }

    setProgress?.(`Processing clip ${i + 1}...`);

    await ffmpeg.run(
      "-i", fileName,
      "-ss", start,
      "-to", end,
      "-preset", "ultrafast",
      "-crf", "28",
      "-c:v", "libx264",
      "-c:a", "aac",
      output
    );

    const data = ffmpeg.FS("readFile", output);
    const uint8Array = new Uint8Array(data.buffer);
    const blob = new Blob([uint8Array.buffer as ArrayBuffer], { type: "video/mp4" });

    clips.push({ name: output, blob });
  }

  setProgress?.("Done!");
  return clips;
}
