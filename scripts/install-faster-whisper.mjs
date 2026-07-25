#!/usr/bin/env node
/**
 * Install faster-whisper Python package for local transcription.
 * Usage: npm run faster-whisper:install
 */
import { execSync } from "node:child_process";

const python = process.env.PYTHON_PATH ?? "python";

console.log(`Installing faster-whisper via ${python}...`);
execSync(`${python} -m pip install faster-whisper`, {
  stdio: "inherit",
  env: process.env,
});
console.log("Done. Transcribe with engine=faster-whisper via POST /api/transcribe");
