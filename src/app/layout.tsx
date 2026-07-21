import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TeslaPrimeCapital — Enterprise Managed Investment Plans",
  description: "Maximize your returns with TeslaPrimeCapital's tiered investment plans. Basic, Silver, Gold, and Platinum tiers with daily returns up to 1.8%.",
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}