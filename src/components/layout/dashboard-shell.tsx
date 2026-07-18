"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
import { ShortcutsDialog } from "@/components/layout/shortcuts-dialog";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function DashboardShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="mesh-bg h-dvh overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex h-dvh min-w-0 flex-col overflow-hidden transition-[margin-left] duration-300 ease-out",
          sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[240px]"
        )}
      >
        <Header title={title} />
        <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
      <CommandPalette />
      <ShortcutsDialog />
    </div>
  );
}
