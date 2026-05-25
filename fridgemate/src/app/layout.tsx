import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/store/Providers";
import { BottomTab } from "@/components/BottomTab";

export const metadata: Metadata = {
  title: "FridgeMate",
  description: "扫一下、抽一下、拍一下，居家减脂从冰箱开始",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="pb-20">
        <Providers>
          {children}
          <BottomTab />
        </Providers>
      </body>
    </html>
  );
}
