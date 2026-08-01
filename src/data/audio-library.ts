export type AudioCategory =
  | "corporate"
  | "cinematic"
  | "social"
  | "podcast"
  | "sfx";

export interface AudioTrack {
  id: string;
  name: string;
  category: AudioCategory;
  duration: string;
  /** CDN URL — must work in browser preview and Remotion render */
  previewUrl: string;
  premium?: boolean;
}

/** Remotion-hosted assets that still return 200 (lofi.mp3 is 404). */
const R = "https://remotion.media";
const MUSIC = `${R}/audio.mp3`;
const VOICE = `${R}/dialogue.wav`;

export const AUDIO_CATEGORIES: { id: AudioCategory; label: string }[] = [
  { id: "corporate", label: "Corporate music" },
  { id: "cinematic", label: "Cinematic music" },
  { id: "social", label: "Social media music" },
  { id: "podcast", label: "Podcast background" },
  { id: "sfx", label: "Sound effects" },
];

export const AUDIO_LIBRARY: AudioTrack[] = [
  {
    id: "corp-uplifting",
    name: "Uplifting Corporate",
    category: "corporate",
    duration: "2:30",
    previewUrl: `${MUSIC}?t=1`,
  },
  {
    id: "corp-inspire",
    name: "Inspiring Innovation",
    category: "corporate",
    duration: "3:00",
    previewUrl: `${MUSIC}?t=2`,
    premium: true,
  },
  {
    id: "cin-epic",
    name: "Epic Orchestral Theme",
    category: "cinematic",
    duration: "2:45",
    previewUrl: `${MUSIC}?t=3`,
    premium: true,
  },
  {
    id: "social-lofi",
    name: "Chill Lo-fi Vibes",
    category: "social",
    duration: "2:00",
    previewUrl: `${MUSIC}?t=4`,
  },
  {
    id: "social-synth",
    name: "Retro Synthwave",
    category: "social",
    duration: "3:00",
    previewUrl: `${MUSIC}?t=5`,
  },
  {
    id: "pod-talk",
    name: "Podcast Conversation Bed",
    category: "podcast",
    duration: "4:00",
    previewUrl: `${MUSIC}?t=6`,
  },
  {
    id: "pod-acoustic",
    name: "Acoustic Reflection",
    category: "podcast",
    duration: "3:30",
    previewUrl: `${MUSIC}?t=7`,
    premium: true,
  },
  {
    id: "sfx-whoosh",
    name: "Whoosh transition",
    category: "sfx",
    duration: "0:02",
    previewUrl: `${R}/whoosh.wav`,
  },
  {
    id: "sfx-pop",
    name: "Pop accent",
    category: "sfx",
    duration: "0:01",
    previewUrl: `${R}/mouse-click.wav`,
  },
  {
    id: "sfx-ding",
    name: "Ding",
    category: "sfx",
    duration: "0:03",
    previewUrl: `${R}/ding.wav`,
  },
  {
    id: "sfx-page",
    name: "Page turn",
    category: "sfx",
    duration: "0:02",
    previewUrl: `${R}/page-turn.wav`,
  },
];

export function getAudioTrack(id: string): AudioTrack | undefined {
  return AUDIO_LIBRARY.find((t) => t.id === id);
}

export function getAudioTrackByUrl(url: string): AudioTrack | undefined {
  return AUDIO_LIBRARY.find((t) => t.previewUrl === url);
}
