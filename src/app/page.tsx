import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description:
    "Framekit turns templates, websites, and spreadsheets into branded MP4 videos. Customize live, apply your brand kit, export in minutes.",
};

export default function HomePage() {
  return <LandingPage />;
}
