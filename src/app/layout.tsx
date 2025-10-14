import type { Metadata } from "next";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth/jwt";
import { FONT_CLASSNAMES } from "@/lib/constants/fonts";
import { cn } from "@/lib/utils/cn";

type FontName = keyof typeof FONT_CLASSNAMES;

export const metadata: Metadata = {
  title: "Divinity Bank",
  description: "Secure financial management for Minecraft servers",
  keywords: ["banking", "minecraft", "finance", "transactions"],
  authors: [{ name: "Divinity Bank Team" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={cn(
          FONT_CLASSNAMES[session?.font as FontName] ?? FONT_CLASSNAMES.Default,
          "tracking-wide antialiased"
        )}
      >
        <NuqsAdapter>{children}</NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
