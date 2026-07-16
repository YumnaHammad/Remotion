"use client";

import { SHORTCUTS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Profile, appearance, and studio preferences
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input defaultValue="Alex Rivera" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue="alex@lumen.studio" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Appearance</h2>
            <p className="text-xs text-muted-foreground">Dark / light theme</p>
          </div>
          <ThemeToggle />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <Label>Snap to frames</Label>
            <p className="text-xs text-muted-foreground">Timeline magnet snapping</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Show waveforms</Label>
            <p className="text-xs text-muted-foreground">Audio track visualization</p>
          </div>
          <Switch defaultChecked />
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Keyboard shortcuts</h2>
        {SHORTCUTS.map((s) => (
          <div
            key={s.action}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{s.action}</span>
            <div className="flex gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Remotion Lambda</h2>
        <p className="text-xs text-muted-foreground">
          Configure AWS Lambda for cloud rendering (architecture ready).
        </p>
        <div className="space-y-1.5">
          <Label>Function name</Label>
          <Input placeholder="remotion-render-lumen" />
        </div>
        <div className="space-y-1.5">
          <Label>Region</Label>
          <Input defaultValue="us-east-1" />
        </div>
      </section>

      <Button variant="glow">Save settings</Button>
    </div>
  );
}
