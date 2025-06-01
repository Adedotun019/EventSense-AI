import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({
  log: true,
  corePath: "/ffmpeg-core.js",
});

// Create a default thumbnail for broken clips
async function createDefaultThumbnail(): Promise<Blob> {
  // Create a canvas with a gradient background and text
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Preview not available', canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.fillText('Clip may be too short or corrupted', canvas.width / 2, canvas.height / 2 + 15);
    
    // Add EventSense AI watermark
    ctx.fillStyle = '#475569';
    ctx.font = '12px sans-serif';
    ctx.fillText('EventSense AI', canvas.width / 2, canvas.height - 20);
  }
  
  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob([], { type: 'image/png' }));
    }, 'image/png');
  });
}

// Define a more comprehensive type for clips
export type Clip = {
  name: string;
  blob: Blob;
  isFallback?: boolean;
  duration?: number;
  error?: string;
};

export async function generateClips(
  file: File,
  chapters: { start: number; end: number }[],
  setProgress?: (msg: string) => void
): Promise<Clip[]> {
  // Check if the video is at least 3 seconds long
  if (file.size === 0) {
    throw new Error("The uploaded file is empty.");
  }
  
  // Create a temporary URL to get video duration
  const videoURL = URL.createObjectURL(file);
  const video = document.createElement('video');
  
  try {
    const videoDuration = await new Promise<number>((resolve, reject) => {
      video.onloadedmetadata = () => resolve(video.duration);
      video.onerror = () => reject(new Error("Could not load video metadata"));
      video.src = videoURL;
    });
    
    if (videoDuration < 3) {
      URL.revokeObjectURL(videoURL);
      throw new Error("Video must be at least 3 seconds long.");
    }
  } catch (error) {
    URL.revokeObjectURL(videoURL);
    throw error;
  } finally {
    URL.revokeObjectURL(videoURL);
  }

  if (!ffmpeg.isLoaded()) {
    setProgress?.("Loading FFmpeg...");
    await ffmpeg.load();
  }

  const fileName = "input.mp4";
  ffmpeg.FS("writeFile", fileName, await fetchFile(file));

  const clips: Clip[] = [];
  const defaultThumbnail = await createDefaultThumbnail();

  for (let i = 0; i < chapters.length; i++) {
    const start = (chapters[i].start / 1000).toFixed(2);
    const end = (chapters[i].end / 1000).toFixed(2);
    const duration = parseFloat(end) - parseFloat(start);
    const output = `clip_${i + 1}.mp4`;

    // Skip clips shorter than 3 seconds
    if (duration < 3) {
      console.warn(`⏭ Skipping clip ${i + 1} — too short (${duration}s)`);
      
      // Add a placeholder clip with default thumbnail
      clips.push({ 
        name: output, 
        blob: defaultThumbnail,
        isFallback: true,
        duration: duration
      });
      continue;
    }

    setProgress?.(`Processing clip ${i + 1}...`);

    try {
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

      clips.push({ name: output, blob, isFallback: false });
    } catch (error) {
      console.error(`Error processing clip ${i + 1}:`, error);
      
      // Add a placeholder clip with default thumbnail
      clips.push({ 
        name: output, 
        blob: defaultThumbnail,
        isFallback: true,
        error: String(error)
      });
    }
  }

  setProgress?.("Done!");
  return clips;
}
