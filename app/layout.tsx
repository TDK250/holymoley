import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Holy Moley - Mole Tracker",
    description: "Track and monitor your skin health in 3D",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased overflow-hidden`}>
                {children}
            </body>
        </html>
    );
}
