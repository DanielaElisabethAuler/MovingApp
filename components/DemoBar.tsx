"use client";

import { useRouter } from "next/navigation";
import { resetDemo } from "@/app/actions";

// Nur im Demo-Modus (ohne Supabase) sichtbar: kennzeichnet die lokale
// Datei-Persistenz und erlaubt einen schnellen Reset zum Wieder-Testen.
export function DemoBar() {
  const router = useRouter();
  return (
    <span className="row" style={{ gap: 12, alignItems: "center" }}>
      <span className="pill">Demo-Modus (lokal)</span>
      <a
        href="#"
        onClick={async (e) => {
          e.preventDefault();
          await resetDemo();
          router.push("/");
          router.refresh();
        }}
      >
        zuruecksetzen
      </a>
    </span>
  );
}
