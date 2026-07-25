/**
 * Client-side MediaPipe Face + Pose landmarker → Remotion puppet controls.
 * Runs in the browser (no server GPU required).
 */
import type { LandmarkFrame } from "@/types/feature-stack";

export type PuppetProgress = (pct: number, message: string) => void;

function dist(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Derive rig controls from MediaPipe face + pose landmark indices. */
export function landmarksToControls(
  face?: Array<{ x: number; y: number; z: number }>,
  pose?: Array<{ x: number; y: number; z: number; visibility?: number }>
): NonNullable<LandmarkFrame["controls"]> {
  const controls: NonNullable<LandmarkFrame["controls"]> = {};

  if (face && face.length >= 400) {
    // Face Landmarker topology (approx): lips upper/lower
    const upperLip = face[13];
    const lowerLip = face[14];
    const leftMouth = face[61];
    const rightMouth = face[291];
    const leftEye = face[33];
    const rightEye = face[263];
    const nose = face[1];

    if (upperLip && lowerLip) {
      const mouthH = dist(upperLip, lowerLip);
      const mouthW = leftMouth && rightMouth ? dist(leftMouth, rightMouth) : 0.05;
      controls.mouthOpen = clamp01((mouthH / Math.max(mouthW, 0.01) - 0.15) / 0.55);
    }
    if (leftMouth && rightMouth && upperLip) {
      // Smile: mouth corners raise relative to lip center
      const midY = upperLip.y;
      const cornerLift = midY - (leftMouth.y + rightMouth.y) / 2;
      controls.smile = clamp01(cornerLift * 12);
    }
    if (leftEye && rightEye && nose) {
      controls.headYaw = clamp01(0.5 + (nose.x - (leftEye.x + rightEye.x) / 2) * 4) * 2 - 1;
      controls.headPitch = clamp01(0.5 + (nose.y - (leftEye.y + rightEye.y) / 2) * 4) * 2 - 1;
    }
    // Brows approx
    const leftBrow = face[70];
    const rightBrow = face[300];
    if (leftBrow && rightBrow && leftEye && rightEye) {
      const raise =
        ((leftEye.y - leftBrow.y) + (rightEye.y - rightBrow.y)) / 2;
      controls.browRaise = clamp01((raise - 0.02) / 0.06);
    }
  }

  if (pose && pose.length >= 17) {
    // BlazePose: 11 L shoulder, 12 R shoulder, 13 L elbow, 14 R elbow
    const ls = pose[11];
    const rs = pose[12];
    const le = pose[13];
    const re = pose[14];
    if (ls && le) {
      controls.armLeft = clamp01((ls.y - le.y + 0.1) / 0.4);
    }
    if (rs && re) {
      controls.armRight = clamp01((rs.y - re.y + 0.1) / 0.4);
    }
  }

  return controls;
}

/**
 * Extract landmark frames from a video File/Blob at the given fps sample rate.
 */
export async function extractPuppetLandmarks(
  videoSource: File | Blob | string,
  options?: {
    fps?: number;
    maxFrames?: number;
    onProgress?: PuppetProgress;
  }
): Promise<LandmarkFrame[]> {
  const fps = options?.fps ?? 15;
  const maxFrames = options?.maxFrames ?? 450;
  const onProgress = options?.onProgress;

  onProgress?.(5, "Loading MediaPipe models…");

  const vision = await import("@mediapipe/tasks-vision");
  const { FaceLandmarker, PoseLandmarker, FilesetResolver } = vision;

  const wasm = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  const faceLandmarker = await FaceLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.tflite",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numFaces: 1,
  });

  const poseLandmarker = await PoseLandmarker.createFromOptions(wasm, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.tflite",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });

  onProgress?.(15, "Decoding video…");

  const url =
    typeof videoSource === "string"
      ? videoSource
      : URL.createObjectURL(videoSource);

  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Failed to load reference video"));
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const duration = video.duration || 1;
  const totalSamples = Math.min(maxFrames, Math.ceil(duration * fps));
  const frames: LandmarkFrame[] = [];

  for (let i = 0; i < totalSamples; i++) {
    const t = (i / fps);
    if (t > duration) break;
    video.currentTime = t;
    await new Promise<void>((resolve) => {
      const onSeek = () => {
        video.removeEventListener("seeked", onSeek);
        resolve();
      };
      video.addEventListener("seeked", onSeek);
    });

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const ts = t * 1000;
    const faceResult = faceLandmarker.detectForVideo(video, ts);
    const poseResult = poseLandmarker.detectForVideo(video, ts);

    const face = faceResult.faceLandmarks?.[0]?.map((p) => ({
      x: p.x,
      y: p.y,
      z: p.z,
    }));
    const pose = poseResult.landmarks?.[0]?.map((p) => ({
      x: p.x,
      y: p.y,
      z: p.z,
      visibility: p.visibility,
    }));

    const remotionFrame = Math.round(t * 30);
    frames.push({
      frame: remotionFrame,
      face,
      pose,
      controls: landmarksToControls(face, pose),
    });

    if (i % 5 === 0) {
      onProgress?.(
        15 + Math.round((i / totalSamples) * 80),
        `Tracking frame ${i + 1}/${totalSamples}`
      );
    }
  }

  faceLandmarker.close();
  poseLandmarker.close();
  if (typeof videoSource !== "string") URL.revokeObjectURL(url);

  onProgress?.(100, "Done");
  return frames;
}
