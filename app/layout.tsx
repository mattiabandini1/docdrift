import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://getdocdrift.com";

export const metadata: Metadata = {
  title: {
    default: "DocDrift",
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
  icons: {
    icon: "/images/logo/dark_logo2.png",
    shortcut: "/images/logo/dark_logo2.png",
    apple: "/images/logo/dark_logo2.png",
  },
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
        url: `${appUrl}/images/logo/dark_logo_nobg.png`,
        width: 1080,
        height: 1080,
        alt: "DocDrift",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocDrift — Documentation that keeps up with your code",
    description:
      "Automated GitHub documentation updates. Every PR, every time.",
    images: [`${appUrl}/images/logo/dark_logo_nobg.png`],
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
      className={`${inter.className} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
