"use client";

import { useState } from "react";

import { PodNavbar } from "@/components/pod/pod-navbar";
import { PodSidebar } from "@/components/pod/pod-sidebar";

export interface PodLayoutProps {
  children: React.ReactNode;
  podName?: string;
}

export function PodLayout({ children, podName }: PodLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PodNavbar
        podName={podName}
        isSidebarOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
      />
      <div className="flex min-h-0 flex-1 flex-row overflow-hidden">
        <PodSidebar isOpen={isSidebarOpen} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
