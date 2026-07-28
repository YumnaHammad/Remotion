import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { script } = await req.json() as { script: string };
    if (!script || !script.trim()) {
      return NextResponse.json({ ok: false, error: "Script text is required" }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const googleApiKey = process.env.GOOGLE_API_KEY;

    if (!openaiApiKey && !googleApiKey) {
      return NextResponse.json({
        ok: false,
        error: "Neither OPENAI_API_KEY nor GOOGLE_API_KEY is configured on the server."
      }, { status: 500 });
    }

    const systemPrompt = `You are an expert transcript editor AI. Your task is to improve the provided timestamped transcript by fixing:
- Grammar and spelling
- Punctuation
- Removing filler words (like "um", "uh", "like", "you know", "right")

CRITICAL RULES:
1. DO NOT change the original meaning of the sentences. Only improve readability, flow, grammar, and clean up stuttering/fillers.
2. You MUST preserve all timestamp tags (e.g. [00:01.23]) in their exact relative positions. Every timestamp tag present in the input must remain in the output, and no new timestamp tags should be invented.
3. Output ONLY the improved timestamped transcript. Do NOT wrap the response in markdown code fences, backticks, or write any conversational remarks.`;

    let improvedText = "";

    if (openaiApiKey) {
      const model = process.env.LLM_MODEL ?? "gpt-4o";
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: script },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json() as {
          choices?: { message?: { content?: string } }[];
        };
        improvedText = data.choices?.[0]?.message?.content?.trim() || "";
      } else {
        const err = await res.text();
        console.warn("[improve-transcript] OpenAI failed, falling back to Gemini:", err);
      }
    }

    // Fall back to Gemini if OpenAI failed or was not configured
    if (!improvedText && googleApiKey) {
      const model = "gemini-1.5-flash";
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleApiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nTranscript to improve:\n${script}`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        improvedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      } else {
        const err = await res.text();
        return NextResponse.json({ ok: false, error: `Gemini API failed: ${err.slice(0, 150)}` }, { status: 500 });
      }
    }

    if (!improvedText) {
      return NextResponse.json({ ok: false, error: "AI failed to return improved transcript" }, { status: 500 });
    }

    // Strip markdown formatting if returned
    if (improvedText.startsWith("```")) {
      improvedText = improvedText.replace(/```(?:json|text)?/g, "").trim();
    }

    return NextResponse.json({ ok: true, script: improvedText });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error improving transcript";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
