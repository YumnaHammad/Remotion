import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const UrlSchema = z.object({
  url: z.string().url(),
});

/** Extract Open Graph / basic HTML metadata from a public URL. */
function parseMetadata(html: string, url: string) {
  const getMeta = (property: string) => {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        "i"
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
        "i"
      ),
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m?.[1]) return m[1].trim();
    }
    return undefined;
  };

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title =
    getMeta("og:title") ??
    getMeta("twitter:title") ??
    titleMatch?.[1]?.trim() ??
    new URL(url).hostname;

  const description =
    getMeta("og:description") ??
    getMeta("description") ??
    getMeta("twitter:description") ??
    "";

  let image = getMeta("og:image") ?? getMeta("twitter:image");
  if (image && !image.startsWith("http")) {
    try {
      image = new URL(image, url).href;
    } catch {
      image = undefined;
    }
  }

  const siteName = getMeta("og:site_name");

  return { url, title, description, image, siteName };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let urlInput = typeof body.url === "string" ? body.url.trim() : "";
    if (urlInput && !/^https?:\/\//i.test(urlInput)) {
      urlInput = `https://${urlInput}`;
    }
    const { url } = UrlSchema.parse({ url: urlInput });

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      const parsedUrl = new URL(url);
      const fallbackMetadata = {
        url,
        title: parsedUrl.hostname.replace("www.", ""),
        description: `Video script generated from ${parsedUrl.hostname}`,
        image: undefined,
        siteName: parsedUrl.hostname,
      };
      return NextResponse.json({ ok: true, metadata: fallbackMetadata });
    }

    const html = await res.text();
    const metadata = parseMetadata(html, url);

    return NextResponse.json({ ok: true, metadata });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Invalid URL",
      },
      { status: 400 }
    );
  }
}
