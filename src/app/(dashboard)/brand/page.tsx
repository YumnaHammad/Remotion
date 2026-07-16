"use client";

import { MOCK_BRAND } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BrandPage() {
  const brand = MOCK_BRAND;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Brand Kit</h1>
        <p className="text-sm text-muted-foreground">
          Colors, fonts, and logos applied across templates
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <Label>Kit name</Label>
        <Input defaultValue={brand.name} />
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Brand colors</h2>
        <div className="flex flex-wrap gap-3">
          {brand.colors.map((c) => (
            <div key={c} className="space-y-1.5 text-center">
              <div
                className="h-14 w-14 rounded-xl border border-border shadow-sm"
                style={{ background: c }}
              />
              <p className="font-mono text-[10px] text-muted-foreground">{c}</p>
            </div>
          ))}
          <Button variant="outline" className="h-14 w-14">
            +
          </Button>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold">Fonts</h2>
        <div className="space-y-2">
          {brand.fonts.map((f) => (
            <div
              key={f}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <span style={{ fontFamily: f }} className="text-lg">
                {f}
              </span>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
          ))}
        </div>
      </section>

      <Button variant="glow">Save brand kit</Button>
    </div>
  );
}
