import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/store/Providers";
import { BottomTab } from "@/components/BottomTab";

export const metadata: Metadata = {
  title: "FridgeMate",
  description: "扫一下、抽一下、拍一下，居家减脂从冰箱开始",
  icons: {
    icon: "/file.svg",
    shortcut: "/file.svg",
    apple: "/file.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col pb-[80px] md:pb-0">
            <div className="flex-1">
              {children}
            </div>
            <BottomTab />
          </div>
        </Providers>
      </body>
    </html>
  );
}
