import type React from "react";
import { BackgroundMusic } from "./components/BackgroundMusic";

type MusicProps = { musicUrl?: string };

/** Wrap any composition so musicUrl in inputProps plays during render and preview. */
export function withBackgroundMusic<P extends MusicProps>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const Wrapped: React.FC<P> = (props) => (
    <>
      <BackgroundMusic musicUrl={props.musicUrl} />
      <Component {...props} />
    </>
  );
  Wrapped.displayName = `WithMusic(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}
