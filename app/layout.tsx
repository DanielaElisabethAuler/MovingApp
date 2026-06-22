import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "vervou",
  description: "For the days you usually quit.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png", // iOS "Zum Home-Bildschirm"
  },
  appleWebApp: {
    capable: true, // iOS: als Standalone-App starten
    statusBarStyle: "black-translucent",
    title: "vervou",
  },
};

export const viewport: Viewport = {
  themeColor: "#ece7d6",
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
    <html lang="de" className={bricolage.variable}>
      <body className={bricolage.className}>
        {/* Splash beim App-Start: gruenes Icon mittig, blendet nach Laden aus. */}
        <div id="splash" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="" width={132} height={132} />
        </div>
        <div className="wrap">{children}</div>
        {/* PWA-SW registrieren + Splash ausblenden. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }
              window.addEventListener('load', function () {
                var s = document.getElementById('splash');
                if (!s) return;
                setTimeout(function () {
                  s.classList.add('hide');
                  setTimeout(function () { s.style.display = 'none'; }, 600);
                }, 450);
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
