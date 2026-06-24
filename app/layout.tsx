import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getdocdrift.com";

export const metadata: Metadata = {
  title: {
    default: "DocDrift — Documentation that keeps up with your code",
    template: "%s | DocDrift",
  },
  description:
    "DocDrift watches your GitHub PRs and automatically opens a documentation PR every time your code changes. No more stale READMEs.",
  keywords: [
    "documentation",
    "github",
    "automation",
    "developer tools",
    "readme",
  ],
  authors: [{ name: "DocDrift" }],
  creator: "DocDrift",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "DocDrift",
    title: "DocDrift — Documentation that keeps up with your code",
    description:
      "Automated GitHub documentation updates. Every PR, every time.",
    images: [
      {
        url: `${appUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "DocDrift",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocDrift — Documentation that keeps up with your code",
    description:
      "Automated GitHub documentation updates. Every PR, every time.",
    images: [`${appUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
