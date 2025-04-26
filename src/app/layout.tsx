import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "沉浸式音乐 | Immersive Music Experience",
  description: "一个星空背景下的沉浸式音乐播放体验",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geist.className} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}
