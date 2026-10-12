import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP, Unbounded } from "next/font/google";
import "@/styles/globals.css";

// 書体の CSS 変数（--font-geist など）は、tokens.css の --font-* から使う
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
// 日本語の文字は subsets で選べないので、先読みしない（Google Fonts が文字の範囲ごとに分けて配る）
const notoSansJp = Noto_Sans_JP({
  preload: false,
  variable: "--font-noto-sans-jp",
});
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  title: "memory-forge",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${notoSansJp.variable} ${unbounded.variable}`}
    >
      <body className="bg-bg font-sans text-text">{children}</body>
    </html>
  );
}
