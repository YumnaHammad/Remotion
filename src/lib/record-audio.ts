/**
 * Helpers for microphone voice notes.
 *
 * MediaRecorder's webm blobs carry no duration metadata and no seek index, so
 * scrubbing/looping them on the timeline stutters. Decoding the blob and
 * re-encoding as 16-bit PCM WAV yields a fully seekable clip with an exact
 * duration, and whisper transcribes WAV directly.
 */

export async function blobToWavFile(
  blob: Blob,
  fileName: string
): Promise<{ file: File; durationSec: number }> {
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    return {
      file: new File([encodeWav(decoded)], fileName, { type: "audio/wav" }),
      durationSec: decoded.duration,
    };
  } finally {
    await ctx.close();
  }
}

function encodeWav(buffer: AudioBuffer): Blob {
  const frames = buffer.length;
  const sampleRate = buffer.sampleRate;

  const mono = new Float32Array(frames);
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < frames; i++) {
      mono[i] += data[i] / buffer.numberOfChannels;
    }
  }

  const dataSize = frames * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < frames; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([ab], { type: "audio/wav" });
}

/** Pick the best-supported MediaRecorder mime type for voice. */
export function pickRecorderMimeType(): string | undefined {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];
  return candidates.find(
    (t) =>
      typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
  );
}
