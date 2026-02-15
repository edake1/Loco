import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loco - Sound Like a Local",
  description: "Transform your messages to sound native, warm, and authentic. Connect deeper with friends by speaking their heart language.",
  keywords: ["translation", "language", "native", "slang", "friends", "connection", "AI"],
  authors: [{ name: "Loco" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Loco - Sound Like a Local",
    description: "Transform your messages to sound native and authentic",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loco - Sound Like a Local",
    description: "Transform your messages to sound native and authentic",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
