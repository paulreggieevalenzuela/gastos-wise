import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import {
  AccentInitScript,
  AccentProvider,
} from "@/components/theme/accent-provider";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/services/auth";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GastosWise — Personal Finance",
  description: "A personal expense and finance tracker.",
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
      className={`${fraunces.variable} ${plexSans.variable}`}
    >
      <head>
        <AccentInitScript />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme={user?.themeMode ?? "system"}>
          <AccentProvider
            initialAccent={(user?.accentColor as never) ?? "emerald"}
          >
            {children}
          </AccentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
