import type {Metadata} from "next";
import {GoogleAnalytics} from '@next/third-parties/google'

export const metadata: Metadata = {
    title: "Marsflare"
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <head>
                <link href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css" rel="stylesheet" />
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-3W114GLVB9"></script>
                <GoogleAnalytics gaId="G-3W114GLVB9" />
            </head>
            <body>
                <a className="text-2xl font-bold" href="/">Marsflare</a>
                {children}
            </body>
        </html>
    );
}
