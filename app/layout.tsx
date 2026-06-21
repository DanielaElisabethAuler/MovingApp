import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bewegungs-Coach",
  description: "Der Boden wird winzig und unkaputtbar, die Decke bleibt offen.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png", // iOS "Zum Home-Bildschirm"
  },
  appleWebApp: {
    capable: true, // iOS: als Standalone-App starten
    statusBarStyle: "black-translucent",
    title: "Coach",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1116",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <div className="wrap">{children}</div>
        {/* PWA: Service Worker registrieren (Installierbarkeit, Phase 1). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
