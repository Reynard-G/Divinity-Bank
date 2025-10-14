"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { UserIcon, PaletteIcon, BellIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";

const navItems = [
  {
    title: "Account",
    icon: <UserIcon size={18} />,
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

export function SettingsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarPath, setSidebarPath] = useState(pathname ?? "/app/settings");

  const handleSelect = (value: string) => {
    setSidebarPath(value);
    router.push(value);
  };

  return (
    <>
      <div className="p-1 md:hidden">
        <Select value={sidebarPath} onValueChange={handleSelect}>
          <SelectTrigger className="h-10 sm:w-48">
            <SelectValue placeholder="Select a page" />
          </SelectTrigger>
          <SelectContent>
            {navItems.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden w-full overflow-x-auto px-1 py-2 md:block">
        <nav
          className={
            "mt-[1px] flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2"
          }
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href
                  ? "bg-muted hover:bg-muted"
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
    </>
  );
}
