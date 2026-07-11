import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ClientGuard } from "@/components/layout/client-guard";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Admin | Enterprise Platform",
  description: "Premium Personal Finance Management",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className={inter.className}>
        <ClientGuard />
        {children}
        {/* Enterprise Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
