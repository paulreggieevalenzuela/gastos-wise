import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import {
  AccentInitScript,
  AccentProvider,
  ThemeStyle,
} from "@/components/theme/accent-provider";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/services/auth";

// Manrope (SIL Open Font License, see src/app/fonts/manrope/OFL.txt),
// self-hosted from the repo — no Google Fonts request at build or runtime.
// Two subsets: Latin for everything, Latin Extended mainly for the ₱ sign.
const manrope = localFont({
  src: "./fonts/manrope/Manrope-latin-variable.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

const manropeExt = localFont({
  src: "./fonts/manrope/Manrope-latin-ext-variable.woff2",
  variable: "--font-manrope-ext",
  weight: "200 800",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "GastosWise — Personal Finance",
  description: "A personal expense and finance tracker.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GastosWise",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F6F4" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1210" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session ? await getUserById(session.userId) : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${manropeExt.variable}`}
    >
      <head>
        <ThemeStyle accent={user?.accentColor} />
        <AccentInitScript />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme={user?.themeMode ?? "system"}>
          <AccentProvider initialAccent={user?.accentColor ?? null}>{children}</AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
