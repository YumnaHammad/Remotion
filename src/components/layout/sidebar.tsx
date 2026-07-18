"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Download,
  FileSpreadsheet,
  FolderOpen,
  Globe,
  Home,
  Image,
  LayoutTemplate,
  Music,
  Palette,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, APP_TAGLINE, NAV_SECTIONS } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICONS = {
  Home,
  FolderOpen,
  LayoutTemplate,
  Palette,
  Download,
  Settings,
  Globe,
  FileSpreadsheet,
  Sparkles,
  Image,
  Music,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } =
    useUIStore();

  const showLabels = mobileNavOpen || !sidebarCollapsed;

  const closeMobile = () => setMobileNavOpen(false);

  return (
    <TooltipProvider delayDuration={0}>
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
            aria-label="Close menu"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[transform,width] duration-300 ease-out",
          "w-[min(280px,85vw)]",
          sidebarCollapsed ? "lg:w-[68px]" : "lg:w-[240px]",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-3 transition hover:bg-muted/40"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0b84f3] text-white shadow-lg shadow-[#0b84f3]/35">
            <Clapperboard className="h-4 w-4" />
          </div>
          {showLabels && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="min-w-0"
            >
              <p className="truncate text-sm font-semibold tracking-tight">
                {APP_NAME}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {APP_TAGLINE}
              </p>
            </motion.div>
          )}
        </Link>

        <nav className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-2 py-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-0.5">
              {showLabels && (
                <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = ICONS[item.icon as keyof typeof ICONS];
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm transition-colors sm:py-2",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
                      />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    {showLabels && (
                      <span className="truncate font-medium">{item.label}</span>
                    )}
                  </Link>
                );

                if (sidebarCollapsed && !mobileNavOpen) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{link}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }
                return link;
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-sidebar-border bg-sidebar/95 p-2 backdrop-blur-sm">
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 h-9 w-full justify-start gap-2 px-2.5 text-muted-foreground hover:text-foreground lg:hidden"
            onClick={closeMobile}
          >
            <X className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">Close menu</span>
          </Button>

          {/* Desktop collapse */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "hidden h-9 w-full text-muted-foreground hover:text-foreground lg:flex",
                  sidebarCollapsed ? "justify-center px-0" : "justify-start gap-2 px-2.5"
                )}
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">Collapse</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
