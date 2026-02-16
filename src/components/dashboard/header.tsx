"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div />

      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
            JD
          </AvatarFallback>
        </Avatar>
        <div className="hidden flex-col sm:flex">
          <span className="text-sm font-medium leading-none text-foreground">
            Jane Doe
          </span>
          <span className="text-xs text-muted-foreground">jane@chrono.app</span>
        </div>
      </div>
    </header>
  );
}
