import "./globals.css";
import { UnauthorizedView } from "@/components/errors/unauthorized-view";
import { FONT_CLASSNAMES } from "@/lib/constants/fonts";
import { cn } from "@/lib/utils/cn";

/**
 * Supplies its own html/body for the same reason as not-found.tsx: it sits
 * above both root layouts and so inherits neither.
 */
export default function Unauthorized() {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={cn(FONT_CLASSNAMES.Default, "tracking-wide antialiased")}
      >
        <UnauthorizedView />
      </body>
    </html>
  );
}
