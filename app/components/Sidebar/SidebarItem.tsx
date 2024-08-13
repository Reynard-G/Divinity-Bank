import { NavLink } from "@remix-run/react";
import { ReactNode } from "react";

import { cn } from "~/lib/utils/cn";

interface SubmenuEntryProps {
  label: string;
  path: string;
  activePath?: string;
}

interface MenuItemProps {
  label: string;
  icon: ReactNode;
  path: string;
  activePath?: string;
  startOpen?: boolean;
  entries?: SubmenuEntryProps[];
}

export default function SidebarItem({ label, icon, path }: MenuItemProps) {
  return (
    <div className="relative">
      <NavLink
        to={path}
        prefetch="intent"
        className={({ isActive }) =>
          cn(
            "flex items-center rounded-lg p-2 text-sm font-semibold leading-5 text-[#a0a0a0] no-underline transition-colors duration-100",
            isActive
              ? "bg-[#282828] text-[#ededed]"
              : "hover:bg-[#232323] hover:text-[#ededed]",
          )
        }
      >
        <div className="flex items-center gap-2">
          <div className="relative">{icon}</div>
          {label}
        </div>
      </NavLink>
    </div>
  );
}
