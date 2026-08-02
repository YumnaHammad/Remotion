"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Clapperboard,
  Download,
  FileSpreadsheet,
  Globe,
  Layers,
  LayoutTemplate,
  Menu,
  Palette,
  Play,
  Rocket,
  Sparkles,
  Users,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { TEMPLATE_CATALOG, LONG_FORM_CATEGORIES } from "@/templates/catalog";
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
  { href: "#pricing", label: "Pricing" },
] as const;

const TRUSTED_BY = [
  { icon: Building2, label: "Businesses" },
  { icon: Users, label: "Agencies" },
  { icon: Sparkles, label: "Creators" },
  { icon: Rocket, label: "Startups" },
] as const;

const FEATURES = [
  {
    icon: FileSpreadsheet,
    title: "Data to Video",
    description:
      "Upload CSV, Excel, or JSON — each row becomes an animated scene with charts and stats.",
    href: "/data-to-video",
    accent: "from-violet-500/20 to-transparent",
  },
  {
    icon: Sparkles,
    title: "Script to Video",
    description:
      "Generate professional voiceovers, subtitles, and scenes directly from text prompts.",
    href: "/script-to-video",
    accent: "from-pink-500/20 to-transparent",
  },
  {
    icon: Globe,
    title: "Website to Video",
    description:
      "Convert blogs, portfolios, or product pages into videos by pasting the URL.",
    href: "/website-to-video",
    accent: "from-[#0b84f3]/20 to-transparent",
  },
  {
    icon: Layers,
    title: "Timeline Studio",
    description:
      "A Premiere-grade multi-track video timeline editor in React. Move, trim, split, and compose clips.",
    href: "/projects",
    accent: "from-cyan-500/20 to-transparent",
  },
  {
    icon: Zap,
    title: "Fast export",
    description:
      "Live preview as you edit. Export MP4 in 720p, Full HD, or 4K when you're ready.",
    href: "/exports",
    accent: "from-amber-500/20 to-transparent",
  },
  {
    icon: Download,
    title: "Render Center",
    description:
      "High-speed MP4, WebM, and GIF exports with complete frame-accurate quality settings.",
    href: "/exports",
    accent: "from-emerald-500/20 to-transparent",
  },
] as const;

const STEPS = [
  {
    step: "01",
    title: "Choose a template",
    body: "Pick from business reports, social clips, marketing ads, or data-driven layouts.",
  },
  {
    step: "02",
    title: "Upload content",
    body: "Add images, videos, CSV, Excel, or JSON — or paste a website URL to auto-fill.",
  },
  {
    step: "03",
    title: "Customize",
    body: "Edit text, colors, scenes, animation presets, and music from the audio library.",
  },
  {
    step: "04",
    title: "Preview",
    body: "Watch every scene update live before you commit to an export.",
  },
  {
    step: "05",
    title: "Export",
    body: "Download MP4 — watermark-free on Pro, with priority rendering.",
  },
] as const;

const SHOWCASE = TEMPLATE_CATALOG.filter((t) => t.featured || t.longForm).slice(0, 6);

const STATS = [
  { value: String(TEMPLATE_CATALOG.length), label: "Templates" },
  { value: "5 min", label: "Max duration" },
  { value: "50", label: "Scenes per video" },
  { value: "4K", label: "Export quality" },
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
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 text-foreground">
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
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="glow" size="sm" className="hidden min-[480px]:inline-flex">
              <Link href="/showcase">
                <span className="hidden sm:inline">Get started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="md:hidden text-muted-foreground hover:text-foreground"
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
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={closeMenu}
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(100vw,320px)] flex-col border-l border-border bg-background p-4 shadow-2xl md:hidden text-foreground"
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
                    className="rounded-lg px-3 py-3 text-base font-medium transition hover:bg-muted"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-2 pt-6">
                <Button asChild variant="glow" className="w-full rounded-xl">
                  <Link href="/showcase" onClick={closeMenu}>
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-xl border-border">
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
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none text-foreground">
      <div className="absolute -inset-2 rounded-3xl bg-[#0b84f3]/10 blur-2xl sm:-inset-4 sm:blur-3xl" />
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 sm:rounded-2xl">
        <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2.5 sm:px-4 sm:py-3 bg-muted/20">
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
        <div className="flex gap-1 border-b border-border/40 bg-muted/30 p-2 sm:hidden">
          {["Templates", "Brand", "Export"].map((item, i) => (
            <div
              key={item}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-center text-[10px]",
                i === 0
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item}
            </div>
          ))}
        </div>

        <div className="grid min-h-[240px] sm:min-h-[320px] sm:grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] lg:min-h-[360px] lg:grid-cols-[140px_1fr]">
          <div className="hidden space-y-1 border-r border-border/40 bg-muted/20 p-2 sm:block">
            {["Templates", "Brand", "Export"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "rounded-md px-2 py-2 text-[10px] md:text-[11px]",
                  i === 0
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="flex min-w-0 flex-col p-3 sm:p-4 bg-background/50">
            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
              <p className="truncate text-xs font-semibold">Product Launch</p>
              <Badge className="shrink-0 bg-[#0b84f3]/95 px-1.5 text-[9px] text-white hover:bg-[#0b84f3]/95 sm:text-[10px]">
                Live preview
              </Badge>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-lg bg-gradient-to-br from-card via-secondary/15 to-background border border-border/40 sm:rounded-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#0b84f325,transparent_55%)]" />
              <div className="relative flex h-full min-h-[140px] flex-col items-center justify-center p-4 text-center sm:min-h-[180px] sm:p-6">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold sm:mb-3 sm:h-10 sm:w-10 sm:text-xs">
                  FK
                </div>
                <p className="font-display text-base font-semibold tracking-tight">
                  Ship faster
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                  Your product story, on video
                </p>
                <motion.div
                  className="mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#0b84f3] shadow-lg shadow-[#0b84f3]/30 sm:mt-4 sm:h-8 sm:w-8"
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
                  className="rounded-md border border-border bg-muted/40 px-1.5 py-1 text-center text-[9px] text-muted-foreground sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-[10px]"
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
    <div className="mesh-bg min-h-dvh overflow-x-hidden text-foreground bg-background">
      <LandingNav />

      <main className="pb-[env(safe-area-inset-bottom)]">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-12 pt-10 sm:pb-16 sm:pt-14 lg:px-6 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,#0b84f315,transparent)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="min-w-0 text-center lg:text-left"
            >
              <Badge className="mb-4 max-w-full whitespace-normal border-[#0b84f3]/20 bg-[#0b84f3]/10 px-2.5 py-1 text-[11px] leading-snug text-primary hover:bg-[#0b84f3]/10 sm:mb-5 sm:text-xs">
                <Sparkles className="mr-1 inline h-3 w-3 shrink-0" />
                Long-form · Multi-scene · Data to video
              </Badge>
              <h1 className="font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
                Turn Data, Content, and Ideas into Professional Videos in Minutes.
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base lg:mx-0 lg:text-lg">
                Create business reports, presentations, social media videos, and
                analytics videos without complex editing.{" "}
                <strong className="font-medium text-foreground">{APP_NAME}</strong>{" "}
                keeps it template-based — powerful output, simple workflow.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3 lg:justify-start">
                <Button
                  asChild
                  variant="glow"
                  size="lg"
                  className="h-11 w-full rounded-xl sm:w-auto"
                >
                  <Link href="/showcase">
                    <Wand2 className="h-4 w-4" /> Start Creating
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-11 w-full rounded-xl sm:w-auto border-border"
                >
                  <Link href="/showcase">
                    Explore Templates <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground sm:mt-4 sm:text-xs">
                No install required · {TEMPLATE_CATALOG.length} templates · Free plan available
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

        {/* Trusted by */}
        <section className="border-b border-border bg-muted/20 px-4 py-8 lg:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
              Trusted by
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRUSTED_BY.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border/40 bg-card py-4"
                >
                  <item.icon className="h-5 w-5 text-[#0b84f3]" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-border bg-muted/10 px-4 py-8 sm:py-10 lg:px-6">
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
              <Badge variant="outline" className="mb-3 border-border/60 sm:mb-4">
                <Layers className="mr-1 h-3 w-3" /> Everything you need
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Everything you need for professional video
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
                Framekit is built for teams who need polished long-form output
                without a full editing suite — marketers, founders, analysts, and creators.
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
                    className="group flex h-full flex-col rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 transition hover:border-[#0b84f3]/40 hover:bg-card sm:p-6"
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
          className="scroll-mt-20 border-t border-border bg-muted/10 px-4 py-12 sm:py-20 lg:px-6 lg:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="max-w-xl">
              <Badge variant="outline" className="mb-3 border-border/60 sm:mb-4">
                <Zap className="mr-1 h-3 w-3" /> Simple workflow
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                From template to export in five steps
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
                Skip the learning curve. Framekit keeps the workflow short so you
                spend time on the message, not the tool.
              </p>
            </motion.div>

            <div className="mt-8 grid gap-6 sm:mt-14 sm:gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {STEPS.map((item, i) => (
                <motion.div
                  key={item.step}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                  className="relative rounded-xl border border-border/40 bg-card/30 p-5 sm:border-0 sm:bg-transparent sm:p-0"
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
                <Link href="/showcase">Try the workflow</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 px-4 py-12 sm:py-20 lg:px-6 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-3 border-white/10 sm:mb-4">
                Simple pricing
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Start free. Upgrade when you scale.
              </h2>
            </motion.div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14">
              <motion.div
                {...fadeUp}
                className="rounded-2xl border border-white/8 bg-card/50 p-6 sm:p-8"
              >
                <p className="text-sm font-medium text-muted-foreground">Free</p>
                <p className="mt-2 font-display text-3xl font-semibold">$0</p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li>5 exports per month</li>
                  <li>Watermark on exports</li>
                  <li>720p export quality</li>
                  <li>Access to editor & automation</li>
                </ul>
                <Button asChild variant="outline" className="mt-8 w-full rounded-xl">
                  <Link href="/dashboard">Get started free</Link>
                </Button>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.08 }}
                className="relative rounded-2xl border border-[#0b84f3]/30 bg-gradient-to-br from-[#0b84f3]/10 to-card p-6 sm:p-8"
              >
                <Badge className="absolute right-4 top-4 bg-[#0b84f3] text-white">
                  Popular
                </Badge>
                <p className="text-sm font-medium text-[#93c5fd]">Pro</p>
                <p className="mt-2 font-display text-3xl font-semibold">
                  $29<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li>Unlimited exports</li>
                  <li>Full HD and 4K export</li>
                  <li>Multi-track Timeline Studio</li>
                  <li>Asset library & voiceovers</li>
                  <li>Priority rendering</li>
                </ul>
                <Button asChild variant="glow" className="mt-8 w-full rounded-xl">
                  <Link href="/dashboard">Upgrade to Pro</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Use cases — quick links */}
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
                  icon: Layers,
                  title: "Video creators",
                  body: "Animate texts, add voiceovers, trim scenes, and compose in Timeline Studio.",
                  href: "/projects",
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
                <Link href="/script-to-video">
                  <Clapperboard className="h-4 w-4" /> Create free video
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 w-full rounded-xl sm:w-auto border-border"
              >
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 sm:py-10 lg:px-6">
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
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
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
