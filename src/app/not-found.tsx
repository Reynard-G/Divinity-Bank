import "./globals.css";
import { NotFoundView } from "@/components/errors/not-found-view";
import { FONT_CLASSNAMES } from "@/lib/constants/fonts";
import { cn } from "@/lib/utils/cn";

/**
 * Renders its own document shell. With two root layouts under (marketing)
 * and (main), a URL matching neither group has no layout to inherit, so
 * this file has to supply html/body itself.
 */
export default function NotFound() {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={cn(FONT_CLASSNAMES.Default, "tracking-wide antialiased")}
      >
        <NotFoundView />
      </body>
    </html>
  );
}
