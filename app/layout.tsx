import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lifelog"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className='flex flex-col min-h-screen'>
        {children}
      </body>
    </html>
  );
}
