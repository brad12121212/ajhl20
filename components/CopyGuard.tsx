"use client";

import { useEffect } from "react";

/**
 * Prevents right-click context menu site-wide to discourage saving images / copying via menu.
 * Does not prevent keyboard copy (Ctrl+C) or dev tools; those cannot be fully blocked.
 */
export function CopyGuard() {
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () => document.removeEventListener("contextmenu", preventContextMenu);
  }, []);
  return null;
}
