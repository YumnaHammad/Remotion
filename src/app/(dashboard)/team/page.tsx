"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MOCK_TEAM } from "@/data/mock";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team Workspace</h1>
          <p className="text-sm text-muted-foreground">
            Collaborate on projects and brand kits
          </p>
        </div>
        <Button variant="glow">
          <UserPlus className="h-4 w-4" /> Invite
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {MOCK_TEAM.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0"
          >
            <Avatar>
              <AvatarFallback>
                {m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{m.name}</p>
              <p className="truncate text-xs text-muted-foreground">{m.email}</p>
            </div>
            <Badge variant="secondary">{m.role}</Badge>
            <Badge variant={m.status === "active" ? "success" : "warning"}>
              {m.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
