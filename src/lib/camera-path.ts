import type { CameraKeyframe } from "@/types/feature-stack";

export function defaultCityCameraPath(
  durationInFrames: number
): CameraKeyframe[] {
  const d = Math.max(90, durationInFrames);
  return [
    { frame: 0, position: [10, 6, 14], lookAt: [0, 1.5, 0], fov: 52 },
    {
      frame: Math.floor(d * 0.35),
      position: [4, 3.5, 8],
      lookAt: [0, 1.2, 0],
      fov: 48,
    },
    {
      frame: Math.floor(d * 0.7),
      position: [-6, 5, 6],
      lookAt: [1, 1.5, -1],
      fov: 45,
    },
    { frame: d, position: [0, 8, 12], lookAt: [0, 0.5, 0], fov: 50 },
  ];
}

export function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function sampleCameraPath(
  path: CameraKeyframe[],
  frame: number
): {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
} {
  if (!path.length) {
    return { position: [0, 4, 14], lookAt: [0, 1, 0], fov: 50 };
  }
  if (frame <= path[0].frame) {
    return {
      position: path[0].position,
      lookAt: path[0].lookAt,
      fov: path[0].fov ?? 50,
    };
  }
  const last = path[path.length - 1];
  if (frame >= last.frame) {
    return {
      position: last.position,
      lookAt: last.lookAt,
      fov: last.fov ?? 50,
    };
  }
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = (frame - a.frame) / Math.max(1, b.frame - a.frame);
      const ease = t * t * (3 - 2 * t);
      return {
        position: lerp3(a.position, b.position, ease),
        lookAt: lerp3(a.lookAt, b.lookAt, ease),
        fov: (a.fov ?? 50) + ((b.fov ?? 50) - (a.fov ?? 50)) * ease,
      };
    }
  }
  return {
    position: last.position,
    lookAt: last.lookAt,
    fov: last.fov ?? 50,
  };
}
