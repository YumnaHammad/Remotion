import React from "react";
import { AbsoluteFill, Img } from "remotion";

/** Optional brand logo — top-left corner on template compositions. */
export const BrandLogo: React.FC<{ logoUrl?: string; size?: number }> = ({
  logoUrl,
  size = 72,
}) => {
  if (!logoUrl) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 32, left: 32 }}>
        <Img
          src={logoUrl}
          style={{
            width: size,
            height: size,
            objectFit: "contain",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.35))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
