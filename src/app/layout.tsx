import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import { themeScript } from "@/components/theme";
import "@/styles/globals.css";

// 書体の CSS 変数（--font-noto-sans-jp など）は、tokens.css の --font-* の並びの最後から使う。
// OS に md-leaf と同じ書体がない端末（画面の画像を撮る Docker の中など）だけが、これらで出す
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
// 英字（latin）の範囲だけを先読みする。日本語の文字は subsets で選べないので、Google Fonts が文字の範囲ごとに分けて配り、
// ブラウザが要る範囲のファイルだけをあとから読む
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-jp",
});
const notoSerifJp = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-jp",
});

export const metadata: Metadata = {
  title: "memory-forge",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistMono.variable} ${notoSansJp.variable} ${notoSerifJp.variable}`}
      // data-theme は、下のスクリプトが React より先に付けるので、サーバーの HTML と食い違う
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg font-ui text-text">{children}</body>
    </html>
  );
}
