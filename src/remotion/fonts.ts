import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";

/**
 * Loads Google Fonts via @remotion/google-fonts so both the Player preview
 * and server renders share the exact same typography.
 */
export const inter = loadInter();
export const grotesk = loadGrotesk();
export const poppins = loadPoppins();
export const playfair = loadPlayfair();

export const FONT_OPTIONS = [
  { label: "Inter", family: inter.fontFamily },
  { label: "Space Grotesk", family: grotesk.fontFamily },
  { label: "Poppins", family: poppins.fontFamily },
  { label: "Playfair Display", family: playfair.fontFamily },
] as const;

export const DEFAULT_FONT = inter.fontFamily;
