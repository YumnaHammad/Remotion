"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TemplatePreview } from "@/features/shared/template-preview";
import { useBrandKit } from "@/hooks/use-brand-kit";
import { useSimpleVideoStore } from "@/stores/simple-video-store";
import { DATA_TEMPLATE } from "@/templates/catalog";
import {
  suggestCopyFromData,
  type ParsedDataFile,
} from "@/utils/parse-data-file";
import {
  propsFromData,
  dataVideoDuration,
} from "@/utils/video-project-factory";
import { genId } from "@/lib/project-factory";
import type { SimpleVideoProject } from "@/types/video";
import { toast } from "sonner";

/**
 * Data → Video flow:
 * Upload CSV / Excel / JSON → preview table → generate DataSlideshow video.
 */
export function DataToVideoFeature() {
  const router = useRouter();
  const { brand } = useBrandKit();
  const addProject = useSimpleVideoStore((s) => s.addProject);
  const inputRef = useRef<HTMLInputElement>(null);

  const [parsed, setParsed] = useState<ParsedDataFile | null>(null);
  const [loading, setLoading] = useState(false);

  const copy = parsed
    ? suggestCopyFromData(parsed.rows, parsed.columns)
    : { title: "Data Report", subtitle: "Upload a file to begin" };

  const previewProps = parsed
    ? propsFromData(copy.title, copy.subtitle, parsed.rows, parsed.columns, brand)
    : {
        title: "Data Report",
        subtitle: "Upload CSV, Excel, or JSON",
        accent: brand.colors.accent,
        brandColor: brand.colors.primary,
        rows: [],
        columns: [],
        fontFamily: brand.fontFamily,
      };

  const onFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-data", { method: "POST", body: form });
      const data = (await res.json()) as {
        ok?: boolean;
        rows?: ParsedDataFile["rows"];
        columns?: string[];
        fileName?: string;
        error?: string;
      };
      if (!data.ok || !data.rows) {
        toast.error(data.error ?? "Parse failed");
        return;
      }
      const result: ParsedDataFile = {
        rows: data.rows,
        columns: data.columns ?? [],
        fileName: data.fileName ?? file.name,
      };
      if (result.rows.length === 0) {
        toast.error("No rows found in file");
        return;
      }
      setParsed(result);
      toast.success(`${result.rows.length} rows loaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Parse failed");
    } finally {
      setLoading(false);
    }
  };

  const createVideo = () => {
    if (!parsed) return;
    const { title, subtitle } = suggestCopyFromData(parsed.rows, parsed.columns);
    const props = propsFromData(
      title,
      subtitle,
      parsed.rows,
      parsed.columns,
      brand
    );
    const duration = dataVideoDuration(parsed.rows.length);
    const now = new Date().toISOString();

    const project: SimpleVideoProject = {
      id: genId("svp"),
      name: title.slice(0, 60),
      sourceType: "data",
      compositionId: "DataSlideshow",
      templateId: DATA_TEMPLATE.id,
      props,
      aspectRatio: "16:9",
      durationInFrames: duration,
      fps: 30,
      width: 1920,
      height: 1080,
      createdAt: now,
      updatedAt: now,
      status: "draft",
      dataRows: parsed.rows,
    };

    addProject(project);
    toast.success("Data video created");
    router.push(`/create/${project.id}`);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <Badge className="mb-2">Data to Video</Badge>
          <h1 className="text-2xl font-semibold tracking-tight">
            Spreadsheet to video
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload CSV, Excel (.xlsx), or JSON. Each row becomes an animated
            slide — great for reports, product lists, and stats.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,.json,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            onFile(e.target.files);
            e.target.value = "";
          }}
        />

        <Button
          variant="outline"
          className="h-auto w-full flex-col gap-2 border-dashed py-10"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <Upload className="h-8 w-8 text-primary" />
          <span>Upload CSV, Excel, or JSON</span>
          <span className="text-xs text-muted-foreground">
            First column = headline · second = body text
          </span>
        </Button>

        {parsed && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              {parsed.fileName} · {parsed.rows.length} rows
            </div>
            <div className="max-h-48 overflow-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    {parsed.columns.slice(0, 4).map((c) => (
                      <th key={c} className="px-3 py-2 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 6).map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {parsed.columns.slice(0, 4).map((c) => (
                        <td key={c} className="px-3 py-2 text-muted-foreground">
                          {String(row[c] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Button variant="glow" onClick={createVideo} disabled={!parsed}>
          Create video <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-border bg-black/40 p-4">
        <TemplatePreview
          compositionId="DataSlideshow"
          inputProps={previewProps as Record<string, unknown>}
          className="w-full max-w-lg"
        />
      </div>
    </div>
  );
}
