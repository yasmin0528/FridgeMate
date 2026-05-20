import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FridgeMate \u4e0a\u4f20\u8bc6\u522b",
  description: "FridgeMate \u62cd\u7167\u4e0a\u4f20\u4e0e\u98df\u6750\u8bc6\u522b\u9875\u9762",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
