"use client";

import { useRouter } from "nextjs-toploader/app";

import type { UserForComponents } from "@/app/app/layout";
import { DiscordSVG } from "@/components/svg/discord";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/db/actions/auth.actions";

export function AppHeader({ user }: { user: UserForComponents }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
  };

  const handleSettings = () => {
    router.push("/app/settings");
  };

  return (
    <nav className="sticky top-0 z-10 flex h-16 items-center border-b border-b-[#3b3b3b] bg-header px-4 py-2 pl-5">
      <div className="hidden flex-auto items-center justify-end gap-4 md:flex">
        <Button variant="outline" asChild>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2"
          >
            <DiscordSVG className="h-6 w-6 fill-current" />
            Discord
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 rounded transition-[filter] duration-200 hover:brightness-[120%] hover:contrast-[80%]">
              <AvatarImage src={user.image} alt="User Avatar" />
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettings}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
