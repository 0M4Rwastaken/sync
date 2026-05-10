"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PodNavbarProps {
  podName?: string;
  isSidebarOpen: boolean;
  onToggle: () => void;
  notificationCount?: number;
  isCanvasOpen?: boolean;
}

export function PodNavbar({
  podName = "",
  isSidebarOpen,
  onToggle,
  notificationCount = 0,
  isCanvasOpen = false,
}: PodNavbarProps) {
  const iconBtnClass =
    "text-text-primary hover:bg-base-overlay aria-expanded:bg-base-overlay";

  return (
    <header
      className={cn(
        "flex h-12 w-full shrink-0 items-center justify-between border-b border-base-border bg-base-surface px-3"
      )}
    >
      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(iconBtnClass)}
          onClick={onToggle}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-4" aria-hidden />
          ) : (
            <PanelLeftOpen className="size-4" aria-hidden />
          )}
        </Button>
      </div>
      <span className="text-sm font-medium text-text-primary">{podName}</span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(iconBtnClass)}
          aria-label="Open search"
        >
          <Search className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(iconBtnClass, isCanvasOpen && "bg-base-overlay")}
          aria-label="Open pod canvas"
          onClick={() => {
            // TODO: wire canvas panel open handler
          }}
        >
          <LayoutTemplate className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(iconBtnClass, "relative")}
          aria-label="Notifications"
        >
          <Bell className="size-4" aria-hidden />
          {notificationCount > 0 ? (
            <span
              className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-base-elevated px-0.5 text-[10px] font-medium text-text-primary ring-1 ring-base-border"
              aria-hidden
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          ) : null}
        </Button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7",
              userButtonPopoverCard: "bg-base-elevated border border-base-border",
              userButtonPopoverActionButton:
                "text-text-primary hover:bg-base-overlay",
              userButtonPopoverActionButtonText: "text-text-primary",
            },
          }}
        />
      </div>
    </header>
  );
}
