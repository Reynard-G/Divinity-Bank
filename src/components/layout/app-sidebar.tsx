"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import {
  IconHome,
  IconServer,
  IconTransfer,
  IconSettings,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils/cn";
import type { Server } from "@/lib/db/schema";
import { createServerRoutes, createServerRoute, SERVER_ROUTES } from "@/lib/utils/server-routes";

interface SidebarItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
}

function SidebarItem({ label, path, icon }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === path || pathname.startsWith(path + "/");

  return (
    <Link
      href={path}
      className={cn(
        "flex items-center rounded-lg p-2 text-sm font-semibold leading-5 text-[#a0a0a0] no-underline transition-colors duration-100",
        isActive
          ? "bg-[#282828] text-[#ededed]"
          : "hover:bg-[#232323] hover:text-[#ededed]",
      )}
    >
      <div className="flex grow items-center gap-2">
        <div className="relative">{icon}</div>
        <span className="grow">{label}</span>
      </div>
    </Link>
  );
}

function SidebarSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex flex-col gap-0.5 border-b border-b-[#343434] pb-2 last:border-b-0">
      {children}
    </div>
  );
}

export function AppSidebar({ servers }: { servers: Server[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [isServerPopoverOpen, setIsServerPopoverOpen] = useState(false);

  // Extract current server from pathname
  useEffect(() => {
    if (pathname.startsWith('/app/') && servers.length > 0) {
      const page = pathname.match(/^\/app\/server\/([^\/]+)\/?/); // Match /app/server/:server or /app/server/:server/
      const serverFromPath = page ? page[1] : null;
      
      const matchedServer = servers.find(server => server.shortName === serverFromPath);
      if (matchedServer) {
        setSelectedServer(matchedServer);
      } else {
        setSelectedServer(servers[0]);
      }
    }
  }, [pathname, servers]);

  // Get navigation items based on current server
  const getNavigationItems = (serverShortName: string | null) => {
    const baseServer = serverShortName || (servers[0]?.shortName || 'default');
    
    return [
      {
        section: "Main",
        items: [
          {
            label: "Dashboard",
            path: createServerRoutes.dashboard(baseServer),
            icon: <IconHome size={24} aria-hidden="true" />,
          },
          {
            label: "Servers",
            path: createServerRoutes.servers(baseServer),
            icon: <IconServer size={24} aria-hidden="true" />,
          },
        ],
      },
      {
        section: "Actions",
        items: [
          {
            label: "Transactions",
            path: createServerRoutes.transactions(baseServer),
            icon: <IconTransfer size={24} aria-hidden="true" />,
          },
        ],
      },
    ];
  };

  const bottomNavigation = {
    section: "User",
    items: [
      {
        label: "Settings",
        path: "/app/settings",
        icon: <IconSettings size={24} aria-hidden="true" />,
      },
    ],
  };

  // Handle case where no servers are available
  if (!servers || servers.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 top-0 z-0 box-border hidden w-[248px] flex-col border-r border-solid border-r-[#343434] bg-[#1c1c1c] md:flex">
        <div>
          <Link
            className="mx-4 mb-1 mt-6 flex cursor-pointer flex-row gap-2 bg-none p-0 justify-center"
            href="/"
          >
            <img src="/logo.svg" alt="Logo" className="w-12" />
            <h1 className="text-center font-anta text-xl font-bold tracking-wider text-[#ededed]">
              Divinity
            </h1>
          </Link>
        </div>

        <div className="relative px-3 pt-3">
          <div className="w-full rounded-lg border border-[#343434] bg-[#232323] p-3 text-center text-sm text-[#a0a0a0]">
            No servers available
          </div>
        </div>

        <div className="flex h-full flex-col justify-between overflow-y-auto py-3 px-3">
          <div>
            <SidebarSection>
              <div className="text-center text-sm text-[#a0a0a0] py-4">
                Contact admin to get access to servers
              </div>
            </SidebarSection>
          </div>

          <div>
            <SidebarSection>
              {bottomNavigation.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  label={item.label}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
            </SidebarSection>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems(selectedServer?.shortName || null);

  return (
    <div className="fixed bottom-0 left-0 top-0 z-0 box-border hidden w-[248px] flex-col border-r border-solid border-r-[#343434] bg-[#1c1c1c] md:flex">
      {/* Sidebar Brand */}
      <div className="min-h-16 flex flex-col items-center">
        <Link
          className="h-full flex cursor-pointer flex-row gap-2 bg-none p-0 items-center justify-center"
          href="/"
        >
          <img src="/logo.svg" alt="Logo" className="w-12" />
          <h1 className="text-center font-anta text-xl font-bold tracking-wider text-[#ededed]">
            Divinity
          </h1>
        </Link>
      </div>

      {/* Server Selector */}
      <div className="relative px-3 pb-2">
        <Popover
          open={isServerPopoverOpen}
          onOpenChange={setIsServerPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-label="Server selector"
              aria-expanded={isServerPopoverOpen}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2">
                <IconServer size={20} aria-hidden="true" />
                {selectedServer?.name || "Select server"}
              </div>

              {isServerPopoverOpen ? (
                <IconChevronUp size={16} aria-hidden="true" />
              ) : (
                <IconChevronDown size={16} aria-hidden="true" />
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="mx-3 w-[221px] p-0">
            <Command>
              <CommandInput placeholder="Search servers..." />
              <CommandList>
                <CommandEmpty>No servers found.</CommandEmpty>
                <CommandGroup>
                  {servers.map((server) => (
                    <CommandItem
                      key={server.id}
                      onSelect={() => {
                        setSelectedServer(server);
                        setIsServerPopoverOpen(false);
                        // Navigate to the same page type on the new server
                        const page = pathname.match(/^\/app\/server\/[^\/]+\/([^\/]+)/); // Match /app/server/:server/:page
                        const currentPageType = page ? page[1] : SERVER_ROUTES.DASHBOARD;

                        router.push(createServerRoute(server.shortName, currentPageType));
                      }}
                    >
                      <IconCheck
                        size={16}
                        className={cn(
                          "mr-2 h-4 w-4",
                          server.id === selectedServer?.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                        aria-hidden="true"
                      />
                      {server.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Navigation */}
      <div className="flex h-full flex-col justify-between overflow-y-auto py-3 px-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent">
        <div>
          {navigationItems.map((section) => (
            <SidebarSection key={section.section}>
              {section.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  label={item.label}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
            </SidebarSection>
          ))}
        </div>

        <div>
          <SidebarSection>
            {bottomNavigation.items.map((item) => (
              <SidebarItem
                key={item.label}
                label={item.label}
                path={item.path}
                icon={item.icon}
              />
            ))}
          </SidebarSection>
        </div>
      </div>
    </div>
  );
}
