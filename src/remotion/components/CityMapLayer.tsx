"use client";

import React, { useLayoutEffect, useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import type { CameraKeyframe } from "@/types/feature-stack";
import {
  defaultCityCameraPath,
  sampleCameraPath,
} from "@/lib/camera-path";
import * as THREE from "three";

export { defaultCityCameraPath } from "@/lib/camera-path";

function seededRand(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Building({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

export type CityMapLook = {
  sky?: string;
  fog?: string;
  ground?: string;
  road?: string;
  palette?: string[];
  buildingHeight?: number;
  density?: number;
};

function CityScene({ seed, look }: { seed: number; look?: CityMapLook }) {
  const sky = look?.sky ?? "#87b5d9";
  const fog = look?.fog ?? "#b8d4e8";
  const ground = look?.ground ?? "#4a5560";
  const road = look?.road ?? "#2d3340";
  const heightMul = look?.buildingHeight ?? 1;
  const density = look?.density ?? 1;

  const buildings = useMemo(() => {
    const rand = seededRand(seed);
    const list: Array<{
      key: string;
      position: [number, number, number];
      size: [number, number, number];
      color: string;
    }> = [];
    const palette =
      look?.palette?.length ?
        look.palette
      : [
          "#3d5a80",
          "#98c1d9",
          "#e0fbfc",
          "#293241",
          "#ee6c4d",
          "#5c677d",
        ];
    const step = density < 0.7 ? 2 : 1;
    for (let x = -8; x <= 8; x += step) {
      for (let z = -8; z <= 8; z += step) {
        if (Math.abs(x) < 1 && Math.abs(z) < 1) continue;
        if (rand() > Math.min(1, 0.55 + density * 0.5)) continue;
        const h = (0.8 + rand() * 5.5) * heightMul;
        const w = 0.5 + rand() * 0.6;
        const d = 0.5 + rand() * 0.6;
        list.push({
          key: `${x}-${z}`,
          position: [x * 1.4, h / 2, z * 1.4],
          size: [w, h, d],
          color: palette[Math.floor(rand() * palette.length)],
        });
      }
    }
    return list;
  }, [seed, look?.palette, heightMul, density]);

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[fog, 12, 42]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[8, 16, 6]}
        intensity={1.15}
        castShadow
        color="#fff5e0"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={ground} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[2.2, 40]} />
        <meshStandardMaterial color={road} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[40, 2.2]} />
        <meshStandardMaterial color={road} />
      </mesh>
      {buildings.map((b) => (
        <Building
          key={b.key}
          position={b.position}
          size={b.size}
          color={b.color}
        />
      ))}
    </>
  );
}

function CameraRig({ path }: { path: CameraKeyframe[] }) {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const cam = sampleCameraPath(path, frame);

  useLayoutEffect(() => {
    camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(cam.lookAt[0], cam.lookAt[1], cam.lookAt[2]);
  }, [camera, cam.position, cam.lookAt, cam.fov]);

  return null;
}

export interface CityMapLayerProps {
  seed?: number;
  cameraPath?: CameraKeyframe[];
  glbUrl?: string;
  look?: CityMapLook;
}

/**
 * 3D world background via @remotion/three.
 * Procedural city by default; look prop themes it from story prompts.
 */
export const CityMapLayer: React.FC<CityMapLayerProps> = ({
  seed = 42,
  cameraPath,
  look,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const path = cameraPath ?? defaultCityCameraPath(durationInFrames);
  const fade = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const initial = sampleCameraPath(path, 0);
  const sky = look?.sky ?? "#87b5d9";

  return (
    <AbsoluteFill style={{ opacity: fade, background: sky }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: initial.position, fov: initial.fov }}
      >
        <CameraRig path={path} />
        <CityScene seed={seed} look={look} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
