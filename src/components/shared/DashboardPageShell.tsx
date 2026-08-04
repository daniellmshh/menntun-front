import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardPageShellProps {
  children: ReactNode;
  className?: string;
}

/** The dashboard layout owns the background; modules only define content rhythm. */
export default function DashboardPageShell({ children, className }: DashboardPageShellProps) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl space-y-6 p-6 lg:p-8 animate-fade-in", className)}>
      {children}
    </main>
  );
}
