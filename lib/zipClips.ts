import JSZip from "jszip";
import { Clip } from "./clipper";

export async function zipClips(clips: Clip[]) {
  const zip = new JSZip();

  clips.forEach((clip) => {
    // Skip fallback clips (too short or corrupted)
    if (clip.isFallback) {
      console.log(`Skipping fallback clip: ${clip.name}`);
      return;
    }
    
    zip.file(clip.name, clip.blob);
  });

  const content = await zip.generateAsync({ type: "blob" });

  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "event_clips.zip";
  a.click();
  URL.revokeObjectURL(url);
}
