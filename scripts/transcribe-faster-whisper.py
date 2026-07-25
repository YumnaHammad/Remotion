#!/usr/bin/env python3
"""Transcribe audio with faster-whisper; emit Remotion-compatible caption JSON on stdout."""
from __future__ import annotations

import argparse
import json
import sys


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("audio_path")
    parser.add_argument("--model", default="base.en")
    parser.add_argument("--device", default="cpu")
    parser.add_argument("--compute-type", default="int8")
    parser.add_argument("--language", default=None)
    parser.add_argument("--beam-size", type=int, default=5)
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print(
            json.dumps(
                {
                    "ok": False,
                    "error": "faster-whisper not installed. Run: pip install faster-whisper",
                }
            )
        )
        return 1

    model = WhisperModel(
        args.model,
        device=args.device,
        compute_type=args.compute_type,
    )

    segments, info = model.transcribe(
        args.audio_path,
        beam_size=args.beam_size,
        word_timestamps=True,
        language=args.language,
        vad_filter=True,
    )

    captions = []
    for segment in segments:
        if segment.words:
            for word in segment.words:
                text = (word.word or "").strip()
                if not text:
                    continue
                start_ms = int(round(word.start * 1000))
                end_ms = int(round(word.end * 1000))
                captions.append(
                    {
                        "text": text,
                        "startMs": start_ms,
                        "endMs": max(end_ms, start_ms + 1),
                        "timestampMs": int(round((start_ms + end_ms) / 2)),
                        "confidence": getattr(word, "probability", None),
                    }
                )
        else:
            text = (segment.text or "").strip()
            if not text:
                continue
            start_ms = int(round(segment.start * 1000))
            end_ms = int(round(segment.end * 1000))
            captions.append(
                {
                    "text": text,
                    "startMs": start_ms,
                    "endMs": max(end_ms, start_ms + 1),
                    "timestampMs": int(round((start_ms + end_ms) / 2)),
                    "confidence": None,
                }
            )

    print(
        json.dumps(
            {
                "ok": True,
                "engine": "faster-whisper",
                "language": info.language,
                "language_probability": info.language_probability,
                "captions": captions,
            }
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
