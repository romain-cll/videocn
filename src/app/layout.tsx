import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import Script from "next/script";
import { PAGE_DESCRIPTIONS } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  // Rend absolues les URL des images Open Graph et des canoniques.
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  keywords: ["shadcn", "shadcn/ui", "video player", "react", "registry", "HLS", "DASH", "Shaka Player", "tailwind"],
  title: {
    default: "videoCn — a video player for shadcn/ui",
    template: "%s — videoCn",
  },
  description: PAGE_DESCRIPTIONS.home,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className="bg-background text-foreground min-h-svh antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
        {/* Plausible, auto-hébergé : liens sortants et événements balisés. La
            file `window.plausible.q` accepte des appels avant le chargement du
            script. Plausible ignore `localhost` de lui-même. */}
        <Script
          defer
          data-domain="videocn.dev"
          src="https://plausible.spotime.fr/js/script.outbound-links.tagged-events.js"
        />
        <Script id="plausible-init">
          {"window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }"}
        </Script>
      </body>
    </html>
  );
}
