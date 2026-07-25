"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  fetchTranscriptionStatus,
  loadTranscriptionEngine,
  saveTranscriptionEngine,
  type TranscriptionEngine,
} from "@/lib/transcribe-client";
import { cn } from "@/lib/utils";

interface TranscriptionEngineToggleProps {
  value?: TranscriptionEngine;
  onChange?: (engine: TranscriptionEngine) => void;
  className?: string;
}

/**
 * Speech-to-text settings. Advanced details stay collapsed for beginners.
 */
export function TranscriptionEngineToggle({
  value,
  onChange,
  className,
}: TranscriptionEngineToggleProps) {
  const [engine, setEngine] = useState<TranscriptionEngine>(
    value ?? loadTranscriptionEngine()
  );
  const [status, setStatus] = useState<{
    whisperCpp: boolean;
    fasterWhisper: boolean;
  } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value) setEngine(value);
  }, [value]);

  useEffect(() => {
    fetchTranscriptionStatus().then((s) => {
      if (s) setStatus({ whisperCpp: s.whisperCpp, fasterWhisper: s.fasterWhisper });
    });
  }, []);

  const setEngineAndPersist = (next: TranscriptionEngine) => {
    setEngine(next);
    saveTranscriptionEngine(next);
    onChange?.(next);
  };

  const useFasterWhisper = engine === "faster-whisper";
  const ready =
    useFasterWhisper ? status?.fasterWhisper : status?.whisperCpp;

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-white/10 bg-white/5 p-3",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div>
          <p className="text-xs font-medium text-white/80">
            Speech → text settings
          </p>
          <p className="text-[10px] text-white/40">
            {ready === false
              ? "Not set up yet — tap to see how"
              : "Usually you can leave this alone"}
          </p>
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/40" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/40" />
        )}
      </button>

      {open && (
        <>
          <p className="text-[10px] text-white/45">
            Chooses how Framekit listens to speech when you turn audio into
            captions. Prefer “Fast” if both work.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-white/70">Built-in</Label>
              {status && (
                <Badge
                  variant={status.whisperCpp ? "default" : "outline"}
                  className="text-[9px]"
                >
                  {status.whisperCpp ? "ready" : "needs install"}
                </Badge>
              )}
            </div>
            <Switch
              checked={useFasterWhisper}
              onCheckedChange={(checked) =>
                setEngineAndPersist(checked ? "faster-whisper" : "whisper-cpp")
              }
            />
            <div className="flex items-center gap-2 sm:justify-end">
              <Label className="text-xs text-white/70">Fast</Label>
              {status && (
                <Badge
                  variant={status.fasterWhisper ? "default" : "outline"}
                  className="text-[9px]"
                >
                  {status.fasterWhisper ? "ready" : "needs install"}
                </Badge>
              )}
            </div>
          </div>

          {useFasterWhisper && status && !status.fasterWhisper && (
            <p className="text-[10px] text-amber-400/90">
              Ask a tech helper to run:{" "}
              <code className="text-[10px]">npm run faster-whisper:install</code>
            </p>
          )}
          {!useFasterWhisper && status && !status.whisperCpp && (
            <p className="text-[10px] text-amber-400/90">
              Ask a tech helper to run:{" "}
              <code className="text-[10px]">npm run whisper:install</code>
            </p>
          )}
        </>
      )}
    </div>
  );
}
