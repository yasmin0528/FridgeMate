import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FridgeMate",
  description: "扫一下、抽一下、拍一下，居家减脂从冰箱开始",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
