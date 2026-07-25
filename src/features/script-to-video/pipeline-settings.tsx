"use client";

import { useEffect, useState } from "react";
import { Cloud, Laptop } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DEFAULT_PIPELINE_PREFERENCES,
  loadPipelinePreferences,
  savePipelinePreferences,
  type PipelinePreferences,
} from "@/lib/pipeline/pipeline-preferences";
import { cn } from "@/lib/utils";

interface ServerCapabilities {
  llm: boolean;
  tts: boolean;
  stock: boolean;
}

interface PipelineSettingsProps {
  value: PipelinePreferences;
  onChange: (prefs: PipelinePreferences) => void;
  className?: string;
}

export function PipelineSettings({
  value,
  onChange,
  className,
}: PipelineSettingsProps) {
  const [capabilities, setCapabilities] = useState<ServerCapabilities | null>(
    null
  );

  useEffect(() => {
    fetch("/api/pipeline/config")
      .then((r) => r.json())
      .then((data: { capabilities?: ServerCapabilities }) => {
        if (data.capabilities) setCapabilities(data.capabilities);
      })
      .catch(() => undefined);
  }, []);

  const setSource = (source: PipelinePreferences["source"]) => {
    const next = { ...value, source };
    onChange(next);
    savePipelinePreferences(next);
  };

  const setUseExternal = (useExternalApis: boolean) => {
    const next = { ...value, useExternalApis };
    onChange(next);
    savePipelinePreferences(next);
  };

  const cloudReady =
    capabilities &&
    (capabilities.llm || capabilities.tts || capabilities.stock);

  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border bg-muted/30 p-4",
        className
      )}
    >
      <div>
        <p className="text-sm font-medium">Processing mode</p>
        <p className="text-xs text-muted-foreground">
          Choose client-side (browser) or server-side (API) processing.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Laptop
            className={cn(
              "h-4 w-4",
              value.source === "client" ? "text-primary" : "text-muted-foreground"
            )}
          />
          <Label htmlFor="pipeline-client" className="text-sm">
            Client-side (local)
          </Label>
          <Badge variant={value.source === "client" ? "default" : "secondary"}>
            No keys
          </Badge>
        </div>
        <Switch
          id="pipeline-server"
          checked={value.source === "server"}
          onCheckedChange={(checked) =>
            setSource(checked ? "server" : "client")
          }
        />
        <div className="flex items-center gap-2 sm:justify-end">
          <Label htmlFor="pipeline-server" className="text-sm">
            Server-side
          </Label>
          <Cloud
            className={cn(
              "h-4 w-4",
              value.source === "server" ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
      </div>

      {value.source === "server" && (
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Cloud APIs</p>
              <p className="text-xs text-muted-foreground">
                OpenAI breakdown/TTS + Pexels stock (requires API keys on server)
              </p>
            </div>
            <Switch
              checked={value.useExternalApis}
              onCheckedChange={setUseExternal}
              disabled={!cloudReady}
            />
          </div>
          {capabilities && (
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={capabilities.llm ? "default" : "outline"}>
                LLM {capabilities.llm ? "ready" : "off"}
              </Badge>
              <Badge variant={capabilities.tts ? "default" : "outline"}>
                TTS {capabilities.tts ? "ready" : "off"}
              </Badge>
              <Badge variant={capabilities.stock ? "default" : "outline"}>
                Stock {capabilities.stock ? "ready" : "off"}
              </Badge>
            </div>
          )}
          {value.useExternalApis && !cloudReady && (
            <p className="text-xs text-amber-600">
              Cloud APIs enabled but server keys missing — will fall back to
              local assets.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function usePipelinePreferences() {
  const [prefs, setPrefs] = useState<PipelinePreferences>(
    DEFAULT_PIPELINE_PREFERENCES
  );

  useEffect(() => {
    setPrefs(loadPipelinePreferences());
  }, []);

  return [prefs, setPrefs] as const;
}
