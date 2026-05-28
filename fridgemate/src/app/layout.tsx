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
          {/* The scan page hides the BottomTab and handles its own fullscreen layout,
              so pb-[60px] is only needed for non-scan pages. We use a CSS approach:
              scan page has its own full-height fixed layout. */}
          <div className="flex min-h-screen flex-col pb-[60px] md:pb-0">
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
