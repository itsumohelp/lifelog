import type { Metadata } from "next";
import { ThemeModeScript } from 'flowbite-react';

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
      <head>
        <ThemeModeScript />
        <link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css" rel="stylesheet" />
      </head>
      <body className='flex flex-col min-h-screen'>
        {children}
      </body>
    </html>
  );
}
