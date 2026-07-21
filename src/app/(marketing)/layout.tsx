import type { Metadata } from "next";

import "../globals.css";
import { FONT_CLASSNAMES } from "@/lib/constants/fonts";
import { SITE_METADATA } from "@/lib/constants/site-metadata";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = SITE_METADATA;

/**
 * Deliberately reads no session, which is what lets everything under this
 * layout prerender statically. The font is fixed to the default rather
 * than the per-user preference: this surface is logged-out, its typography
 * is design-fixed, and reading the preference would need cookies and drag
 * the whole subtree back into dynamic rendering.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={cn(FONT_CLASSNAMES.Default, "tracking-wide antialiased")}
      >
        {children}
      </body>
    </html>
  );
}
