"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Clapperboard,
  Download,
  FileSpreadsheet,
  Globe,
  Layers,
  LayoutTemplate,
  Menu,
  Palette,
  Play,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { TEMPLATE_CATALOG } from "@/templates/catalog";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#templates", label: "Templates" },
] as const;

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: `${TEMPLATE_CATALOG.length}+ ready-made templates`,
    description:
      "Social clips, product ads, podcast openers, and business slides — pick a layout and customize text and colors in minutes.",
    href: "/templates",
    accent: "from-[#0b84f3]/20 to-transparent",
  },
  {
    icon: Globe,
    title: "Website → video",
    description:
      "Paste any URL. Framekit pulls the headline, description, and visuals to pre-fill your video automatically.",
    href: "/website-to-video",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    icon: FileSpreadsheet,
    title: "Data → video",
    description:
      "Drop in CSV, Excel, or JSON. Each row becomes an animated slide — ideal for reports, dashboards, and updates.",
    href: "/data-to-video",
    accent: "from-violet-500/20 to-transparent",
  },
  {
    icon: Palette,
    title: "Brand kit",
    description:
      "Save your logo, colors, and fonts once. Every new video starts on-brand without redoing the setup.",
    href: "/brand",
    accent: "from-pink-500/20 to-transparent",
  },
  {
    icon: Play,
    title: "Live preview",
    description:
      "Watch changes as you type. Tweak copy and colors with instant feedback — no export-and-wait loop.",
    href: "/templates",
    accent: "from-amber-500/20 to-transparent",
  },
  {
    icon: Download,
    title: "Export MP4",
    description:
      "Download production-ready MP4s in one click. Landscape, vertical, or square — 720p up to 4K.",
    href: "/exports",
    accent: "from-emerald-500/20 to-transparent",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Choose your starting point",
    body: "Start from a template, paste a website URL, or upload a spreadsheet — whichever fits your content.",
  },
  {
    step: "02",
    title: "Customize & brand",
    body: "Edit titles and colors, apply your brand kit, and fine-tune the look until the preview feels right.",
  },
  {
    step: "03",
    title: "Preview & export",
    body: "Review the live preview, hit export, and download your finished MP4 when rendering completes.",
  },
] as const;

const SHOWCASE = TEMPLATE_CATALOG.filter(
  (t) => t.popular || (t.category !== "Official" && t.category !== "Starter")
).slice(0, 6);

const STATS = [
  { value: String(TEMPLATE_CATALOG.length), label: "Templates" },
  { value: "3", label: "Input sources" },
  { value: "MP4", label: "Export format" },
  { value: "0", label: "No timeline" },
] as const;

function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f1115]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0f1115]/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0b84f3] text-white shadow-lg shadow-[#0b84f3]/30 sm:h-9 sm:w-9">
              <Clapperboard className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight">
                {APP_NAME}
              </p>
              <p className="hidden truncate text-[10px] text-muted-foreground min-[380px]:block">
                {APP_TAGLINE}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="glow" size="sm" className="hidden min-[480px]:inline-flex">
              <Link href="/templates">
                <span className="hidden sm:inline">Get started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={closeMenu}
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100vw,320px)] flex-col border-l border-white/10 bg-[#0f1115] p-4 shadow-2xl md:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b84f3] text-white">
                    <Clapperboard className="h-4 w-4" />
                  </div>
                  <span className="font-display text-sm font-semibold">
                    {APP_NAME}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={closeMenu}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-3 text-base font-medium transition hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 pt-6">
                <Button asChild variant="glow" className="w-full rounded-xl">
                  <Link href="/templates" onClick={closeMenu}>
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link href="/dashboard" onClick={closeMenu}>
                    Open dashboard
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div className="absolute -inset-2 rounded-3xl bg-[#0b84f3]/15 blur-2xl sm:-inset-4 sm:blur-3xl" />
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#12141a] shadow-2xl shadow-black/50 sm:rounded-2xl">
        <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500/80 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-amber-500/80 sm:h-2.5 sm:w-2.5" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/80 sm:h-2.5 sm:w-2.5" />
          </div>
          <span className="ml-1 truncate text-[10px] text-muted-foreground sm:ml-2 sm:text-[11px]">
            framekit.app/create
          </span>
        </div>

        {/* Mobile: horizontal tabs */}
        <div className="flex gap-1 border-b border-white/5 bg-[#0b0c0f] p-2 sm:hidden">
          {["Templates", "Brand", "Export"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-center text-[10px]",
                i === 0
                  ? "bg-[#0b84f3]/15 text-[#93c5fd]"
                  : "text-muted-foreground"
              )}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="grid min-h-[240px] sm:min-h-[320px] sm:grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] lg:min-h-[360px] lg:grid-cols-[140px_1fr]">
          <div className="hidden space-y-1 border-r border-white/5 bg-[#0b0c0f] p-2 sm:block">
            {["Templates", "Brand", "Export"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "rounded-md px-2 py-2 text-[10px] md:text-[11px]",
                  i === 0
                    ? "bg-[#0b84f3]/15 text-[#93c5fd]"
                    : "text-muted-foreground"
                )}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-col p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <p className="truncate text-xs font-medium">Product Launch</p>
              <Badge className="shrink-0 bg-[#0b84f3]/90 px-1.5 text-[9px] text-white hover:bg-[#0b84f3]/90 sm:text-[10px]">
                Live preview
              </Badge>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-lg bg-gradient-to-br from-[#0a0612] via-[#1a1030] to-[#0b1020] sm:rounded-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#0b84f355,transparent_55%)]" />
              <div className="relative flex h-full min-h-[140px] flex-col items-center justify-center p-4 text-center sm:min-h-[180px] sm:p-6">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[10px] font-bold sm:mb-3 sm:h-10 sm:w-10 sm:text-xs">
                  FK
                </div>
                <p className="font-display text-base font-semibold tracking-tight sm:text-lg">
                  Ship faster
                </p>
                <p className="mt-1 text-[11px] text-white/60 sm:text-xs">
                  Your product story, on video
                </p>
                <motion.div
                  className="mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#0b84f3] shadow-lg shadow-[#0b84f3]/40 sm:mt-4 sm:h-8 sm:w-8"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Play className="h-3 w-3 fill-white text-white sm:h-3.5 sm:w-3.5" />
                </motion.div>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
              {["Title", "Colors", "Export"].map((label) => (
                <div
                  key={label}
                  className="rounded-md border border-white/5 bg-white/[0.03] px-1.5 py-1 text-center text-[9px] text-muted-foreground sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-[10px]"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="dark mesh-bg min-h-dvh overflow-x-hidden text-foreground">
      <LandingNav />

      <main className="pb-[env(safe-area-inset-bottom)]">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-12 pt-10 sm:pb-16 sm:pt-14 lg:px-6 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,#0b84f322,transparent)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="min-w-0 text-center lg:text-left"
            >
              <Badge className="mb-4 max-w-full whitespace-normal border-[#0b84f3]/30 bg-[#0b84f3]/10 px-2.5 py-1 text-[11px] leading-snug text-[#93c5fd] hover:bg-[#0b84f3]/10 sm:mb-5 sm:text-xs">
                <Sparkles className="mr-1 inline h-3 w-3 shrink-0" />
                Templates · URL import · Spreadsheet automation
              </Badge>
              <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Your content.
                <br />
                <span className="bg-gradient-to-r from-[#0b84f3] via-[#38bdf8] to-[#a78bfa] bg-clip-text text-transparent">
                  On video. Fast.
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base lg:mx-0 lg:text-lg">
                <strong className="font-medium text-foreground">{APP_NAME}</strong>{" "}
                turns templates, websites, and spreadsheets into branded videos.
                Edit in a simple workflow, preview live, and export MP4 — no
                timeline, no motion-design degree.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 lg:justify-start">
                <Button
                  asChild
                  variant="glow"
                  size="lg"
                  className="h-11 w-full rounded-xl sm:w-auto"
                >
                  <Link href="/templates">
                    <Wand2 className="h-4 w-4" /> Start creating
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 w-full rounded-xl sm:w-auto"
                >
                  <Link href="/dashboard">
                    Open dashboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground sm:mt-4 sm:text-xs">
                No install required · {TEMPLATE_CATALOG.length} templates · Free to try
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="min-w-0"
            >
              <HeroMockup />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-white/5 bg-black/20 px-4 py-8 sm:py-10 lg:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-semibold text-[#0b84f3] sm:text-3xl lg:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 px-4 py-12 sm:py-20 lg:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3 border-white/10 sm:mb-4">
                <Layers className="mr-1 h-3 w-3" /> Everything you need
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Three ways in. One video out.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
                Framekit is built for people who need video output, not a full
                editing suite — marketers, founders, analysts, and creators who
                want results today.
              </p>
            </motion.div>

            <div className="mt-8 grid gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                >
                  <Link
                    href={feature.href}
                    className="group flex h-full flex-col rounded-2xl border border-white/8 bg-card/50 p-5 transition hover:border-[#0b84f3]/40 hover:bg-card sm:p-6"
                  >
                    <div
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br sm:mb-4 sm:h-11 sm:w-11",
                        feature.accent
                      )}
                    >
                      <feature.icon className="h-5 w-5 text-[#0b84f3]" />
                    </div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                    <span className="mt-3 inline-flex items-center text-sm text-[#0b84f3] sm:mt-4 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                      Explore <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-t border-white/5 bg-black/25 px-4 py-12 sm:py-20 lg:px-6 lg:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="max-w-xl">
              <Badge variant="outline" className="mb-3 border-white/10 sm:mb-4">
                <Zap className="mr-1 h-3 w-3" /> Simple workflow
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                From idea to MP4 in three steps
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
                Skip the learning curve. Framekit keeps the workflow short so you
                spend time on the message, not the tool.
              </p>
            </motion.div>

            <div className="mt-8 grid gap-6 sm:mt-14 sm:gap-8 lg:grid-cols-3">
              {STEPS.map((item, i) => (
                <motion.div
                  key={item.step}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                  className="relative rounded-xl border border-white/5 bg-card/30 p-5 sm:border-0 sm:bg-transparent sm:p-0"
                >
                  <p className="font-display text-4xl font-bold text-[#0b84f3]/20 sm:text-5xl">
                    {item.step}
                  </p>
                  <h3 className="mt-1 text-base font-medium sm:mt-2 sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeUp} className="mt-8 text-center sm:mt-12">
              <Button
                asChild
                variant="glow"
                size="lg"
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                <Link href="/templates">Try the workflow</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Template showcase */}
        <section id="templates" className="scroll-mt-20 px-4 py-12 sm:py-20 lg:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="flex flex-col gap-4">
              <div>
                <Badge variant="outline" className="mb-3 border-white/10 sm:mb-4">
                  <LayoutTemplate className="mr-1 h-3 w-3" /> Template gallery
                </Badge>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                  {TEMPLATE_CATALOG.length} templates for every format
                </h2>
                <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
                  YouTube shorts, Instagram reels, product ads, podcast openers,
                  and data slideshows — each one editable and export-ready.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full sm:w-auto sm:self-start">
                <Link href="/templates">
                  Browse all templates <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:mt-10 lg:grid-cols-3">
              {(SHOWCASE.length > 0 ? SHOWCASE : TEMPLATE_CATALOG.slice(0, 6)).map(
                (t, i) => (
                  <motion.div
                    key={t.id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  >
                    <Link
                      href="/templates"
                      className="group block overflow-hidden rounded-xl border border-white/8 bg-card transition hover:border-[#0b84f3]/30 active:border-[#0b84f3]/30"
                    >
                      <div
                        className={cn(
                          "relative aspect-video bg-gradient-to-br",
                          t.thumbnail.startsWith("gradient")
                            ? "from-indigo-900/80 to-purple-900/60"
                            : "from-[#0b1020] to-[#1a1030]"
                        )}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#0b84f344,transparent_60%)]" />
                        <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
                          {t.popular && (
                            <Badge variant="secondary" className="text-[9px] sm:text-[10px]">
                              Popular
                            </Badge>
                          )}
                          {t.premium && (
                            <Badge className="bg-amber-500/90 text-[9px] text-black hover:bg-amber-500/90 sm:text-[10px]">
                              Pro
                            </Badge>
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b84f3] shadow-lg sm:h-10 sm:w-10">
                            <Play className="h-3.5 w-3.5 fill-white text-white sm:h-4 sm:w-4" />
                          </div>
                        </div>
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="text-sm font-medium sm:text-base">{t.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {t.description}
                        </p>
                        <p className="mt-1.5 text-[10px] text-muted-foreground sm:mt-2 sm:text-[11px]">
                          {t.category} · {t.aspectRatio}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="border-t border-white/5 bg-black/25 px-4 py-12 sm:py-16 lg:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3">
              {[
                {
                  icon: Globe,
                  title: "Marketing teams",
                  body: "Turn landing pages into launch videos without a production crew.",
                  href: "/website-to-video",
                },
                {
                  icon: FileSpreadsheet,
                  title: "Analysts & ops",
                  body: "Animate quarterly metrics from a spreadsheet in one upload.",
                  href: "/data-to-video",
                },
                {
                  icon: Palette,
                  title: "Brand owners",
                  body: "Lock colors, logo, and typography — every export stays on-brand.",
                  href: "/brand",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="rounded-2xl border border-white/8 bg-card/40 p-5 transition hover:border-[#0b84f3]/30 sm:p-6"
                >
                  <item.icon className="mb-2 h-5 w-5 text-[#0b84f3] sm:mb-3 sm:h-6 sm:w-6" />
                  <h3 className="text-sm font-medium sm:text-base">{item.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                    {item.body}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-4 py-12 sm:py-20 lg:px-6 lg:py-28">
          <motion.div
            {...fadeUp}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#0b84f3]/20 bg-gradient-to-br from-[#0b84f3]/10 via-card to-card p-6 text-center sm:rounded-3xl sm:p-10 lg:p-14"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0b84f3]/20 blur-3xl" />
            <h2 className="relative font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Start framing your next video
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:mt-4 sm:text-base">
              Open {APP_NAME}, pick a template or bring your own content, and
              ship a polished MP4 in minutes — not days.
            </p>
            <div className="relative mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              <Button
                asChild
                variant="glow"
                size="lg"
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                <Link href="/templates">
                  <Clapperboard className="h-4 w-4" /> Create free video
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 py-8 sm:py-10 lg:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0b84f3] text-white">
              <Clapperboard className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{APP_NAME}</p>
              <p className="text-[11px] text-muted-foreground">{APP_TAGLINE}</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="/templates" className="hover:text-foreground">
              Templates
            </Link>
            <Link href="/brand" className="hover:text-foreground">
              Brand kit
            </Link>
            <Link href="/exports" className="hover:text-foreground">
              Exports
            </Link>
            <Link href="/projects" className="hover:text-foreground">
              Timeline editor
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. Built for teams who ship video fast.
          </p>
        </div>
      </footer>
    </div>
  );
}
