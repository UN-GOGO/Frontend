import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polaris — 국제기구 커리어 네비게이터",
  description:
    "외교부 공공데이터 기반, 국제기구 커리어를 준비하는 한국 학생을 위한 네비게이터",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
