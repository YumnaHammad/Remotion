"use client";

import { PageHeader } from "@/components/studio/page-header";
import { DemoStage } from "@/components/studio/demo-stage";
import { CodePanel } from "@/components/studio/code-panel";
import type { ComponentType } from "react";

export function LabShell<T extends Record<string, unknown>>({
  title,
  description,
  icon,
  component,
  inputProps,
  durationInFrames,
  compositionWidth = 1280,
  compositionHeight = 720,
  fps = 30,
  code,
  controls,
  actions,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: ComponentType<T>;
  inputProps?: T;
  durationInFrames: number;
  compositionWidth?: number;
  compositionHeight?: number;
  fps?: number;
  code: string;
  controls?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={title}
        description={description}
        icon={icon}
        actions={actions}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <DemoStage
          component={component}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          compositionWidth={compositionWidth}
          compositionHeight={compositionHeight}
          fps={fps}
        />
        <div className="space-y-4">
          {controls && (
            <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Inspector
              </p>
              {controls}
            </div>
          )}
          <CodePanel code={code} title="remotion" />
        </div>
      </div>
    </div>
  );
}
