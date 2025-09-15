import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AVAI - AI-Powered Security Auditing Platform",
  description: "Next-gen AI-powered security auditing platform for code analysis, vulnerability detection, and security recommendations.",
  keywords: ["security", "vulnerability", "code analysis", "AI", "cybersecurity", "audit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased h-screen bg-background text-foreground font-sans overflow-hidden`}
        suppressHydrationWarning={true}
      >
        {/* Background layers for premium cyber aesthetic */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-cyber-mesh" />
          <div className="absolute inset-0 bg-cyber-grid opacity-30" />
          <div className="absolute inset-0 bg-noise mix-blend-overlay" />
        </div>

        <ThemeProvider>
          {/* Content container - exactly 100vh with no overflow */}
          <div className="relative h-screen overflow-hidden">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
