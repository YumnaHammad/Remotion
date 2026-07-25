import type { Layer, LayerType, Project, Track, TrackKind } from "@/types";
import { genId } from "@/lib/project-factory";

/** Map a layer type to the timeline track kind it belongs on. */
export function layerTypeToTrackKind(type: LayerType): TrackKind {
  switch (type) {
    case "audio":
      return "audio";
    case "text":
    case "caption":
      return "text";
    case "shape":
      return "shape";
    default:
      // video, image, gif, solid, collage, sticker, pattern, noise, lottie, three…
      return "video";
  }
}

function rangesOverlap(
  aStart: number,
  aDur: number,
  bStart: number,
  bDur: number
): boolean {
  return aStart < bStart + bDur && bStart < aStart + aDur;
}

function trackLabel(kind: TrackKind, index: number): string {
  switch (kind) {
    case "video":
      return `Pictures ${index}`;
    case "audio":
      return `Sound ${index}`;
    case "text":
      return `Words ${index}`;
    case "shape":
      return `Shapes ${index}`;
    case "caption":
      return `Captions ${index}`;
    case "effect":
      return `Effects ${index}`;
    default:
      return `Row ${index}`;
  }
}

function trackHeight(kind: TrackKind): number {
  if (kind === "audio") return 36;
  if (kind === "text" || kind === "caption") return 40;
  return 48;
}

/**
 * Place a layer on a free track of the right kind (no time overlap).
 * Creates Video 2 / Shape 1 / etc. when needed so new clips aren't stacked
 * invisibly on the same row.
 */
export function assignLayerToFreeTrack(
  project: Project,
  layer: Layer
): { layer: Layer; tracks: Track[] } {
  const kind = layerTypeToTrackKind(layer.type);
  let tracks = [...project.tracks];

  // Ensure at least one track of this kind exists
  const ofKind = () => tracks.filter((t) => t.kind === kind && !t.locked);

  if (ofKind().length === 0) {
    const created: Track = {
      id: genId(`t-${kind}`),
      name: trackLabel(kind, 1),
      kind,
      locked: false,
      muted: false,
      height: trackHeight(kind),
      volume: 1,
    };
    tracks = insertTrack(tracks, created);
  }

  const start = Math.max(0, layer.startFrame);
  const dur = Math.max(1, layer.durationInFrames);

  for (const track of ofKind()) {
    const busy = project.layers.some(
      (l) =>
        l.id !== layer.id &&
        l.trackId === track.id &&
        rangesOverlap(l.startFrame, l.durationInFrames, start, dur)
    );
    if (!busy) {
      return { layer: { ...layer, trackId: track.id }, tracks };
    }
  }

  // All existing tracks of this kind are occupied at this time — add a new row
  const index = tracks.filter((t) => t.kind === kind).length + 1;
  const created: Track = {
    id: genId(`t-${kind}`),
    name: trackLabel(kind, index),
    kind,
    locked: false,
    muted: false,
    height: trackHeight(kind),
    volume: 1,
  };
  tracks = insertTrack(tracks, created);
  return { layer: { ...layer, trackId: created.id }, tracks };
}

/** Keep tracks grouped: video → shape → text → caption → effect → audio */
function insertTrack(tracks: Track[], track: Track): Track[] {
  const order: TrackKind[] = [
    "video",
    "shape",
    "text",
    "caption",
    "effect",
    "audio",
  ];
  const kindRank = order.indexOf(track.kind);
  let insertAt = tracks.length;
  for (let i = 0; i < tracks.length; i++) {
    const r = order.indexOf(tracks[i].kind);
    if (r > kindRank) {
      insertAt = i;
      break;
    }
  }
  // After the last track of the same kind
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].kind === track.kind) insertAt = i + 1;
  }
  return [...tracks.slice(0, insertAt), track, ...tracks.slice(insertAt)];
}
