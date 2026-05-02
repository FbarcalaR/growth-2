import type { ReactNode } from "react";

import { cn } from "@/client/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: string;
  /** Optional right-aligned slot, typically a primary action (`+ New`, `Save`, etc.). */
  actions?: ReactNode;
  className?: string;
};

/**
 * Top-of-page heading + lead text + actions row. Shared by the authed tabs
 * (`/today`, `/garden`, ...) so they keep a consistent rhythm and the page's
 * semantic `<h1>` lives in exactly one place per screen.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-end justify-between", className)}>
      <div>
        <h1 className="text-ink-strong text-[22px] leading-tight font-extrabold">{title}</h1>
        {description && <p className="text-brand-muted text-xs">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
