// Hover-reveal toolbar for fullscreen presentation views (slides, textbook).
import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

export function PresentationToolbar(props: {
  children: ReactNode;
  className?: string;
  /** Pin the bar visible (e.g. while a menu is open). */
  pinned?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const show = props.pinned || open;

  return (
    <div
      className={cn("fixed inset-x-0 bottom-0 z-50 h-24", props.className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onClick={() => setOpen((v) => !v)}
    >
      <div
        className={cn(
          "absolute inset-x-0 bottom-4 flex justify-center px-4 transition duration-200",
          show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
      >
        <div
          className="flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background/92 px-3 py-2 shadow-lg backdrop-blur-md"
          role="toolbar"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}
