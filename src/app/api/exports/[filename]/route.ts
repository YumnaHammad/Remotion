import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  gif: "image/gif",
};

/** Serve rendered files from public/exports with attachment headers. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!/^[\w.-]+\.(mp4|webm|gif)$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "public", "exports", filename);
  try {
    const data = await fs.readFile(filePath);
    const ext = filename.split(".").pop() ?? "mp4";
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Export not found" }, { status: 404 });
  }
}
