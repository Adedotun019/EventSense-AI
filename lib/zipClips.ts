import JSZip from "jszip";

export async function zipClips(clips: { name: string; blob: Blob }[]) {
  const zip = new JSZip();

  clips.forEach(({ name, blob }) => {
    zip.file(name, blob);
  });

  const content = await zip.generateAsync({ type: "blob" });

  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = url;
  a.download = "event_clips.zip";
  a.click();
  URL.revokeObjectURL(url);
}