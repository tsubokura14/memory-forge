import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "memory-forge",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-bg font-sans text-text">{children}</body>
    </html>
  );
}
