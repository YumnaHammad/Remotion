"use client";

import { useEffect, useRef, useState } from "react";
import { TemplatePreview } from "@/features/shared/template-preview";

/** Loads Remotion Player only when the card scrolls into view. */
export function LazyTemplatePreview({
  compositionId,
  inputProps,
  className,
}: {
  compositionId: string;
  inputProps: Record<string, unknown>;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex min-h-[160px] items-center justify-center bg-black/90 p-2 sm:min-h-[180px] ${className ?? ""}`}
    >
      {visible ? (
        <TemplatePreview
          compositionId={compositionId}
          inputProps={inputProps}
          className="mx-auto w-full max-w-full"
        />
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-white/5" />
      )}
    </div>
  );
}
