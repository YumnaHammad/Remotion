"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Link as LinkIcon, FileCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholderUrl?: string;
}

export function normalizeMediaUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();

  // Unsplash detail page check
  if (/unsplash\.com\/photos\//i.test(trimmed)) {
    const match = trimmed.match(/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/i);
    if (match) {
      const segment = match[1];
      const parts = segment.split("-");
      const id = parts[parts.length - 1];
      return `https://unsplash.com/photos/${id}/download?force=true`;
    }
  }

  // Imgur detail page check
  if (/imgur\.com\/(?!a\/)([a-zA-Z0-9]+)$/i.test(trimmed)) {
    const match = trimmed.match(/imgur\.com\/([a-zA-Z0-9]+)$/i);
    if (match) {
      return `https://i.imgur.com/${match[1]}.png`;
    }
  }

  return trimmed;
}

export function FileUploader({
  label,
  value,
  onChange,
  accept = "image/*",
  placeholderUrl,
}: FileUploaderProps) {
  const [showInput, setShowInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  const isImage = accept.startsWith("image/");
  const isAudio = accept.startsWith("audio/");

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </Label>
        <button
          type="button"
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1 text-[10px] font-medium text-sky-500 hover:text-sky-400 hover:underline transition"
        >
          <LinkIcon className="h-3 w-3" />
          {showInput ? "Upload File" : "Paste URL"}
        </button>
      </div>

      {showInput ? (
        <Input
          value={value}
          onChange={(e) => onChange(normalizeMediaUrl(e.target.value))}
          placeholder={placeholderUrl || "https://example.com/file.png"}
          className="h-9 border-input bg-background text-xs text-foreground placeholder-muted-foreground/50"
        />
      ) : (
        <div className="flex items-center gap-3">
          {value ? (
            <div className="relative flex-1 flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-2 pr-3.5">
              <div className="flex items-center gap-3 truncate">
                {isImage && (
                  <img
                    src={value}
                    alt="Upload preview"
                    className="h-12 w-12 rounded object-cover border border-border bg-muted/40 shadow-inner"
                  />
                )}
                {isAudio && (
                  <div className="flex h-12 w-12 items-center justify-center rounded border border-border bg-muted/45 text-sky-500">
                    <FileCheck className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col truncate">
                  <span className="truncate text-xs font-semibold text-foreground">
                    {value.startsWith("blob:") ? "Local file loaded" : "External link loaded"}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground">
                    Ready to render in video
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-full bg-muted p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition-all duration-200 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-border bg-background hover:border-primary/45 hover:bg-muted"
              }`}
            >
              <Upload className="mb-2 h-5 w-5 text-muted-foreground/60" />
              <p className="text-[11px] font-semibold text-foreground">
                Click or drag file here
              </p>
              <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                {isImage ? "Supports PNG, JPG, GIF up to 5MB" : "Supports MP3, WAV up to 10MB"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
