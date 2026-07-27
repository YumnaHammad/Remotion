import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { ok: false, error: "Multipart request expected." },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "Field `file` is required." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "generated-assets", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const cleanName = file.name.replace(/[^\w.-]+/g, "_");
    const uniqueName = `${Date.now()}-${cleanName}`;
    const filePath = path.join(uploadDir, uniqueName);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buf);

    const publicUrl = `/generated-assets/uploads/${uniqueName}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
