"use client";

import Link from "next/link";
import {
  Bell,
  CreditCard,
  Keyboard,
  LogOut,
  Plus,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useUIStore } from "@/stores/ui-store";
import { formatRelative } from "@/lib/utils";

export function Header({ title }: { title?: string }) {
  const {
    setCommandOpen,
    setShortcutsOpen,
    notifications,
    markNotificationRead,
    markAllRead,
  } = useUIStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="min-w-0 flex-1">
        {title ? (
          <h1 className="truncate text-sm font-semibold tracking-tight">
            {title}
          </h1>
        ) : (
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="relative flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-left text-sm text-muted-foreground transition hover:bg-muted"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search projects, templates…</span>
            <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium sm:flex">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button asChild size="sm" variant="glow" className="hidden sm:inline-flex">
          <Link href="/projects?new=1">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShortcutsOpen(true)}
          aria-label="Keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unread > 0 && (
                <button
                  type="button"
                  className="text-[11px] text-primary hover:underline"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-0.5 py-2.5"
                onClick={() => markNotificationRead(n.id)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium">{n.title}</span>
                  {!n.read && <Badge variant="default">New</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelative(n.createdAt)}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/15 text-[10px] text-primary">
                  AR
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="text-sm font-medium text-foreground">Alex Rivera</p>
              <p className="text-xs text-muted-foreground">alex@lumen.studio</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing">
                <CreditCard className="h-4 w-4" /> Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
