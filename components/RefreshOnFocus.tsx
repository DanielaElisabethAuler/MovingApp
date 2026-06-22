"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Zieht frische Daten aus Supabase, sobald der Tab wieder in den Fokus kommt.
// So sieht jedes Geraet (Desktop/Handy, gleicher Account) die neuesten
// Aenderungen, ohne manuell neu zu laden. Gedrosselt, damit es nicht spammt.
export function RefreshOnFocus() {
  const router = useRouter();

  useEffect(() => {
    let last = Date.now();
    function maybeRefresh() {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - last > 3000) {
        last = now;
        router.refresh();
      }
    }
    document.addEventListener("visibilitychange", maybeRefresh);
    window.addEventListener("focus", maybeRefresh);
    return () => {
      document.removeEventListener("visibilitychange", maybeRefresh);
      window.removeEventListener("focus", maybeRefresh);
    };
  }, [router]);

  return null;
}
