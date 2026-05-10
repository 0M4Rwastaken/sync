import { Headphones, Mic, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PodSidebarProps {
  isOpen: boolean;
}

export function PodSidebar({ isOpen }: PodSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden border-r border-base-border bg-base-surface transition-all duration-200",
        isOpen ? "w-60" : "w-0"
      )}
    >
      <div className="flex h-12 shrink-0 items-center border-b border-base-border px-3">
        <span className="truncate text-sm font-medium text-text-primary">
          Workspace
        </span>
      </div>
      <div className="shrink-0 border-b border-base-border p-2">
        <div
          className="flex h-8 items-center gap-2 rounded-md border border-base-border bg-base-overlay px-2"
          role="search"
        >
          <Search
            className="size-3.5 shrink-0 text-text-tertiary"
            aria-hidden
          />
          <span className="text-xs text-text-tertiary">Search...</span>
        </div>
      </div>
      <div className="pod-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
        {/* Channel list sections go here */}
      </div>
      <div className="flex h-14 shrink-0 items-center gap-2 border-t border-base-border px-2">
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-base-overlay text-xs font-medium text-text-primary"
          aria-hidden
        >
          ME
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">
            Username
          </p>
          <p className="truncate text-xs text-text-tertiary">Status</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-text-primary hover:bg-base-overlay"
            aria-label="Microphone"
          >
            <Mic className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-text-primary hover:bg-base-overlay"
            aria-label="Headphones"
          >
            <Headphones className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </aside>
  );
}
