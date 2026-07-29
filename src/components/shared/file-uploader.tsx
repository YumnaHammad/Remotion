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
    <div className="space-y-2 rounded-xl border border-white/5 bg-black/20 p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">
          {label}
        </Label>
        <button
          type="button"
          onClick={() => setShowInput(!showInput)}
          className="flex items-center gap-1 text-[10px] font-medium text-sky-400 hover:text-sky-300 hover:underline transition"
        >
          <LinkIcon className="h-3 w-3" />
          {showInput ? "Upload File" : "Paste URL"}
        </button>
      </div>

      {showInput ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderUrl || "https://example.com/file.png"}
          className="h-9 border-white/10 bg-white/5 text-xs text-white placeholder-white/20"
        />
      ) : (
        <div className="flex items-center gap-3">
          {value ? (
            <div className="relative flex-1 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-2 pr-3.5">
              <div className="flex items-center gap-3 truncate">
                {isImage && (
                  <img
                    src={value}
                    alt="Upload preview"
                    className="h-12 w-12 rounded object-cover border border-white/15 bg-black/40 shadow-inner"
                  />
                )}
                {isAudio && (
                  <div className="flex h-12 w-12 items-center justify-center rounded border border-white/15 bg-black/40 text-sky-400">
                    <FileCheck className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col truncate">
                  <span className="truncate text-xs font-semibold text-white/90">
                    {value.startsWith("blob:") ? "Local file loaded" : "External link loaded"}
                  </span>
                  <span className="truncate text-[10px] text-white/35">
                    Ready to render in video
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-full bg-white/10 p-1.5 text-white/60 hover:bg-rose-500/20 hover:text-rose-400 transition"
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
                  ? "border-primary bg-primary/10 scale-[0.99]"
                  : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
              }`}
            >
              <Upload className="mb-2 h-5 w-5 text-white/30" />
              <p className="text-[11px] font-semibold text-white/70">
                Click or drag file here
              </p>
              <p className="text-[9px] text-white/35 mt-0.5">
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
