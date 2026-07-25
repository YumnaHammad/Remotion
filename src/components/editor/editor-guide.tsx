"use client";

import { useEffect, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "framekit-editor-guide-hidden";

const STEPS = [
  {
    n: "1",
    title: "Add",
    text: "Pick something from the left (photo, words, music…)",
  },
  {
    n: "2",
    title: "Select",
    text: "Click it on the timeline or in Your pieces (right)",
  },
  {
    n: "3",
    title: "Edit",
    text: "Change look, move it on the preview, or add voice to captions",
  },
  {
    n: "4",
    title: "Share",
    text: "Press Play to check, then Export when you’re happy",
  },
] as const;

/**
 * Friendly first-run strip so non-technical users know the editor flow.
 */
export function EditorGuide() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const show = () => {
    setHidden(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  if (hidden) {
    return (
      <div className="flex h-8 items-center justify-end border-b border-[var(--editor-border)] bg-[var(--editor-panel)] px-3">
        <button
          type="button"
          onClick={show}
          className="inline-flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/80"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          How do I edit?
        </button>
      </div>
    );
  }

  return (
    <div className="relative border-b border-sky-500/20 bg-sky-500/10 px-3 py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-sky-200">
          New here? Make a video in 4 easy steps
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-6 w-6 text-white/50 hover:bg-white/10 hover:text-white"
          onClick={dismiss}
          aria-label="Hide guide"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="flex gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500/30 text-[10px] font-bold text-sky-200">
              {s.n}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white">{s.title}</p>
              <p className="text-[10px] leading-snug text-white/55">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
