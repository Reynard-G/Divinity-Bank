import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Divinity Bank",
  description: "Secure financial management for Minecraft servers",
  keywords: ["banking", "minecraft", "finance", "transactions"],
  authors: [{ name: "Divinity Bank Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${inter.className} 
          font-neue_haas_grotesk 
          tracking-wide 
          antialiased 
          dark
        `}
      >
        <NuqsAdapter>
          {children}
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
