#!/usr/bin/env python3
"""Standalone faster-whisper transcription service.

Accepts audio OR video files. For video containers the audio track is
extracted first (in-process via PyAV — no ffmpeg binary required), resampled
to 16 kHz mono, then transcribed with automatic language detection and
word-level timestamps. Emits structured JSON on stdout so the automation
pipeline / AI module can consume transcripts for script analysis and scene
detection.

Usage:
  python transcribe-faster-whisper.py MEDIA [--model base] [--device cpu]
      [--compute-type int8] [--language en] [--beam-size 5]
      [--output out.json]

Environment overrides: FASTER_WHISPER_MODEL, FASTER_WHISPER_DEVICE,
FASTER_WHISPER_COMPUTE_TYPE, FASTER_WHISPER_CPU_THREADS,
FASTER_WHISPER_CACHE_DIR.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

VIDEO_EXTENSIONS = {
    ".mp4", ".mov", ".mkv", ".webm", ".avi", ".m4v", ".wmv", ".flv",
    ".mpg", ".mpeg", ".ts", ".3gp",
}

SAMPLING_RATE = 16000


def fail(message: str, code: int = 1) -> int:
    print(json.dumps({"ok": False, "error": message}))
    return code


def media_kind(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    return "video" if ext in VIDEO_EXTENSIONS else "audio"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("media_path", help="Audio or video file to transcribe")
    parser.add_argument(
        "--model", default=os.environ.get("FASTER_WHISPER_MODEL", "base")
    )
    parser.add_argument(
        "--device", default=os.environ.get("FASTER_WHISPER_DEVICE", "cpu")
    )
    parser.add_argument(
        "--compute-type",
        default=os.environ.get("FASTER_WHISPER_COMPUTE_TYPE", "int8"),
    )
    parser.add_argument(
        "--language",
        default=None,
        help="ISO language code; omit for automatic detection",
    )
    parser.add_argument("--beam-size", type=int, default=5)
    parser.add_argument(
        "--output", default=None, help="Write JSON to this file instead of stdout"
    )
    args = parser.parse_args()

    if not os.path.isfile(args.media_path):
        return fail(f"File not found: {args.media_path}")

    try:
        from faster_whisper import WhisperModel
        from faster_whisper.audio import decode_audio
    except ImportError as exc:
        return fail(
            f"faster-whisper not installed ({exc}). Run: pip install faster-whisper"
        )

    kind = media_kind(args.media_path)
    started = time.time()

    # Extract/decode the audio track up front. PyAV demuxes video containers
    # directly, so both audio and video inputs become a 16 kHz mono waveform
    # without requiring an ffmpeg binary on the rendering server.
    try:
        waveform = decode_audio(args.media_path, sampling_rate=SAMPLING_RATE)
    except Exception as exc:  # av raises container-specific error types
        return fail(f"Could not decode audio from {kind} file: {exc}")

    if len(waveform) == 0:
        return fail(f"No audio track found in {kind} file: {args.media_path}")

    extract_ms = int((time.time() - started) * 1000)
    media_duration_ms = int(len(waveform) / SAMPLING_RATE * 1000)

    cpu_threads = int(
        os.environ.get("FASTER_WHISPER_CPU_THREADS", 0) or (os.cpu_count() or 4)
    )
    model = WhisperModel(
        args.model,
        device=args.device,
        compute_type=args.compute_type,
        cpu_threads=cpu_threads,
        download_root=os.environ.get("FASTER_WHISPER_CACHE_DIR") or None,
    )

    segments_iter, info = model.transcribe(
        waveform,
        beam_size=args.beam_size,
        word_timestamps=True,
        language=args.language,
        vad_filter=True,
        # Feeding the previous window back in makes whisper loop the same
        # phrase on music/noisy audio; disabling it stops repeated words.
        condition_on_previous_text=False,
        no_repeat_ngram_size=3,
    )

    segments = []
    captions = []
    text_parts = []

    for segment in segments_iter:
        seg_text = (segment.text or "").strip()
        if not seg_text:
            continue
        text_parts.append(seg_text)

        words = []
        for word in segment.words or []:
            word_text = (word.word or "").strip()
            if not word_text:
                continue
            start_ms = int(round(word.start * 1000))
            end_ms = max(int(round(word.end * 1000)), start_ms + 1)
            confidence = getattr(word, "probability", None)
            words.append(
                {
                    "text": word_text,
                    "startMs": start_ms,
                    "endMs": end_ms,
                    "confidence": confidence,
                }
            )
            captions.append(
                {
                    "text": word_text,
                    "startMs": start_ms,
                    "endMs": end_ms,
                    "timestampMs": int(round((start_ms + end_ms) / 2)),
                    "confidence": confidence,
                }
            )

        seg_start_ms = int(round(segment.start * 1000))
        seg_end_ms = max(int(round(segment.end * 1000)), seg_start_ms + 1)
        segments.append(
            {
                "id": segment.id,
                "startMs": seg_start_ms,
                "endMs": seg_end_ms,
                "text": seg_text,
                "words": words,
                "avgLogprob": segment.avg_logprob,
                "noSpeechProb": segment.no_speech_prob,
            }
        )

        if not words:
            captions.append(
                {
                    "text": seg_text,
                    "startMs": seg_start_ms,
                    "endMs": seg_end_ms,
                    "timestampMs": int(round((seg_start_ms + seg_end_ms) / 2)),
                    "confidence": None,
                }
            )

    result = {
        "ok": True,
        "engine": "faster-whisper",
        "model": args.model,
        "media": {
            "path": os.path.abspath(args.media_path),
            "kind": kind,
            "durationMs": media_duration_ms,
        },
        "language": info.language,
        "languageProbability": info.language_probability,
        "text": " ".join(text_parts),
        "segments": segments,
        "captions": captions,
        "timings": {
            "audioExtractMs": extract_ms,
            "totalMs": int((time.time() - started) * 1000),
        },
    }

    payload = json.dumps(result, ensure_ascii=False)
    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(payload)
        print(json.dumps({"ok": True, "output": os.path.abspath(args.output)}))
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    sys.exit(main())
