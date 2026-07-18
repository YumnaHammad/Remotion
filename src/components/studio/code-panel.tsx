"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CodePanel({
  code,
  title = "Code",
  className,
}: {
  code: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-[#0b0c0f]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          {title}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7 text-white/50 hover:bg-white/10 hover:text-white"
          onClick={copy}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed text-sky-100/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
