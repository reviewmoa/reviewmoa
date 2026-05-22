import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReviewMoa",
  description: "우테코 공개 PR 리뷰를 리뷰카드로 탐색하는 학습 서비스"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
