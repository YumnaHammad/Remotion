"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  BarChart3,
  Box,
  Boxes,
  Captions,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Download,
  FolderOpen,
  Home,
  Images,
  Layers,
  LayoutTemplate,
  ListVideo,
  Mic,
  Music,
  Palette,
  PlayCircle,
  Server,
  Settings,
  Sparkles,
  Users,
  Wand2,
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
  Images,
  Mic,
  Palette,
  Download,
  Users,
  BarChart3,
  Settings,
  Clapperboard,
  Boxes,
  ListVideo,
  Music,
  Layers,
  Sparkles,
  Wand2,
  ArrowLeftRight,
  Captions,
  Box,
  PlayCircle,
  Server,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative z-30 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out",
          sidebarCollapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b84f3] text-white shadow-lg shadow-[#0b84f3]/35">
            <Clapperboard className="h-4 w-4" />
          </div>
          {!sidebarCollapsed && (
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
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto px-2 py-2 scrollbar-thin">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-0.5">
              {!sidebarCollapsed && (
                <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const Icon = ICONS[item.icon as keyof typeof ICONS];
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
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
                    {!sidebarCollapsed && (
                      <span className="truncate font-medium">{item.label}</span>
                    )}
                  </Link>
                );

                if (sidebarCollapsed) {
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

        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
