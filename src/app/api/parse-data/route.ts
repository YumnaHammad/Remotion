import { NextResponse } from "next/server";
import { parseCsv, parseJson, parseExcel } from "@/utils/parse-data-file";

export const runtime = "nodejs";

/** Parse uploaded CSV / JSON / Excel on the server — keeps xlsx out of the client bundle. */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    let parsed;

    if (name.endsWith(".csv")) {
      parsed = parseCsv(await file.text(), file.name);
    } else if (name.endsWith(".json")) {
      parsed = parseJson(await file.text(), file.name);
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      parsed = parseExcel(await file.arrayBuffer(), file.name);
    } else {
      return NextResponse.json(
        { ok: false, error: "Use CSV, JSON, or Excel (.xlsx)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, ...parsed });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Parse failed",
      },
      { status: 400 }
    );
  }
}
