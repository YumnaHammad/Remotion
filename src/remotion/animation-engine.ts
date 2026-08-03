import React from "react";
import { interpolate, spring, SpringConfig } from "remotion";
import type { CaptionTheme } from "./compositions/Captions";

export type AnimationStyleProfile = "minimal" | "dynamic" | "luxury" | "modern" | "energetic";
export type AnimationSpeedProfile = "slow" | "medium" | "fast";

export interface AnimationEngineConfig {
  styleProfile: AnimationStyleProfile;
  speedProfile: AnimationSpeedProfile;
}

export interface AnimationParams {
  mediaStyle: React.CSSProperties;
  captionTheme: CaptionTheme;
  captionStyle: React.CSSProperties;
  transitionOpacity: number;
}

/** Get transition duration in frames based on speed profile. */
export function getTransitionDuration(speed: AnimationSpeedProfile): number {
  switch (speed) {
    case "fast":
      return 8;
    case "slow":
      return 26;
    case "medium":
    default:
      return 15;
  }
}

/**
 * Dynamic Animation Engine for Video Motion and Transitions.
 * Calculates transforms, opacities, glow effects, and styles
 * based on current frame, total scene frames, and index.
 */
export function getAnimationParams(
  config: AnimationEngineConfig,
  frame: number,
  durationInFrames: number,
  sceneIndex: number,
  fps: number = 30
): AnimationParams {
  const { styleProfile = "dynamic", speedProfile = "medium" } = config;
  const transFrames = getTransitionDuration(speedProfile);

  // 1. Calculate Transition Opacity (Fade In / Out)
  let transitionOpacity = 1;
  if (styleProfile !== "minimal") {
    // Fade in at the start of the scene
    const fadeIn = interpolate(frame, [0, transFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    // Fade out at the end of the scene
    const fadeOut = interpolate(
      frame,
      [durationInFrames - transFrames, durationInFrames],
      [1, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    transitionOpacity = fadeIn * fadeOut;
  }

  // 2. Calculate Visual Zoom and Scale Transforms
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let rotate = 0;
  let filter = "";

  switch (styleProfile) {
    case "minimal":
      // Clean cuts, zero movement
      scale = 1;
      break;

    case "luxury": {
      // Ken burns zoom out: extremely slow, smooth, high-end look
      // Animates from 1.06 to 1.01 over the entire scene
      scale = interpolate(frame, [0, durationInFrames], [1.06, 1.01], {
        extrapolateRight: "clamp",
      });
      // Very slow pan right/down
      translateX = interpolate(frame, [0, durationInFrames], [-10, 10], {
        extrapolateRight: "clamp",
      });
      translateY = interpolate(frame, [0, durationInFrames], [-5, 5], {
        extrapolateRight: "clamp",
      });
      filter = `blur(${interpolate(frame, [0, transFrames], [8, 0], { extrapolateRight: "clamp" })}px)`;
      break;
    }

    case "modern": {
      // Crisp linear zoom-in from 1.0 to 1.08
      scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
        extrapolateRight: "clamp",
      });
      // Slide up transition overlay look
      translateY = interpolate(frame, [0, transFrames], [20, 0], {
        extrapolateRight: "clamp",
      });
      break;
    }

    case "energetic": {
      // Spring scale-up pop at the beginning
      const springConfig: SpringConfig = {
        mass: 0.8,
        damping: 11,
        stiffness: 110,
        overshootClamping: false,
      };
      
      const speedScaleMultiplier = speedProfile === "fast" ? 1.4 : speedProfile === "slow" ? 0.7 : 1;
      const springValue = spring({
        frame,
        fps,
        config: springConfig,
        durationInFrames: transFrames * 2,
      });

      scale = interpolate(springValue, [0, 1], [1.2 * speedScaleMultiplier, 1.0], {
        extrapolateRight: "clamp",
      });

      // Bouncy rotate shake at entry
      rotate = interpolate(springValue, [0, 1], [3 * speedScaleMultiplier, 0], {
        extrapolateRight: "clamp",
      });

      // Neon pulse glow filter
      const pulse = 10 + Math.sin(frame / 6) * 12;
      filter = `brightness(${interpolate(frame, [0, 10], [1.3, 1.0], { extrapolateRight: "clamp" })}) drop-shadow(0 0 ${pulse}px var(--primary-color, #0b84f3))`;
      break;
    }

    case "dynamic":
    default: {
      // Active zooming in from 1.12 to 1.0 (standard spring/ease look)
      scale = interpolate(frame, [0, durationInFrames], [1.12, 1.0], {
        extrapolateRight: "clamp",
      });
      // Slide in from left at scene index changes
      if (sceneIndex % 2 === 0) {
        translateX = interpolate(frame, [0, transFrames], [-40, 0], {
          extrapolateRight: "clamp",
        });
      } else {
        translateX = interpolate(frame, [0, transFrames], [40, 0], {
          extrapolateRight: "clamp",
        });
      }
      break;
    }
  }

  // 3. Caption styling profiles
  let captionTheme: CaptionTheme = "neon";
  let captionStyle: React.CSSProperties = {};

  switch (styleProfile) {
    case "minimal":
      captionTheme = "minimal";
      captionStyle = {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: "400",
        textTransform: "none",
        letterSpacing: "0px",
        fontSize: "24px",
      };
      break;

    case "luxury":
      captionTheme = "default";
      captionStyle = {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontStyle: "italic",
        fontWeight: "300",
        color: "#ffffff",
        textShadow: "0 2px 8px rgba(0,0,0,0.4)",
        textTransform: "none",
        fontSize: "30px",
      };
      break;

    case "modern":
      captionTheme = "karaoke";
      captionStyle = {
        fontFamily: "Montserrat, Helvetica, sans-serif",
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: "2px",
        fontSize: "28px",
      };
      break;

    case "energetic":
      captionTheme = "neon";
      captionStyle = {
        fontFamily: "Outfit, system-ui, sans-serif",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "1.5px",
        fontSize: "32px",
        animation: "pulse 1.5s infinite alternate",
      };
      break;

    case "dynamic":
    default:
      captionTheme = "neon";
      captionStyle = {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: "700",
        fontSize: "26px",
      };
      break;
  }

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${scale}) translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
    filter: filter || undefined,
  };

  return {
    mediaStyle,
    captionTheme,
    captionStyle,
    transitionOpacity,
  };
}
