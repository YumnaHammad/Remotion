import type { Layer } from "@/types";

const SPATIAL_TYPES = new Set([
  "text",
  "image",
  "video",
  "gif",
  "sticker",
  "shape",
  "collage",
]);

export function isSpatialLayer(layer: Layer): boolean {
  return SPATIAL_TYPES.has(layer.type);
}

export function layerVisibleAtFrame(layer: Layer, frame: number): boolean {
  if (layer.visible === false) return false;
  return (
    frame >= layer.startFrame &&
    frame < layer.startFrame + layer.durationInFrames
  );
}

/** Estimate on-canvas bounds in composition pixel space (center-origin). */
export function estimateLayerBounds(
  layer: Layer,
  compWidth: number,
  compHeight: number
): { width: number; height: number } {
  const scale = layer.transform.scale || 1;

  switch (layer.type) {
    case "text": {
      const fontSize = layer.textStyle?.fontSize ?? 48;
      const chars = layer.text?.length ?? 8;
      return {
        width: Math.min(compWidth * 0.92, chars * fontSize * 0.52) * scale,
        height: fontSize * 1.4 * scale,
      };
    }
    case "caption": {
      const words = layer.captions?.map((c) => c.text).join(" ") ?? "Captions";
      const chars = Math.min(48, Math.max(12, words.length));
      return {
        width: Math.min(compWidth * 0.82, chars * 22) * scale,
        height: 72 * scale,
      };
    }
    case "shape":
      return { width: 220 * scale, height: 220 * scale };
    case "sticker":
      return { width: 180 * scale, height: 180 * scale };
    default:
      return {
        width: compWidth * 0.55 * scale,
        height: compHeight * 0.55 * scale,
      };
  }
}

/** Captions default near the bottom; keep in sync with CaptionRenderer. */
const CAPTION_BOTTOM_PAD = 140;

/** Map composition-space center + transform to overlay pixel rect. */
export function layerOverlayRect(
  layer: Layer,
  compWidth: number,
  compHeight: number,
  displayWidth: number,
  displayHeight: number
) {
  const { width, height } = estimateLayerBounds(layer, compWidth, compHeight);
  const sx = displayWidth / compWidth;
  const sy = displayHeight / compHeight;
  const cx = displayWidth / 2 + layer.transform.x * sx;
  // Captions sit above the bottom edge; other layers are center-origin.
  const cy =
    layer.type === "caption"
      ? displayHeight -
        CAPTION_BOTTOM_PAD * sy -
        (height * sy) / 2 +
        layer.transform.y * sy
      : displayHeight / 2 + layer.transform.y * sy;
  return {
    left: cx - (width * sx) / 2,
    top: cy - (height * sy) / 2,
    width: width * sx,
    height: height * sy,
    centerX: cx,
    centerY: cy,
  };
}

export function displayDeltaToComposition(
  dx: number,
  dy: number,
  displayWidth: number,
  displayHeight: number,
  compWidth: number,
  compHeight: number
) {
  return {
    dx: (dx / displayWidth) * compWidth,
    dy: (dy / displayHeight) * compHeight,
  };
}

export function angleFromCenter(
  centerX: number,
  centerY: number,
  pointerX: number,
  pointerY: number
) {
  const rad = Math.atan2(pointerY - centerY, pointerX - centerX);
  return (rad * 180) / Math.PI + 90;
}
