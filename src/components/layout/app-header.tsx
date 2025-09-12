"use client";

import { useRouter } from "nextjs-toploader/app";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { logout } from "@/lib/db/actions/auth.actions";
import type { UserForComponents } from "@/app/app/layout";
import { IconBrandDiscord } from "@tabler/icons-react";

export function AppHeader({ user }: { user: UserForComponents }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
  };

  const handleSettings = () => {
    router.push("/app/settings");
  };

  return (
    <nav className="sticky top-0 flex h-16 items-center border-b border-b-[#343434] bg-[#1c1c1c] px-4 py-2 pl-5">
      <div className="hidden flex-auto items-center justify-end gap-4 md:flex">
        <Button variant="outline" asChild>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
          >
            <IconBrandDiscord size={20} />
            Discord
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="rounded shadow-[0px_0px_0px_1px_#161616] transition-shadow duration-200 hover:shadow-[0px_0px_0px_3px_#383838]">
              <AvatarImage
                src={user.image}
                alt="User Avatar"
              />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettings}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
