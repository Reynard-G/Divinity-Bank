"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { WrenchIcon, PaletteIcon, BellIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const sidebarNavItems = [
  {
    title: "Account",
    icon: <WrenchIcon size={18} />,
    href: "/app/settings/account",
  },
  {
    title: "Appearance",
    icon: <PaletteIcon size={18} />,
    href: "/app/settings/appearance",
  },
  {
    title: "Notifications",
    icon: <BellIcon size={18} />,
    href: "/app/settings/notifications",
  },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full overflow-x-auto px-1 py-2">
      <nav className="mt-px flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
        {sidebarNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <span className="mr-2">{item.icon}</span>
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}
