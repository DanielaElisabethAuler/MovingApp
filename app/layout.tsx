import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Felicurv",
  description: "Der Boden wird winzig und unkaputtbar, die Decke bleibt offen.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png", // iOS "Zum Home-Bildschirm"
  },
  appleWebApp: {
    capable: true, // iOS: als Standalone-App starten
    statusBarStyle: "black-translucent",
    title: "Felicurv",
  },
};

export const viewport: Viewport = {
  themeColor: "#f0efeb",
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
    <html lang="de" className={poppins.variable}>
      <body className={poppins.className}>
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
