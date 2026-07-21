import type { Metadata } from "next";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth/jwt";
import { FONT_CLASSNAMES } from "@/lib/constants/fonts";
import { SITE_METADATA } from "@/lib/constants/site-metadata";
import { cn } from "@/lib/utils/cn";

type FontName = keyof typeof FONT_CLASSNAMES;

export const metadata: Metadata = SITE_METADATA;

export default async function MainLayout({
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
