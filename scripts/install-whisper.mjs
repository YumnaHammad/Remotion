/**
 * Install Whisper.cpp binary + model for local caption transcription.
 * Usage: npm run whisper:install
 */
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
} from "@remotion/install-whisper-cpp";

const to = path.resolve(
  process.env.WHISPER_CPP_DIR ?? path.join(process.cwd(), "whisper.cpp")
);
const version = process.env.WHISPER_CPP_VERSION ?? "1.5.5";
const model = process.env.WHISPER_MODEL ?? "base.en";

console.log(`Installing Whisper.cpp ${version} → ${to}`);
const installed = await installWhisperCpp({ to, version });
console.log(
  installed.alreadyExisted
    ? "Whisper.cpp already present."
    : "Whisper.cpp installed."
);

console.log(`Downloading model ${model}…`);
const modelResult = await downloadWhisperModel({ model, folder: to });
console.log(
  modelResult.alreadyExisted
    ? `Model ${model} already present.`
    : `Model ${model} downloaded.`
);

console.log("Done. You can transcribe via POST /api/transcribe.");
