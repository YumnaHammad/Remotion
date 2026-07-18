/** Trigger a browser download from a URL or Blob. */
export async function downloadExportFile(
  source: string | Blob,
  filename: string
): Promise<void> {
  const blob =
    typeof source === "string"
      ? await fetch(source, { cache: "no-store" }).then((r) => {
          if (!r.ok) {
            throw new Error(`Download failed (${r.status})`);
          }
          return r.blob();
        })
      : source;

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

/** Smooth progress while waiting on a long-running fetch. */
export function startExportProgress(onProgress: (value: number) => void): () => void {
  let value = 8;
  onProgress(value);
  const timer = window.setInterval(() => {
    value = Math.min(92, value + 2 + Math.random() * 4);
    onProgress(Math.round(value));
  }, 1200);
  return () => window.clearInterval(timer);
}
