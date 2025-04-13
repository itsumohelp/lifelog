import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITSUMO"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className='flex flex-col h-screen'>
        {children}
        <link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css" rel="stylesheet" />
      </body>
    </html>
  );
}
